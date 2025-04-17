import SwiperElement from '@/base/SwiperElement'
import { customElement } from 'lit/decorators.js'

// Let's basic instance Swiper Extend Custom Plugins
@customElement('basic-swiper')
export class BasicSwiper extends SwiperElement {
  swiperOptions = {}
}
