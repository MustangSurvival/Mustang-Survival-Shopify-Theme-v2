// Swiper navigation button state management
document.addEventListener('DOMContentLoaded', function () {
  function updateNavigationStates() {
    const swipers = document.querySelectorAll('swiper-container')

    swipers.forEach((container) => {
      if (!container.swiper) return

      const swiper = container.swiper
      const navigation = container.getAttribute('navigation')

      if (navigation) {
        try {
          const navConfig = JSON.parse(navigation)
          const nextBtn = document.querySelector(navConfig.nextEl)
          const prevBtn = document.querySelector(navConfig.prevEl)

          if (nextBtn && prevBtn) {
            // Update button states
            if (swiper.isBeginning) {
              prevBtn.style.opacity = '0.3'
              prevBtn.style.pointerEvents = 'none'
            } else {
              prevBtn.style.opacity = '1'
              prevBtn.style.pointerEvents = 'auto'
            }

            if (swiper.isEnd) {
              nextBtn.style.opacity = '0.3'
              nextBtn.style.pointerEvents = 'none'
            } else {
              nextBtn.style.opacity = '1'
              nextBtn.style.pointerEvents = 'auto'
            }
          }
        } catch (e) {
          console.warn('Invalid navigation JSON:', e)
        }
      }
    })
  }

  // Initialize after a delay to ensure swipers are ready
  setTimeout(() => {
    // Initial state update
    updateNavigationStates()

    // Listen for swiper events
    const swipers = document.querySelectorAll('swiper-container')
    swipers.forEach((container) => {
      if (container.swiper) {
        container.swiper.on('slideChange', updateNavigationStates)
        container.swiper.on('reachBeginning', updateNavigationStates)
        container.swiper.on('reachEnd', updateNavigationStates)
        container.swiper.on('fromEdge', updateNavigationStates)
      }
    })

    // Also listen for swiper initialization events
    document.addEventListener('swiperslidechange', updateNavigationStates)
  }, 1000)

  // Fallback: periodic check in case events don't fire properly
  setInterval(updateNavigationStates, 1000)
})
