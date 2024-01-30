import { ReactNode, useEffect, useState } from 'react'
import {
  AnonAadhaarContext,
  AnonAadhaarRequest,
  AnonAadhaarState,
} from '../hooks/useAnonAadhaar'
import {
  AnonAadhaarCore,
  AnonAadhaarCorePackage,
  InitArgs,
  artifactUrls,
  init,
  verifyLocal,
} from '@anon-aadhaar/core'
import React, { Dispatch, SetStateAction } from 'react'
import { proveAndSerialize } from '../prove'
import { SerializedPCD } from '@pcd/pcd-types'

/**
 * AnonAadhaarProvider is a React component that serves as a provider for the
 * AnonAadhaarContext. It manages the authentication state, login requests,
 * and communication with the proving component. This provider initializes the
 * authentication state from local storage on page load and handles updates to
 * the state when login requests are made and when new proofs are received.
 *
 * @param props - Props for the AnonAadhaarProvider component.
 *   - children: The child components that will have access to the provided context.
 *
 * @returns A JSX element that wraps the provided child components with the
 * AnonAadhaarContext.Provider.
 */
export function AnonAadhaarProvider(props: {
  children: ReactNode
  _useTestAadhaar?: boolean
  _fetchArtifactsFromServer?: boolean
}) {
  // Read state from local storage on page load
  const [anonAadhaarProofStr, setAnonAadhaarProofStr] =
    useState<SerializedPCD<AnonAadhaarCore> | null>(null)
  const [anonAadhaarProof, setAnonAadhaarProof] =
    useState<AnonAadhaarCore | null>(null)
  const [useTestAadhaar, setUseTestAadhaar] = useState<boolean>(true)
  const [fetchArtifactsFromServer, setFetchArtifactsFromServer] =
    useState<boolean>(true)
  const [state, setState] = useState<AnonAadhaarState>({
    status: 'logged-out',
  })
  useEffect(() => {
    readFromLocalStorage().then(setAndWriteState)
    if (props._useTestAadhaar !== undefined)
      setUseTestAadhaar(props._useTestAadhaar)
    if (props._fetchArtifactsFromServer !== undefined)
      setFetchArtifactsFromServer(props._fetchArtifactsFromServer)
  }, [])

  useEffect(() => {
    const anonAadhaarInitArgs: InitArgs = {
      wasmURL: fetchArtifactsFromServer
        ? useTestAadhaar
          ? artifactUrls.test.wasm
          : artifactUrls.prod.wasm
        : '/aadhaar-verifier.wasm',
      zkeyURL: fetchArtifactsFromServer
        ? useTestAadhaar
          ? artifactUrls.test.zkey
          : artifactUrls.prod.zkey
        : '/circuit_final.zkey',
      vkeyURL: fetchArtifactsFromServer
        ? useTestAadhaar
          ? artifactUrls.test.vk
          : artifactUrls.prod.vk
        : '/vkey.json',
      isWebEnv: fetchArtifactsFromServer,
    }

    init(anonAadhaarInitArgs)
      .then()
      .catch(e => {
        throw Error(e)
      })
  }, [fetchArtifactsFromServer])

  // Write state to local storage whenever a login starts, succeeds, or fails
  const setAndWriteState = (newState: AnonAadhaarState) => {
    console.log(`[ANON-AADHAAR] new state ${shallowToString(newState)}`)
    setState(newState)
    writeToLocalStorage(newState)
  }

  // Send login requests
  const startReq = React.useCallback(
    (request: AnonAadhaarRequest) => {
      console.log(`[ANON-AADHAAR] startReq ${shallowToString(request)}`)
      setAndWriteState(
        handleLoginReq(request, setAnonAadhaarProofStr, setAnonAadhaarProof),
      )
    },
    [setAndWriteState, setAnonAadhaarProofStr, setAnonAadhaarProof],
  )

  // Receive PCD from proving component
  React.useEffect(() => {
    if (anonAadhaarProofStr === null || anonAadhaarProof === null) return
    console.log(`[ANON-AADHAAR] trying to log in with ${anonAadhaarProofStr}`)
    handleLogin(
      state,
      anonAadhaarProofStr,
      anonAadhaarProof,
      fetchArtifactsFromServer,
    )
      .then(newState => {
        if (newState) setAndWriteState(newState)
        else
          console.log(
            `[ANON-AADHAAR] ${state.status}, ignoring anonAadhaarProof: ${anonAadhaarProofStr}`,
          )
      })
      .catch((e: unknown) => {
        setAndWriteState({ status: 'logged-out' })
        console.error(e)
        console.error(
          `[ANON-AADHAAR] error logging in, ignoring anonAadhaarProof: ${anonAadhaarProofStr}`,
        )
      })
  }, [anonAadhaarProofStr])

  // Provide context
  const val = React.useMemo(
    () => ({ state, startReq, useTestAadhaar, fetchArtifactsFromServer }),
    [state, useTestAadhaar, fetchArtifactsFromServer],
  )

  return (
    <AnonAadhaarContext.Provider value={val}>
      {props.children}
    </AnonAadhaarContext.Provider>
  )
}

