/// <reference path="./shopify.d.ts" />
interface Window {
  Shopify: {
    routes: {
      root: string
    }
    designMode: boolean
    PaymentButton?: {
      init: () => void
    }
  }

  nostojs?: {
    (callback: (api: NostoClient) => void): void
    q?: unknown[]
  }

  routes: {
    cart_add_url: string
    cart_change_url: string
    cart_update_url: string
    predictive_search_url: string
  }

  __STOREFRONT_ACCESS_TOKEN__: string
  __CART__: ShopifyCart
  __VENDORS__: {
    nosto: {
      enabled: boolean
    }
  }

  __NOSTO_RECOMMENDER__: NostoRecommendations
}
