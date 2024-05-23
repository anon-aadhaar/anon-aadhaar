/* eslint-disable @typescript-eslint/no-explicit-any */
import localforage from 'localforage'

export const storageService = {
  async setItem(key: string, value: any): Promise<void> {
    return await localforage.setItem(key, value)
  },

  async getItem(key: string): Promise<any> {
    return await localforage.getItem(key)
  },
}
