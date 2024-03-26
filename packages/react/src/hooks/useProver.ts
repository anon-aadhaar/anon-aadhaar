import { useContext, useEffect, useState } from 'react'
import { AnonAadhaarContext } from './useAnonAadhaar'
import { ProverState } from '@anon-aadhaar/core'

/**
 * `useProver` is a custom React hook that manages the state related to Anon Aadhaar authentication within the application.
 * It facilitates access to the authentication state and exposes a function to handle login or logout requests.
 * This hook should be used within components wrapped by `AnonAadhaarProvider` to ensure access to the appropriate context.
 *
 * @returns { [ProverState, AnonAadhaarCore | undefined] }
 * A tuple (2-element array) where the first element is the `ProverState`, representing the current state of the
 * authentication process, which includes information like authentication status, user details, or any error information.
 * The second element is `AnonAadhaarCore` or `undefined`, which represents the deserialized proof of the authentication
 * if available, signifying a successful login state.
 */
export function useProver(): [ProverState, string | undefined] {
  const [latestProof, setLatestProof] = useState<string>()
  const { proverState, state } = useContext(AnonAadhaarContext)

  useEffect(() => {
    if (state.status === 'logged-in') {
      setLatestProof(
        state.anonAadhaarProofs[Object.keys(state.anonAadhaarProofs).length - 1]
          .pcd,
      )
    }
  }, [proverState, state])

  return [proverState, latestProof]
}
