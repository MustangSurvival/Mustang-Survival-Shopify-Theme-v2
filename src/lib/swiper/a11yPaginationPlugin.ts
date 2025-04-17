import type { Swiper } from 'swiper'
import type { PaginationOptions, SwiperModule } from 'swiper/types'

export const a11yPaginationPlugin: SwiperModule = ({
  swiper,
  // on,
  extendParams,
}: {
  swiper: Swiper
  on: Swiper['on']
  extendParams: (obj: { [name: string]: any }) => void
  once: Swiper['once']
}) => {
  if (swiper.pagination.el) {
    extendParams({
      pagination: {
        clickable: true,
        renderBullet: (index, className) => {
          return `<button type="button" class="${className}" aria-label="Show slide ${index}"></button>`
        },
      } as PaginationOptions,
    })
  }
}

export default a11yPaginationPlugin
