import { LitElement } from 'lit'

export class ComponentProductCard extends LitElement {
  static properties = {
    defaultImage: { type: String, attribute: 'default-image' },
  }

  defaultImage = ''
  currentImage = ''

  constructor() {
    super()
    this._onFormChange = this._onFormChange.bind(this)
  }

  createRenderRoot() {
    // Use light DOM to wrap existing markup (so you can access and modify it)
    return this
  }

  connectedCallback() {
    super.connectedCallback()
    this.currentImage = this.defaultImage
    document.addEventListener('change', this._onFormChange)
    this._updateImage(this.defaultImage)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    document.removeEventListener('change', this._onFormChange)
  }

  _onFormChange(event) {
    const target = event.target

    console.log({ event })
    if (target.tagName === 'INPUT' && target.closest('form[id$="-swatches"]')) {
      const selected = target.closest('li[data-option-value]')
      const image = selected?.getAttribute('data-variant-image')

      console.log({ selected, image })
      if (image) {
        this._updateImage(image)
      } else {
        this._updateImage(this.defaultImage)
      }
    }
  }

  _updateImage(src) {
    const img = this.querySelector('[data-product-image]')
    if (img) {
      img.src = src
    }
  }
}

customElements.define('product-card', ComponentProductCard)
