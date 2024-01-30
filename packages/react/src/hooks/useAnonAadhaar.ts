import { AnonAadhaarCore, AnonAadhaarArgs } from '@anon-aadhaar/core'
import { createContext, useContext } from 'react'
import { SerializedPCD } from '@pcd/pcd-types'

/**
 * useAnonAadhaar is a custom React hook that provides access to the authentication
 * state and the login request function from the AnonAadhaarContext. This hook
 * is intended to be used within components that are descendants of the
 * AnonAadhaarProvider.
 *
 * @returns An array containing:
 *   - The authentication state (AnonAadhaarState) obtained from the context.
 *   - The login request function (startReq) obtained from the context.
 */
export function useAnonAadhaar(): [
  AnonAadhaarState,
  (request: AnonAadhaarRequest) => void,
] {
  const val = useContext(AnonAadhaarContext)
  return [val.state, val.startReq]
}

export const AnonAadhaarContext = createContext<AnonAadhaarContextVal>({
  state: { status: 'logged-out' },
  startReq: () => {
    // StartReq
  },
  useTestAadhaar: true,
})

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