export async function readFromLocalStorage(): Promise<AnonAadhaarState> {
  const json = window.localStorage['anonAadhaar']
  try {
    const state = await parseAndValidate(json)
    console.log(`[ANON-AADHAAR] read stored state: ${shallowToString(state)}`)
    return state
  } catch (e) {
    console.error(`[ANON-AADHAAR] error parsing stored state: ${e}`)
    return { status: 'logged-out' }
  }
}

function writeToLocalStorage(state: AnonAadhaarState) {
  console.log(`[ANON-AADHAAR] writing to local storage, status ${state.status}`)
  window.localStorage['anonAadhaar'] = serialize(state)
}

export function serialize(state: AnonAadhaarState): string {
  const { status } = state
  let serState
  if (status === 'logged-in') {
    serState = {
      status,
      serializedPCD: state.serializedAnonAadhaarProof,
      anonAadhaarProof: state.anonAadhaarProof,
    }
  } else {
    serState = {
      status: 'logged-out',
    }
  }
  return JSON.stringify(serState)
}

export async function parseAndValidate(
  json?: string,
): Promise<AnonAadhaarState> {
  if (json == null || json.trim() === '') {
    return { status: 'logged-out' }
  }

  const stored = JSON.parse(json)

  // Validate status
  if (!['logged-out', 'logged-in'].includes(stored.status)) {
    throw new Error(`Invalid status ${stored.status}`)
  }

  if (stored.status === 'logged-out') {
    return { status: stored.status }
  }

  // Parse and validate PCD and accompanying metadata.
  const { status, serializedPCD, anonAadhaarProof } = stored
  if (serializedPCD == null) {
    throw new Error(`Missing serialized PCD`)
  } else if (anonAadhaarProof == null) {
    throw new Error(`Missing PCD`)
  } else if (serializedPCD.type !== AnonAadhaarCorePackage.name) {
    throw new Error(`Invalid PCD type ${serializedPCD.type}`)
  }

  return {
    status,
    anonAadhaarProof: await AnonAadhaarCorePackage.deserialize(
      serializedPCD.anonAadhaarProof,
    ),
    serializedAnonAadhaarProof: serializedPCD,
  }
}

function shallowToString(obj: unknown) {
  return JSON.stringify(obj, function (key: string, val: unknown) {
    if (key === '') return val
    if (val == null) return null
    if (typeof val === 'bigint') return '' + val
    if (Array.isArray(val)) return '<array>'
    if (typeof val === 'object') return '<object>'
    return val
  })
}

/** Start a login request. Returns a `logging-in` state */
function handleLoginReq(
  request: AnonAadhaarRequest,
  setAnonAadhaarStr: Dispatch<
    SetStateAction<SerializedPCD<AnonAadhaarCore> | null>
  >,
  setAnonAadhaar: Dispatch<SetStateAction<AnonAadhaarCore | null>>,
): AnonAadhaarState {
  const { type } = request
  switch (type) {
    case 'login':
      try {
        const { args } = request
        proveAndSerialize(args).then(
          ({
            anonAadhaarProof,
            serialized,
          }: {
            anonAadhaarProof: AnonAadhaarCore
            serialized: SerializedPCD<AnonAadhaarCore>
          }) => {
            setAnonAadhaarStr(serialized)
            setAnonAadhaar(anonAadhaarProof)
          },
        )
      } catch (error) {
        console.log(error)
      }
      return { status: 'logging-in' }

    case 'logout':
      return { status: 'logged-out' }

    default:
      throw new Error(`Invalid request type ${type}`)
  }
}

/** Returns either a `logged-in` state, null to ignore, or throws on error. */
async function handleLogin(
  state: AnonAadhaarState,
  _anonAadhaarProofStr: SerializedPCD<AnonAadhaarCore>,
  _anonAadhaarProof: AnonAadhaarCore,
  isWeb: boolean,
): Promise<AnonAadhaarState | null> {
  if (state.status !== 'logging-in') {
    console.log(
      `[ANON-AADHAAR] ignoring message. State != logging-in: ${state}`,
    )
    return null
  }

  if (isWeb) {
    if (!(await AnonAadhaarCorePackage.verify(_anonAadhaarProof))) {
      throw new Error('Invalid proof')
    }
  } else {
    if (!(await verifyLocal(_anonAadhaarProof))) {
      throw new Error('Invalid proof')
    }
  }

  return {
    status: 'logged-in',
    serializedAnonAadhaarProof: _anonAadhaarProofStr,
    anonAadhaarProof: _anonAadhaarProof,
  }
}
