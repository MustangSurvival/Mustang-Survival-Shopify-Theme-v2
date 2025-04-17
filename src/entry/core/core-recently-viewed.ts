import { BaseElementWithoutShadowDOM } from '@/base/BaseElement'
import recentlyViewedStorage from '@/lib/recentlyViewedStorage'
import { customElement, property, query } from 'lit/decorators.js'

@customElement('recently-viewed')
export class RecentlyViewed extends BaseElementWithoutShadowDOM {
  productHandles: string[] = []

  @property({ type: String, attribute: 'exclude-product-handle' })
  excludeProductHandle = ''

  @query('[data-recently-viewed]')
  recentlyViewedContainer!: HTMLElement

  connectedCallback() {
    super.connectedCallback()
    this.productHandles = recentlyViewedStorage
      .list()
      .filter((handle) => handle !== this.excludeProductHandle)

    if (this.productHandles.length === 0) {
      return this.remove()
    }

    this._initialize()
    this.classList.remove('hidden')
  }

  renderProduct(handle: string) {
    return `
      <swiper-slide class='flex-none h-auto justify-center w-7/12 md:w-4/12 lg:w-3/12 px-2'>
        <dynamic-product-card handle='${handle}'></dynamic-product-card>
      </swiper-slide>
    `
  }

  _initialize() {
    if (!this.recentlyViewedContainer) return
    const productCards = this.productHandles.map(this.renderProduct).join('')

    this.recentlyViewedContainer.innerHTML = `
      <swiper-container
        slides-per-view='auto'
        navigation='true'
        class='flex overflow-hidden w-full -mr-2'
      >
        ${productCards}
      </swiper-container>
    `
  }
}
