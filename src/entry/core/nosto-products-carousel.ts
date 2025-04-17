import BaseElementWithoutShadowDOM from '@/base/BaseElement'
import { Task } from '@lit/task'
import { html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { repeat } from 'lit/directives/repeat.js'

@customElement('nosto-products-carousel')
export class NostoProductsCarousel extends BaseElementWithoutShadowDOM {
  @property({ type: String })
  title: string = ''

  @property({ type: String })
  products: string = ''

  @property({ type: String, attribute: 'result-id' })
  resultId: string = ''

  private nostoProductsTask = new Task(this, {
    task: ([products]) => {
      if (typeof products === 'string') {
        return JSON.parse(decodeURIComponent(products))
      }
    },
    args: () => [this.products],
  })

  _renderProductsHTML(products: any[]) {
    return html`<swiper-container
      slides-per-view="auto"
      navigation="true"
      class="-mr-2 flex overflow-hidden"
    >
      ${repeat(
        products,
        (product: any) => product.product_id,
        (product: any) => {
          return html`
            <swiper-slide
              class="h-auto w-7/12 flex-none justify-center px-2 md:w-4/12 lg:w-3/12"
            >
              <dynamic-product-card
                handle="${product.url.split('/').slice(-1)}"
                template="product-card"
                url-postfix="nosto=${this.resultId}"
                product-id="${product.product_id}"
              ></dynamic-product-card>
            </swiper-slide>
          `
        }
      )}
    </swiper-container>`
  }

  render() {
    return html`
      <div class="container py-md">
        ${this.title &&
        html`
          <div class="md:flex md:items-center md:justify-between">
            <h2 class="text-gray-900 h2">${this.title}</h2>
          </div>
        `}

        <div class="py-md">
          ${this.nostoProductsTask.render({
            initial: () => html`<slot></slot>`,
            pending: () => html`<slot></slot>`,
            complete: (products) => this._renderProductsHTML(products),
            error: () => html`<slot></slot>`,
          })}
        </div>
      </div>
    `
  }
}
