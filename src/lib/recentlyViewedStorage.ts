const STORAGE_KEY = 'recently-viewed'
class RecentlyViewedStorage {
  private recentlyViewedHandles: string[] = []
  constructor() {
    this.recentlyViewedHandles = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || '[]'
    )
  }

  add(handle: string) {
    this.recentlyViewedHandles = Array.from(
      new Set([handle, ...this.recentlyViewedHandles].slice(0, 20)) // Keep track of 20 recently viewed products
    )
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(this.recentlyViewedHandles)
    )
  }

  get() {
    return this.recentlyViewedHandles
  }

  clear() {
    localStorage.removeItem(STORAGE_KEY)
    this.recentlyViewedHandles = []
  }

  remove(handle: string) {
    this.recentlyViewedHandles = this.recentlyViewedHandles.filter(
      (h) => h !== handle
    )
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(this.recentlyViewedHandles)
    )
  }

  list() {
    return this.recentlyViewedHandles
  }
}

export const recentlyViewedStorage = new RecentlyViewedStorage()
export default recentlyViewedStorage
