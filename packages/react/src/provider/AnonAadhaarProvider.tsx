import { ReactNode, useEffect, useState } from 'react'
import {
  AnonAadhaarContext,
  AnonAadhaarRequest,
  AnonAadhaarState,
} from '../hooks/useAnonAadhaar'
import {
  AnonAadhaarPCD,
  AnonAadhaarPCDPackage,
  PCDInitArgs,
  VK_URL,
  WASM_URL,
  ZKEY_URL,
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
  const [pcdStr, setPcdStr] = useState<SerializedPCD<AnonAadhaarPCD> | null>(
    null,
  )
  const [pcd, setPcd] = useState<AnonAadhaarPCD | null>(null)
  const [useTestAadhaar, setUseTestAadhaar] = useState<boolean>(true)
  const [isWeb, setIsWeb] = useState<boolean>(true)
  const [state, setState] = useState<AnonAadhaarState>({
    status: 'logged-out',
  })
  useEffect(() => {
    readFromLocalStorage().then(setAndWriteState)
    if (props._useTestAadhaar !== undefined)
      setUseTestAadhaar(props._useTestAadhaar)
    if (props._fetchArtifactsFromServer !== undefined)
      setIsWeb(props._fetchArtifactsFromServer)
  }, [])

  useEffect(() => {
    const pcdInitArgs: PCDInitArgs = {
      wasmURL: isWeb ? WASM_URL : '/qr_verify.wasm',
      zkeyURL: isWeb ? ZKEY_URL : '/circuit_final.zkey',
      vkeyURL: isWeb ? VK_URL : '/vkey.json',
      isWebEnv: isWeb,
    }

    init(pcdInitArgs)
      .then()
      .catch(e => {
        throw Error(e)
      })
  }, [isWeb])

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
      setAndWriteState(handleLoginReq(request, setPcdStr, setPcd))
    },
    [setAndWriteState, setPcdStr, setPcd],
  )

  // Receive PCD from proving component
  React.useEffect(() => {
    if (pcdStr === null || pcd === null) return
    console.log(`[ANON-AADHAAR] trying to log in with ${pcdStr}`)
    handleLogin(state, pcdStr, pcd, isWeb)
      .then(newState => {
        if (newState) setAndWriteState(newState)
        else
          console.log(`[ANON-AADHAAR] ${state.status}, ignoring pcd: ${pcdStr}`)
      })
      .catch((e: unknown) => {
        setAndWriteState({ status: 'logged-out' })
        console.error(e)
        console.error(
          `[ANON-AADHAAR] error logging in, ignoring pcd: ${pcdStr}`,
        )
      })
  }, [pcdStr])

  // Provide context
  const val = React.useMemo(
    () => ({ state, startReq, useTestAadhaar, isWeb }),
    [state, useTestAadhaar, isWeb],
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
      serializedPCD: state.serializedPCD,
      pcd: state.pcd,
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
  const { status, serializedPCD, pcd } = stored
  if (serializedPCD == null) {
    throw new Error(`Missing serialized PCD`)
  } else if (pcd == null) {
    throw new Error(`Missing PCD`)
  } else if (serializedPCD.type !== AnonAadhaarPCDPackage.name) {
    throw new Error(`Invalid PCD type ${serializedPCD.type}`)
  }

  return {
    status,
    pcd: await AnonAadhaarPCDPackage.deserialize(serializedPCD.pcd),
    serializedPCD: serializedPCD,
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
  setPcdStr: Dispatch<SetStateAction<SerializedPCD<AnonAadhaarPCD> | null>>,
  setPcd: Dispatch<SetStateAction<AnonAadhaarPCD | null>>,
): AnonAadhaarState {
  const { type } = request
  switch (type) {
    case 'login':
      try {
        const { args } = request
        proveAndSerialize(args).then(
          ({
            pcd,
            serialized,
          }: {
            pcd: AnonAadhaarPCD
            serialized: SerializedPCD<AnonAadhaarPCD>
          }) => {
            setPcdStr(serialized)
            setPcd(pcd)
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
  pcdStr: SerializedPCD<AnonAadhaarPCD>,
  _pcd: AnonAadhaarPCD,
  isWeb: boolean,
): Promise<AnonAadhaarState | null> {
  if (state.status !== 'logging-in') {
    console.log(
      `[ANON-AADHAAR] ignoring message. State != logging-in: ${state}`,
    )
    return null
  }

  if (isWeb) {
    if (!(await AnonAadhaarPCDPackage.verify(_pcd))) {
      throw new Error('Invalid proof')
    }
  } else {
    if (!(await verifyLocal(_pcd))) {
      throw new Error('Invalid proof')
    }
  }

  return {
    status: 'logged-in',
    serializedPCD: pcdStr,
    pcd: _pcd,
  }
}
