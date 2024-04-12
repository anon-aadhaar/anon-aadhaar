import { useContext, useEffect, useState } from 'react'
import { AnonAadhaarContext } from './useAnonAadhaar'
import { AnonAadhaarCore, ProverState, deserialize } from '@anon-aadhaar/core'

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
export function useProver(): [ProverState, AnonAadhaarCore | undefined] {
  const [latestProof, setLatestProof] = useState<AnonAadhaarCore>()
  const { proverState, state } = useContext(AnonAadhaarContext)

  useEffect(() => {
    if (state.status === 'logged-in') {
      deserialize(
        state.anonAadhaarProofs[Object.keys(state.anonAadhaarProofs).length - 1]
          .pcd,
      ).then(anonAadhaarCore => setLatestProof(anonAadhaarCore))
    }
  }, [proverState, state])

  return [proverState, latestProof]
}
