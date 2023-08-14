import { IdentityPCD, IdentityPCDArgs } from 'pcd-country-identity'
import { createContext, useContext } from 'react'
import { SerializedPCD } from '@pcd/pcd-types'

/**
 * useCountryIdentity is a custom React hook that provides access to the authentication
 * state and the login request function from the CountryIdentityContext. This hook
 * is intended to be used within components that are descendants of the
 * CountryIdentityProvider.
 *
 * @returns An array containing:
 *   - The authentication state (CountryIdentityState) obtained from the context.
 *   - The login request function (startReq) obtained from the context.
 */
export function useCountryIdentity(): [
  CountryIdentityState,
  (request: CountryIdentityRequest) => void,
] {
  const val = useContext(CountryIdentityContext)
  return [val.state, val.startReq]
}

export const CountryIdentityContext = createContext<CountryIdentityContextVal>({
  state: { status: 'logged-out' },
  startReq: () => {},
})

export interface CountryIdentityContextVal {
  state: CountryIdentityState
  startReq: (request: CountryIdentityRequest) => void
}

export type CountryIdentityRequest =
  | { type: 'login'; args: IdentityPCDArgs }
  | { type: 'logout' }

export type CountryIdentityState = {
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
      serializedPCD: SerializedPCD<IdentityPCD>
      pcd: IdentityPCD
    }
)
