import { useEffect, useState } from 'react'
import { Identity } from '@semaphore-protocol/identity'
import { storageService } from '@/utils/storage'
import { createIdentity } from '@/identity/identity'

export function useAFKIentity() {
  const [_identity, setIdentity] = useState<Identity | null>(null)

  useEffect(() => {
    storageService.getItem('usersIdentity').then(identity => {
      if (identity !== null) {
        setIdentity(new Identity(identity.privateKey))
        return
      }
      createIdentity()
        .then(newIdentity => {
          setIdentity(newIdentity)
        })
        .catch(e => {
          console.log(e)
        })
    })
  }, [])

  return { _identity }
}
