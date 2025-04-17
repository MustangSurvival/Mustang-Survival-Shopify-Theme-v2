import type { Swiper } from 'swiper'
import type { SwiperModule } from 'swiper/types'

export const inertSlidesPlugin: SwiperModule = ({
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
  const handleInertSlides = (swiper: Swiper) => {
    swiper.slides.forEach((slide: HTMLElement) => {
      if (slide.classList.contains('swiper-slide-visible')) {
        slide.removeAttribute('inert')
        slide.removeAttribute('aria-hidden')
        const focusable = slide.querySelectorAll('a, button')
        focusable.forEach((el) => {
          el.setAttribute('tabindex', '0')
        })
      } else {
        slide.setAttribute('inert', '')
        slide.setAttribute('aria-hidden', 'true')
        const focusable = slide.querySelectorAll('a, button')
        focusable.forEach((el) => {
          el.setAttribute('tabindex', '-1')
        })
      }
    })
  }

  on('init', (swiper) => {
    handleInertSlides(swiper)
  })

  on('slideChangeTransitionEnd', () => {
    handleInertSlides(swiper)
  })

  extendParams({
    watchSlidesProgress: true,
  })
}

export default inertSlidesPlugin
