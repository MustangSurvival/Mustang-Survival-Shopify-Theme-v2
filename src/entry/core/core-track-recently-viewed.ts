import { BaseElementWithoutShadowDOM } from '@/base/BaseElement'
import recentlyViewedStorage from '@/lib/recentlyViewedStorage'
import { customElement, property } from 'lit/decorators.js'

@customElement('track-recently-viewed')
export class TrackRecentlyViewed extends BaseElementWithoutShadowDOM {
  @property({ type: String, attribute: 'product-handle' })
  productHandle!: string

  connectedCallback() {
    super.connectedCallback()
    !!this.productHandle && recentlyViewedStorage.add(this.productHandle)
  }
}
