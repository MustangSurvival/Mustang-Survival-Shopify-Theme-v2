export const lastFocusableElement = (
  element: HTMLElement
): HTMLElement | null => {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  return focusableElements[focusableElements.length - 1] as HTMLElement
}

export default lastFocusableElement
