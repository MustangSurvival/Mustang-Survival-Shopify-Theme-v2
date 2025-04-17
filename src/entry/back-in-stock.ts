import { BaseElementWithoutShadowDOM } from '@/base/BaseElement'
import { createApiClient } from '@/mixins/WithApiClient'
import { Task, TaskStatus } from '@lit/task'
import { PropertyValues } from 'lit'
import { customElement, property, query } from 'lit/decorators.js'

@customElement('back-in-stock')
export class BackInStock extends BaseElementWithoutShadowDOM {
  @property({ type: String, attribute: 'company-id' })
  companyId: string = ''

  @property({ type: String, attribute: 'list-id' })
  listId: string = ''

  @property({ type: String, attribute: 'variant-id' })
  variantId: string = ''

  @query('form')
  form: HTMLFormElement | undefined

  @query('[type="submit"]')
  submitButton: HTMLButtonElement | undefined

  @query('.js-success-message')
  successMessage: HTMLElement | undefined

  @query('.js-error-message')
  errorMessage: HTMLElement | undefined

  $klaviyoApi = createApiClient({
    baseUrl: 'https://a.klaviyo.com/client',
    headers: {
      revision: '2024-10-15',
      'Content-Type': 'application/json',
    },
  })

  protected firstUpdated(_changedProperties: PropertyValues): void {
    super.firstUpdated(_changedProperties)

    this.form?.addEventListener('submit', this.handleSubmit.bind(this))
  }

  private async handleSubmit(evt: Event): Promise<void> {
    evt.preventDefault()

    this.toggleError(false)

    if (!this.companyId || !this.listId) {
      return this.adminError()
    }

    const formData = new FormData(this.form)
    const email = formData.get('email') as string

    this.submitButton?.setAttribute('disabled', 'true')

    try {
      await this.createBackInStockSubscriptionTask.run([this.variantId, email])

      if (this.createBackInStockSubscriptionTask.status === TaskStatus.ERROR) {
        throw new Error('Back in stock subscription error')
      }

      if (formData.get('consent')) {
        await this.createEmailSubscriptionTask.run([email])

        if (this.createEmailSubscriptionTask.status === TaskStatus.ERROR) {
          throw new Error('Email subscription error')
        }
      }

      this.handleSuccess()
    } catch (error) {
      console.error(error)
      this.toggleError(true)
    } finally {
      this.submitButton?.removeAttribute('disabled')
    }
  }

  private createBackInStockSubscriptionTask = new Task(this, {
    task: async ([variantId, email]) => {
      if (!this.companyId || !variantId || !email) return

      const response = await this.$klaviyoApi(
        `/back-in-stock-subscriptions/`,
        {
          method: 'POST',
          body: {
            data: {
              type: 'back-in-stock-subscription',
              attributes: {
                profile: {
                  data: {
                    type: 'profile',
                    attributes: { email },
                  },
                },
                channels: ['EMAIL'],
              },
              relationships: {
                variant: {
                  data: {
                    type: 'catalog-variant',
                    id: `$shopify:::$default:::${variantId}`,
                  },
                },
              },
            },
          },
        },
        {
          params: {
            company_id: this.companyId,
          },
        }
      )

      return response
    },
  })

  private createEmailSubscriptionTask = new Task(this, {
    task: async ([email]) => {
      if (!this.companyId || !this.listId || !email) return

      const response = await this.$klaviyoApi(
        `/subscriptions/`,
        {
          method: 'POST',
          body: {
            data: {
              type: 'subscription',
              attributes: {
                profile: {
                  data: {
                    type: 'profile',
                    attributes: { email },
                  },
                },
              },
              relationships: {
                list: {
                  data: {
                    type: 'list',
                    id: this.listId,
                  },
                },
              },
            },
          },
        },
        {
          params: {
            company_id: this.companyId,
          },
        }
      )

      return response
    },
    onError: (error) => {
      console.error(error)

      this.toggleError(true)
      throw new Error('Klaviyo API error')
    },
  })

  private handleSuccess(): void {
    this.$emit('bis:success')
    this.successMessage?.classList.remove('hidden')
  }

  private adminError(): void {
    console.error(
      'Klaviyo Company ID or List ID not set in theme editor settings'
    )
    this.submitButton?.setAttribute('disabled', 'true')
    this.toggleError(true)
  }

  private toggleError(flag: boolean | undefined = undefined): void {
    typeof flag === 'undefined'
      ? this.errorMessage?.classList.toggle('hidden')
      : this.errorMessage?.classList.toggle('hidden', !flag)
  }
}
