import React, { ReactNode } from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { expect } from 'chai'
import {
  useAnonAadhaar,
  AnonAadhaarContext,
  AnonAadhaarState,
} from '../src/hooks/useAnonAadhaar'
import { sha256Pad } from '@zk-email/helpers/dist/shaHash'
import { Uint8ArrayToCharArray } from '@zk-email/helpers/dist/binaryFormat'
import { ProverState, AnonAadhaarArgs, splitToWords } from '@anon-aadhaar/core'
import { ArgumentTypeName } from '@pcd/pcd-types'
import { AnonAadhaarProvider } from '../src/provider/AnonAadhaarProvider'
import { genData } from '../../core/test/utils'
import { useProver } from '../src/hooks/useProver'

describe('useAnonAadhaar Hook', () => {
  let testData: [bigint, bigint, bigint, bigint]
  let paddedMsg: Uint8Array
  let messageLen: number
  let signedData: string

  before(async () => {
    signedData = 'Hello-world'

    testData = await genData(signedData, 'SHA-256')

    return ([paddedMsg, messageLen] = sha256Pad(
      Buffer.from(signedData, 'ascii'),
      512 * 3,
    ))
  })

  afterEach(() => {
    cleanup()
  })

  it('returns initial state and startReq function', () => {
    const initialState: AnonAadhaarState = { status: 'logged-out' }
    const startReqFunction = () => {
      // startReqFunction
    }

    const wrapper: React.FC<{ children: ReactNode }> = ({ children }) => (
      <AnonAadhaarContext.Provider
        value={{
          state: initialState,
          startReq: startReqFunction,
          useTestAadhaar: true,
          proverState: ProverState.Initializing,
          appName: 'Anon Aadhaar',
        }}
      >
        {children}
      </AnonAadhaarContext.Provider>
    )

    const { result } = renderHook(() => useAnonAadhaar(), { wrapper })

    const [state, startReq] = result.current

    expect(state).to.deep.equal(initialState)
    expect(startReq).to.equal(startReqFunction)
  })

  it('returns updated state when request sent', () => {
    const anonAadhaarArgs: AnonAadhaarArgs = {
      qrDataPadded: {
        argumentType: ArgumentTypeName.StringArray,
        value: Uint8ArrayToCharArray(paddedMsg),
      },
      qrDataPaddedLength: {
        argumentType: ArgumentTypeName.Number,
        value: messageLen.toString(),
      },
      nonPaddedDataLength: {
        argumentType: ArgumentTypeName.Number,
        value: signedData.length.toString(),
      },
      delimiterIndices: {
        argumentType: ArgumentTypeName.StringArray,
        value: [1, 2, 3, 4].map(elem => elem.toString()),
      },
      signature: {
        argumentType: ArgumentTypeName.StringArray,
        value: splitToWords(testData[1], BigInt(121), BigInt(17)),
      },
      pubKey: {
        argumentType: ArgumentTypeName.StringArray,
        value: splitToWords(testData[2], BigInt(121), BigInt(17)),
      },
      nullifierSeed: {
        argumentType: ArgumentTypeName.String,
        value: '1234',
      },
      signalHash: {
        argumentType: ArgumentTypeName.String,
        value: '1',
      },
      revealGender: {
        argumentType: ArgumentTypeName.Number,
        value: '0',
      },
      revealAgeAbove18: {
        argumentType: ArgumentTypeName.Number,
        value: '0',
      },
      revealState: {
        argumentType: ArgumentTypeName.Number,
        value: '0',
      },
      revealPinCode: {
        argumentType: ArgumentTypeName.Number,
        value: '0',
      },
    }

    render(
      <AnonAadhaarProvider>
        <TestComponent anonAadhaarArgs={anonAadhaarArgs} />
      </AnonAadhaarProvider>,
    )

    // Verify initial state
    const statusElement = screen.getByTestId('status')
    const proverElement = screen.getByTestId('proverState')
    expect(statusElement.textContent).to.equal('logged-out')
    expect(proverElement.textContent).to.equal(ProverState.Initializing)

    // Simulate a button click
    const button = screen.getByText('Trigger Login')
    fireEvent.click(button)

    // Verify that the login request was triggered and state is updated
    expect(statusElement.textContent).to.equal('logging-in')
    expect(proverElement.textContent).to.equal(ProverState.FetchingWasm)
  })
})

function TestComponent({
  anonAadhaarArgs,
}: {
  anonAadhaarArgs: AnonAadhaarArgs
}) {
  const [state, startReq] = useAnonAadhaar()
  const [proverState] = useProver()

  return (
    <div>
      <span data-testid="status">{state.status}</span>
      <span data-testid="proverState">{proverState}</span>
      <button
        onClick={() => startReq({ type: 'login', args: anonAadhaarArgs })}
      >
        Trigger Login
      </button>
    </div>
  )
}
