/* eslint-disable @typescript-eslint/no-explicit-any */
export class MockLocalForage {
  store: { [key: string]: any }

  constructor() {
    this.store = {}
  }

  async getItem(key: string) {
    return this.store[key] || null
  }

  async setItem(key: string, value: any) {
    this.store[key] = value
    return value
  }

  async clear() {
    this.store = {}
  }
}
