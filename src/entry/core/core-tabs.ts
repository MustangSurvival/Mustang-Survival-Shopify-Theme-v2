import { BaseElementWithoutShadowDOM } from '@/base/BaseElement'
import { customElement, queryAll } from 'lit/decorators.js'

@customElement('component-tabs')
export class Tabs extends BaseElementWithoutShadowDOM {
  // buttons along the top
  @queryAll('[role=tab]')
  private tabs!: NodeListOf<HTMLElement>

  // content for each tab
  @queryAll('[role=tabpanel]')
  private tabpanels!: NodeListOf<HTMLElement>

  firstTab!: HTMLElement
  lastTab!: HTMLElement

  connectedCallback(): void {
    super.connectedCallback()
    if (this.tabs.length === 0) return

    this.firstTab = this.tabs[0]
    this.lastTab = this.tabs[this.tabs.length - 1]

    this.tabs.forEach((tab) => {
      tab.addEventListener('keydown', this.onKeydown.bind(this))
      tab.addEventListener('click', this.onClick.bind(this))
    })
  }

  disconnectedCallback(): void {
    this.tabs.forEach((tab) => {
      tab.removeEventListener('keydown', this.onKeydown.bind(this))
      tab.removeEventListener('click', this.onClick.bind(this))
    })
  }

  _handleEnableTab(tab: HTMLElement, i: number) {
    tab.setAttribute('aria-selected', 'true')
    tab.removeAttribute('tabindex')
    this.tabpanels[i].classList.remove('hidden')
    tab.focus()
  }

  _handleDisableTab(tab: HTMLElement, i: number) {
    tab.setAttribute('aria-selected', 'false')
    tab.tabIndex = -1
    this.tabpanels[i].classList.add('hidden')
  }

  setSelectedTab(currentTab: HTMLElement) {
    this.tabs.forEach((tab, i) => {
      if (currentTab === tab) {
        this._handleEnableTab(tab, i)
      } else {
        this._handleDisableTab(tab, i)
      }
    })
  }

  setSelectedToTab(currentTab: HTMLElement, direction: number = 1) {
    let index
    if (direction == 1 && currentTab == this.lastTab) {
      this.setSelectedTab(this.firstTab)
    } else if (direction == -1 && currentTab == this.firstTab) {
      this.setSelectedTab(this.lastTab)
    } else {
      index = Array.from(this.tabs).indexOf(currentTab)
      this.setSelectedTab(this.tabs[index + direction])
    }
  }

  onKeydown(event: KeyboardEvent) {
    const target = event.target as HTMLElement
    let preventDefault = false

    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        this.setSelectedToTab(target, -1)
        preventDefault = true
        break
      case 'ArrowRight':
      case 'ArrowDown':
        this.setSelectedToTab(target, 1)
        preventDefault = true
        break
      case 'Home':
        this.setSelectedTab(this.firstTab)
        preventDefault = true
        break
      case 'End':
        this.setSelectedTab(this.lastTab)
        preventDefault = true
        break
      default:
        break
    }

    if (preventDefault) {
      event.stopPropagation()
      event.preventDefault()
    }
  }

  onClick(event: MouseEvent) {
    this.setSelectedTab(event.currentTarget as HTMLElement)
  }
}
