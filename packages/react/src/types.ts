import { AnonAadhaarCore, AnonAadhaarArgs } from '@anon-aadhaar/core'
import { SerializedPCD } from '@pcd/pcd-types'

export interface AnonAadhaarContextVal {
  state: AnonAadhaarState
  startReq: (request: AnonAadhaarRequest) => void
  useTestAadhaar: boolean
}

export type AnonAadhaarRequest =
  | { type: 'login'; args: AnonAadhaarArgs }
  | { type: 'logout' }

export type AnonAadhaarState = {
  /** Whether the user is logged in. @see ProveButton */
  status: 'logged-out' | 'logged-in' | 'logging-in'
} & (
  | {
      status: 'logged-out'
    }
  | {
      status: 'logging-in'
    }
  | {
      status: 'logged-in'
      serializedAnonAadhaarProof: SerializedPCD<AnonAadhaarCore>
      anonAadhaarProof: AnonAadhaarCore
    }
)
