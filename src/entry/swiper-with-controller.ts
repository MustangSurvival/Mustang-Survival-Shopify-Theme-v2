import SwiperElement from '@/base/SwiperElement'
import { customElement, property } from 'lit/decorators.js'
import type { SwiperContainer } from 'swiper/element/bundle'
import type { Swiper } from 'swiper/types'

@customElement('swiper-with-controller')
export class SwiperWithController extends SwiperElement {
  @property({ type: String, attribute: 'controller' })
  controller = ''

  swiperOptions = {
    on: {
      init: (swiper: Swiper) => {
        const controller = document.querySelector(
          this.controller
        ) as SwiperContainer
        if (controller) {
          swiper.controller.control = controller.swiper
          controller.swiper.controller.control = swiper
        }
      },
    },
  }
}
