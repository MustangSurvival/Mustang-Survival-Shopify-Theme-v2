import { BaseElementWithoutShadowDOM } from '@/base/BaseElement'
import { customElement } from 'lit/decorators.js'

@customElement('newsletter-form')
export class NewsletterForm extends BaseElementWithoutShadowDOM {
  toggleCheckbox!: HTMLInputElement
  emailInput!: HTMLInputElement
  submit!: HTMLInputElement
  emailError!: HTMLElement
  agreementError!: HTMLElement

  constructor() {
    super()
    this.onChange = this.onChange.bind(this)
  }

  connectedCallback(): void {
    this.toggleCheckbox = this.querySelector(
      `[data-checkbox]`
    ) as HTMLInputElement

    this.emailInput = this.querySelector(`[data-email]`) as HTMLInputElement
    this.submit = this.querySelector(`[data-submit]`) as HTMLInputElement
    this.emailError = this.querySelector(
      `[data-error-email]`
    ) as HTMLInputElement
    this.agreementError = this.querySelector(
      `[data-error-agreement]`
    ) as HTMLInputElement

    this.toggleCheckbox.addEventListener('change', this.onChange.bind(this))
    this.emailInput.addEventListener('change', this.onChange.bind(this))
  }

  onChange(): void {
    const email = this.emailInput.value
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const isEmailValid = emailPattern.test(email)
    const isAgreementChecked = this.toggleCheckbox.checked

    this.toggleError(this.emailError, isEmailValid)
    this.toggleError(this.agreementError, isAgreementChecked)

    this.submit.disabled = !(isEmailValid && isAgreementChecked)
  }

  private toggleError(element: HTMLElement, isValid: boolean): void {
    if (isValid) {
      element.classList.add('hidden')
      element.classList.remove('flex')
    } else {
      element.classList.remove('hidden')
      element.classList.add('flex')
    }
  }
}
