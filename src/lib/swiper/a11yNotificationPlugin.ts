import type { Swiper } from 'swiper'
import type { SwiperModule } from 'swiper/types'

export const a11yNotificationPlugin: SwiperModule = ({
  swiper,
  on,
  extendParams,
}: {
  swiper: Swiper
  on: Swiper['on']
  extendParams: (obj: { [name: string]: any }) => void
  // params: Swiper['params']
  // once: Swiper['once'];
  // off: Swiper['off'];
  // emit: Swiper['emit'];
}) => {
  const handleAutoplayA11y = (swiper: Swiper) => {
    const element = swiper.el

    if (!swiper.autoplay.running) {
      setTimeout(() => {
        element.querySelector('.swiper-notification')?.remove()
        element.querySelector('.swiper-wrapper')?.removeAttribute('aria-live')
      }, 0)
    }
  }

  on('init', (swiper) => {
    handleAutoplayA11y(swiper)
  })

  on('slideChangeTransitionEnd', () => {
    handleAutoplayA11y(swiper)
  })

  extendParams({
    autoplay: {
      pauseOnMouseEnter: true,
    },
  })
}

export default a11yNotificationPlugin
