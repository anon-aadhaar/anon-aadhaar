import { AnonAadhaarArgs } from '@anon-aadhaar/core'
import { createContext, useContext } from 'react'

/**
 * `useAnonAadhaar` is a custom React hook that provides convenient access to the Anon Aadhaar authentication state
 * and a function to initiate the login process. This hook is designed to be used within components that are
 * nested inside `AnonAadhaarProvider`.
 *
 * @returns { [AnonAadhaarState, (request: AnonAadhaarRequest) => void] }
 * An array containing:
 *   - `AnonAadhaarState`: The current state of the Anon Aadhaar authentication process. This includes any relevant
 *     data about the current authentication status, user information, or error states.
 *   - `startReq`: A function that initiates the login/logout process. This function takes an `AnonAadhaarRequest` object
 *     as its argument, which includes the necessary information to start the authentication process.
 */
export function useProver(): [proverState] {
  const val = useContext(ProverContext)
  return [val.state]
}

export const ProverContext = createContext<ProverContextVal>({
  state: { status: 'off' },
})

export interface ProverContextVal {
  state: proverState
}

export type AnonAadhaarRequest =
  | { type: 'login'; args: AnonAadhaarArgs }
  | { type: 'logout' }

export type proverState = {
  /** Whether the user is logged in. @see ProveButton */
  status: 'off' | 'ready' | 'proving'
} & (
  | {
      status: 'off'
    }
  | {
      status: 'ready'
    }
  | {
      status: 'proving'
    }
)
