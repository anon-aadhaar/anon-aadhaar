import { ReactNode, useEffect, useState } from 'react'
import {
  AnonAadhaarContext,
  AnonAadhaarRequest,
  AnonAadhaarState,
} from '../hooks/useAnonAadhaar'
import {
  AnonAadhaarCore,
  AnonAadhaarCorePackage,
  ArtifactsOrigin,
  InitArgs,
  artifactUrls,
  init,
  ProverState,
  verify,
} from '@anon-aadhaar/core'
import React, { Dispatch, SetStateAction } from 'react'
import { proveAndSerialize } from '../prove'
import { SerializedPCD } from '@pcd/pcd-types'

type ArtifactsLinks = {
  zkey_url: string
  wasm_url: string
  vkey_url: string
}

// Props for the AnonAadhaarProvider
export type AnonAadhaarProviderProps = {
  /**
   * `children`: The ReactNode elements that form the child components of your application.
   * This is a standard prop for components that wrap around other components to provide context or styling.
   */
  children: ReactNode

  /**
   * `_artifactslinks`: Here you can specify your own artifacts.
   * It can be either file located in your public directory by specifying the root (e.g. "./circuit_final.zkey")
   * or the url of artifacts that you stored on your own server.
   */
  _artifactslinks?: ArtifactsLinks

  /**
   * `_appName`: Name of your app
   */
  _appName?: string

  /**
   * `_useTestAadhaar`: Set the SDK to be in test mode
   */
  _useTestAadhaar?: boolean
}

/**
 * AnonAadhaarProvider is a React component that serves as a provider for the
 * AnonAadhaarContext. It manages the authentication state, login requests,
 * and communication with the proving component. This provider initializes the
 * authentication state from local storage on page load and handles updates to
 * the state when login requests are made and when new proofs are received.
 *
 * @param {AnonAadhaarProviderProps}  anonAadhaarProviderProps
 *
 * @returns A JSX element that wraps the provided child components with the
 * AnonAadhaarContext.Provider.
 */
export function AnonAadhaarProvider(
  anonAadhaarProviderProps: AnonAadhaarProviderProps,
) {
  // Read state from local storage on page load
  const [anonAadhaarProofStr, setAnonAadhaarProofStr] =
    useState<SerializedPCD<AnonAadhaarCore> | null>(null)
  const [anonAadhaarProof, setAnonAadhaarProof] =
    useState<AnonAadhaarCore | null>(null)
  const [appName, setAppName] = useState<string>('The current application')
  const [proverState, setProverState] = useState<ProverState>(
    ProverState.Initializing,
  )
  const [useTestAadhaar, setUseTestAadhaar] = useState<boolean>(false)
  const [state, setState] = useState<AnonAadhaarState>({
    status: 'logged-out',
  })

  useEffect(() => {
    if (anonAadhaarProviderProps._appName !== undefined)
      setAppName(anonAadhaarProviderProps._appName)

    if (anonAadhaarProviderProps._useTestAadhaar) setUseTestAadhaar(true)
  }, [
    anonAadhaarProviderProps._appName,
    anonAadhaarProviderProps._useTestAadhaar,
  ])

  useEffect(() => {
    let anonAadhaarInitArgs: InitArgs
    if (anonAadhaarProviderProps._artifactslinks) {
      anonAadhaarInitArgs = {
        wasmURL: anonAadhaarProviderProps._artifactslinks.wasm_url,
        zkeyURL: anonAadhaarProviderProps._artifactslinks.zkey_url,
        vkeyURL: anonAadhaarProviderProps._artifactslinks.vkey_url,
        artifactsOrigin: ArtifactsOrigin.server,
      }
    } else {
      anonAadhaarInitArgs = {
        wasmURL: artifactUrls.v2.wasm,
        zkeyURL: artifactUrls.v2.chunked,
        vkeyURL: artifactUrls.v2.vk,
        artifactsOrigin: ArtifactsOrigin.chunked,
      }
    }

    init(anonAadhaarInitArgs)
      .then()
      .catch(e => {
        throw Error(e)
      })
  }, [anonAadhaarProviderProps._artifactslinks])

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
        handleLoginReq(
          request,
          state,
          setAnonAadhaarProofStr,
          setAnonAadhaarProof,
          setProverState,
        ),
      )
    },
    [setAndWriteState, setAnonAadhaarProofStr, setAnonAadhaarProof],
  )

  // Receive PCD from proving component
  React.useEffect(() => {
    if (anonAadhaarProofStr === null || anonAadhaarProof === null) return
    console.log(`[ANON-AADHAAR] trying to log in with ${anonAadhaarProofStr}`)
    handleLogin(state, anonAadhaarProofStr, anonAadhaarProof, useTestAadhaar)
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
    () => ({ state, startReq, proverState, appName, useTestAadhaar }),
    [state, proverState, appName, useTestAadhaar],
  )

  return (
    <AnonAadhaarContext.Provider value={val}>
      {anonAadhaarProviderProps.children}
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
  if (status === 'logged-out') {
    serState = {
      status: 'logged-out',
    }
  } else {
    serState = {
      status,
      anonAadhaarProofs: state.anonAadhaarProofs,
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
  const { status, anonAadhaarProofs } = stored
  if (anonAadhaarProofs == null) {
    throw new Error(`Missing serialized AnonAadhaarProof`)
  } else if (anonAadhaarProofs[0].type !== AnonAadhaarCorePackage.name) {
    throw new Error(
      `Invalid AnonAadhaarProof type ${anonAadhaarProofs[0].type}`,
    )
  }

  return {
    status,
    anonAadhaarProofs,
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
  state: AnonAadhaarState,
  setAnonAadhaarStr: Dispatch<
    SetStateAction<SerializedPCD<AnonAadhaarCore> | null>
  >,
  setAnonAadhaar: Dispatch<SetStateAction<AnonAadhaarCore | null>>,
  setProverState: Dispatch<SetStateAction<ProverState>>,
): AnonAadhaarState {
  const { type } = request
  switch (type) {
    case 'login':
      try {
        const { args } = request
        proveAndSerialize(args, setProverState).then(
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

      return {
        status: 'logging-in',
        ...(state.status !== 'logged-out'
          ? {
              anonAadhaarProofs: state.anonAadhaarProofs,
            }
          : {}),
      }

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
  useTestAadhaar: boolean,
): Promise<AnonAadhaarState | null> {
  if (state.status !== 'logging-in') {
    console.log(
      `[ANON-AADHAAR] ignoring message. State != logging-in: ${state}`,
    )
    return null
  }

  if (!(await verify(_anonAadhaarProof, useTestAadhaar))) {
    throw new Error('Invalid proof')
  }

  const index =
    state.anonAadhaarProofs === undefined
      ? 0
      : Object.keys(state.anonAadhaarProofs).length

  return {
    status: 'logged-in',
    anonAadhaarProofs: {
      ...state.anonAadhaarProofs,
      [index]: _anonAadhaarProofStr,
    },
  }
}
