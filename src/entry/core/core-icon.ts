import BaseElement from '@/base/BaseElement';
// @ts-ignore
import styles from '@/styles/component-icon.css?inline';
import { Task } from '@lit/task';
// @ts-ignore
import defer from 'defer-promise';
import { html, nothing, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';


const CACHE_BUSTER = Date.now()
// Usage
// Control the icon size by supplying relevant font-size class to HOST element
// <svg-icon
//     src='icon-close'
//     width='24px'
//     viewBox='0 0 24 24'
//   ></svg-icon>
@customElement('svg-icon')
export class SvgIcon extends BaseElement {
  static loadingCartPromise: DeferPromise.Deferred<void> | null = null
  static svgSpriteCache: string | null = null
  static styles = [unsafeCSS(styles)]
  static metaPathSel: string = `meta[data-svg-sprite-path]`

  private loadSpriteTask = new Task(this, {
    task: async () => {
      if (SvgIcon.svgSpriteCache) {
        return SvgIcon.svgSpriteCache
      }

      const spritePath = this.svgSpritePath

      if (!spritePath) {
        return nothing
      }

      if (SvgIcon.loadingCartPromise) {
        return await SvgIcon.loadingCartPromise.promise
      }
      SvgIcon.loadingCartPromise = defer()

      try {
        const response = await fetch(spritePath)
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        const svgText = await response.text()
        // Clean up the fetched SVG text if necessary
        const parser = new DOMParser()
        const doc = parser.parseFromString(svgText, 'image/svg+xml')
        const svgSprite = doc.documentElement
        svgSprite.style.display = 'none' // Hide the sprite
        SvgIcon.svgSpriteCache = svgSprite.outerHTML

        if (SvgIcon.loadingCartPromise) {
          SvgIcon.loadingCartPromise.resolve()
          SvgIcon.loadingCartPromise = null
        }

        return SvgIcon.svgSpriteCache
      } catch (error) {
        if (SvgIcon.loadingCartPromise) {
          SvgIcon.loadingCartPromise.reject()
          SvgIcon.loadingCartPromise = null
        }
        console.error('Error fetching SVG sprite:', error)
        return error
      }
    },
  })

  constructor() {
    super()
    this.metaEl = document.head.querySelector(
      SvgIcon.metaPathSel
    ) as HTMLElement
  }

  connectedCallback(): void {
    super.connectedCallback()

    if (window.Shopify?.designMode) {
      this.loadSpriteTask.run()
    }
  }

  @property({ type: String })
  src: string | undefined | null

  @property({ type: String })
  inlineStyles: string | undefined

  // Private variables
  private metaEl: HTMLElement | undefined | null

  get runningDevServer() {
    return (
      window.location.hostname === 'localhost' ||
      window.location.hostname.includes('127.0.0') ||
      window.location.hostname.includes('0.0.0') ||
      this.metaEl?.dataset.svgSpritePath?.includes('localhost') ||
      this.metaEl?.dataset.svgSpritePath?.includes('127.0.0')
    )
  }

  get svgSpritePath() {
    // Seems to be fixed after Shopify 3.67.1 Theme CLI Update
    if (this.runningDevServer) {
      return `/assets/icons.svg?cache=${CACHE_BUSTER}` // Dev server
    }
    return this.metaEl?.dataset.svgSpritePath
  }

  get useHref() {
    return `${this.svgSpritePath}#${this.src}`
  }

  generateSVGMarkup(icon: string, additionalStyles: string) {
    return html`
      <svg
        class="block h-full w-full"
        style=${additionalStyles}
        aria-label=${this.ariaLabel || `Icon for ${this.src}`}
      >
        <use crossorigin="anonymous" href=${icon}></use>
      </svg>
    `
  }

  render() {
    if (this.src === undefined || this.src === null || this.src === '') {
      return html`${nothing}`
    }

    if (window.Shopify?.designMode) {
      return html`
        ${this.loadSpriteTask.render({
          complete: () => {
            if (
              !SvgIcon.svgSpriteCache ||
              typeof SvgIcon.svgSpriteCache !== 'string'
            ) {
              return nothing
            }

            return html`
              ${unsafeHTML(SvgIcon.svgSpriteCache)}
              ${
                this.src &&
                this.generateSVGMarkup(`#${this.src}`, this.inlineStyles || '')
              }
            `
          },
        })}
      `
    }

    return this.generateSVGMarkup(this.useHref, this.inlineStyles || '')
  }
}