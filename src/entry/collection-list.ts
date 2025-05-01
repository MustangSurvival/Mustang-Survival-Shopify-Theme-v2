import { BaseElementWithoutShadowDOM } from '@/base/BaseElement'
import { customElement, queryAll } from 'lit/decorators.js'

@customElement('collection-list')
export class CollectionList extends BaseElementWithoutShadowDOM {
  @queryAll('swiper-slide')
  private collections!: NodeListOf<HTMLElement>

  constructor() {
    super()
    this._handleMouseEnter = this._handleMouseEnter.bind(this)
    this._handleMouseLeave = this._handleMouseLeave.bind(this)

    console.log(this.collections)
  }

  connectedCallback(): void {
    super.connectedCallback()
    this.collections.forEach((collection) => {
      collection.addEventListener('mouseenter', this._handleMouseEnter)
      collection.addEventListener('mouseleave', this._handleMouseLeave)
    })
  }

  disconnectedCallback(): void {
    super.disconnectedCallback()
    this.collections.forEach((collection) => {
      collection.removeEventListener('mouseenter', this._handleMouseEnter)
      collection.removeEventListener('mouseleave', this._handleMouseLeave)
    })
  }

  _handleMouseEnter(event: Event) {
    this.collections.forEach((collection) => {
      console.log(collection === event.currentTarget, collection)
      if (collection !== event.currentTarget) {
        collection.classList.add('grayscale')
        collection.classList.remove('grayscale-0')
      }
    })
  }

  _handleMouseLeave() {
    this.collections.forEach((collection) => {
      collection.classList.remove('grayscale')
      collection.classList.add('grayscale-0')
    })
  }
}
