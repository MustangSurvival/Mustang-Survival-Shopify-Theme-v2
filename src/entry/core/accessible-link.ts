import { BaseElementWithoutShadowDOM } from '@/base/BaseElement'
import { customElement, property } from 'lit/decorators.js'

/*
 * A wrapper component that can be used on say, content card, so that the text and image can be clickable
 * without having to make the whole card a link (which is too much content for a screen reader to read),
 * wrap each item in a link (which creates redundant links), or position one link absolutely over the card
 * (which can sometimes be difficult stylistically)
 *
 * ex. <accessible-link href="{{ section.settings.cta_link }}">
 *       <img url="{{ section.settings.image.url }}" alt="{{ section.settings.image.alt }}">
 *     </accessible-link>
 */

@customElement('accessible-link')
export class AccessibleLink extends BaseElementWithoutShadowDOM {
  @property({ type: String, attribute: 'href' })
  href!: string

  connectedCallback(): void {
    if (this.href) {
      this.addEventListener('click', () => {
        window.location.href = this.href
      })
    }
  }
}
