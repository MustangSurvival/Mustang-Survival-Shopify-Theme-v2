/**
 * Creates a debounced function that delays invoking the provided function until after
 * a specified number of milliseconds have elapsed since the last time the debounced
 * function was invoked.
 *
 * @param fn - The function to debounce.
 * @param ms - The number of milliseconds to delay. Defaults to 300ms.
 * @returns A new debounced function.
 */
export const debounce = (fn: Function, ms = 300) => {
  let timeoutId: ReturnType<typeof setTimeout>
  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn.apply(this, args), ms)
  }
}

export const ON_CHANGE_DEBOUNCE_TIMER = 300
