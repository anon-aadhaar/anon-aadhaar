import { Identity } from '@semaphore-protocol/identity'
import { storageService } from '@/utils/storage'

export const createIdentity = async () => {
  const identity = new Identity()

  console.log('creating identity...')

  await storageService.setItem('usersIdentity', identity)
  console.log('identity created')

  return identity
}
