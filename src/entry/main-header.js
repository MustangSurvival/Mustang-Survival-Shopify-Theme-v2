import { BaseElementWithoutShadowDOM } from '@/base/BaseElement';
import '@/components/mega-menu';


export class MainHeader extends BaseElementWithoutShadowDOM {
  #resizeObserver = new ResizeObserver(() => this.#setHeightCSSProperty())
  promoTakeoverElements
  defaultPromoImage
  defaultPromoText
  promoImage
  originalImageSrc
  originalHeadingText

  #setHeightCSSProperty() {
    const height = this.clientHeight
    document.documentElement.style.setProperty('--header-height', `${height}px`)
  }

  firstUpdated(_changedProperties) {
    super.firstUpdated(_changedProperties)
    this.#setHeightCSSProperty()
    this.#resizeObserver.observe(this)
  }

  disconnectedCallback() {
    this.#resizeObserver.disconnect()
    super.disconnectedCallback()
  }

  connectedCallback() {
    super.connectedCallback()

    this.promoTakeoverElements = this.querySelectorAll('[data-promo-image]')
    this.defaultPromoImage = this.querySelector('[data-promo-default-image]')
    this.defaultPromoText = this.querySelector('[data-promo-default-heading]')
    this.promoImage = this.querySelector('.promo-image')

    this.originalImageSrc = this.promoImage?.getAttribute('src')
    this.originalHeadingText = this.defaultPromoText?.textContent

    this.promoTakeoverElements.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        const newImage = el.getAttribute('data-promo-image')
        const newHeading = el.getAttribute('data-promo-heading')

        if (newImage && this.promoImage) {
          this.promoImage.setAttribute('src', newImage)
        }

        if (newHeading && this.defaultPromoText) {
          this.defaultPromoText.textContent = newHeading
        }
      })

      el.addEventListener('mouseleave', () => {
        if (this.originalImageSrc && this.promoImage) {
          this.promoImage.setAttribute('src', this.originalImageSrc)
        }

        if (this.originalHeadingText && this.defaultPromoText) {
          this.defaultPromoText.textContent = this.originalHeadingText
        }
      })
    })
  }
}

window.customElements.define('main-header', MainHeader)