import { ON_CHANGE_DEBOUNCE_TIMER, debounce } from './debounce'
import { describe, expect, it, vi } from 'vitest'

describe('debounce function', () => {
  it('should call the function after the specified delay', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const debouncedFn = debounce(fn, 500)

    debouncedFn()
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(500)
    expect(fn).toHaveBeenCalled()
  })

  it('should reset the timer if called again within the delay period', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const debouncedFn = debounce(fn, 500)

    debouncedFn()
    vi.advanceTimersByTime(300)
    debouncedFn()
    vi.advanceTimersByTime(300)
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(200)
    expect(fn).toHaveBeenCalled()
  })

  it('should use the default delay if no delay is provided', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const debouncedFn = debounce(fn)

    debouncedFn()
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(ON_CHANGE_DEBOUNCE_TIMER)
    expect(fn).toHaveBeenCalled()
  })

  it('should call the function with the correct context and arguments', () => {
    vi.useFakeTimers()
    const context = {}
    const fn = vi.fn()
    const debouncedFn = debounce(fn)

    debouncedFn.call(context, 'arg1', 'arg2')
    vi.advanceTimersByTime(ON_CHANGE_DEBOUNCE_TIMER)
    expect(fn).toHaveBeenCalledWith('arg1', 'arg2')
    expect(fn).toHaveReturnedWith(undefined)
    expect(fn).toHaveReturnedTimes(1)
  })
})
