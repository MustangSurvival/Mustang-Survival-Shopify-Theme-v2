import type { ModalDialog } from './core/core-dialog'
import type { AddToCartEventPayload } from '@/custom_typings/shopify'
import defer from 'defer-promise'

type NostoRecommendationsType = {
  html?: string
  products?: any[]
  title: string
  result_id: string
}

type NostoResponse = {
  recommendations: Record<string, NostoRecommendationsType>
}

class NostoRecommendations {
  static initialized = false

  _defferedPromise: DeferPromise.Deferred<NostoResponse> | null = null
  _loaded = false
  _skippedPlacements: string[] = []
  _nostoResponse!: NostoResponse

  constructor() {
    if (!window.nostojs) {
      throw new Error('Nosto Not initialized')
    }
    this.initializeNosto = this.initializeNosto.bind(this)
    this._renderNostoInjectCampaigns =
      this._renderNostoInjectCampaigns.bind(this)
    this._callback = this._callback.bind(this)
    this._errorCallback = this._errorCallback.bind(this)
    this._defferedPromise = defer()
    this._skippedPlacements = []
    this._attachListeners()
  }

  _attachListeners() {
    window.addEventListener('DOMContentLoaded', () => this.initializeNosto())

    document.addEventListener('cart:items-added', ((
      event: CustomEvent<AddToCartEventPayload>
    ) => {
      const items = event.detail.items || []
      const target = event.detail.target

      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const productId = item.product_id
        const parentModal = (target?.getRootNode() as ShadowRoot)
          .host as ModalDialog | null
        const placementId =
          target?.closest('.nosto_element')?.id ||
          parentModal?.urlParams.get('nosto')

        if (placementId && placementId !== '')
          this.trackAddToCart(String(productId), placementId)
      }
    }) as EventListener)

    document.addEventListener('quickshop::open', (event) => {
      const target = event.target as HTMLElement | null
      const productId = target
        ?.closest('[product-id]')
        ?.getAttribute('product-id')
      const placementId = target?.closest('.nosto_element')?.id

      if (!productId) return

      if (placementId && placementId !== '')
        this.trackProductView(productId, placementId)
    })
  }

  async initializeNosto(placementIDs: string[] = []) {
    if (NostoRecommendations.initialized) {
      if (this._loaded) {
        return this._renderNostoInjectCampaigns(this._nostoResponse)
      } else {
        await this._defferedPromise?.promise
        return this._renderNostoInjectCampaigns(this._nostoResponse)
      }
    }

    window.nostojs?.((api) => {
      const request = api.createRecommendationRequest({
        includeTagging: true,
      })
      if (Array.isArray(placementIDs) && placementIDs.length > 0) {
        request.setElements(placementIDs)
      }

      request
        .setResponseMode('JSON_ORIGINAL')
        .load()
        .then((res: NostoResponse) => {
          this._renderNostoInjectCampaigns(res)
          this._callback(res)

          if (this._skippedPlacements.length) {
            console.warn(
              'No templates found for the following placements: ',
              this._skippedPlacements
            )
            console.log('Loading default Nosto templates instead')

            api
              .createRecommendationRequest()
              .setElements(this._skippedPlacements)
              .loadRecommendations()
          }
        })
        .catch(this._errorCallback)
    })

    NostoRecommendations.initialized = true
  }

  _renderNostoInjectCampaigns(res: NostoResponse) {
    const content: Record<string, string | void> = {}

    Object.keys(res.recommendations).forEach((id) => {
      if (res.recommendations[id].html) {
        // If there is a html content, inject it directly
        content[id] = res.recommendations[id].html
      }

      if (res.recommendations[id].products) {
        const generatedHTML = this.renderMarkup(res.recommendations[id], id)

        // In case there is an error skip this
        if (generatedHTML) {
          content[id] = generatedHTML
        } else {
          this._skippedPlacements.push(id)
        }
      }
    })

    window.nostojs?.((api) => {
      api.placements.injectCampaigns(content)
    })
  }

  get nostoTemplates() {
    return document.getElementById(
      'nosto-templates'
    ) as HTMLTemplateElement | null
  }

  renderMarkup(recommendation: NostoRecommendationsType, id: string) {
    if (!this.nostoTemplates) {
      return
    }

    const nostoElement = document.getElementById(id)

    if (!nostoElement) {
      return ''
    }

    const templateType = nostoElement.getAttribute('data-template-type') || ''
    const template = (
      this.nostoTemplates.content.cloneNode(true) as HTMLElement
    ).querySelector(`[data-template-type="${templateType}"]`)

    if (!template) return ''

    const title = recommendation.title
    const products = recommendation.products

    template.innerHTML = template.innerHTML
      .replaceAll('%%result_id%%', recommendation.result_id)
      .replaceAll('%%title%%', title)
      .replaceAll('%%products%%', encodeURIComponent(JSON.stringify(products)))

    return template.innerHTML
  }

  _callback(response: NostoResponse) {
    this._nostoResponse = response
    this._loaded = true
    this._defferedPromise?.resolve(this._nostoResponse)
  }

  _errorCallback(error: unknown) {
    this._defferedPromise?.reject(error)
  }

  trackAddToCart(productId: string, placementID: string) {
    window.nostojs?.((api) => {
      api.recommendedProductAddedToCart(productId, placementID)
    })
  }

  trackProductView(productId: string, placementID: string) {
    window.nostojs?.((api) => {
      api
        .createRecommendationRequest()
        .setProducts([{ product_id: productId }], placementID)
        .load()
    })
  }
}

window.__NOSTO_RECOMMENDER__ = new NostoRecommendations()
