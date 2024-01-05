import React, { ReactNode } from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { render, screen, fireEvent } from '@testing-library/react'
import { expect } from 'chai'
import {
  useAnonAadhaar,
  AnonAadhaarContext,
  AnonAadhaarState,
} from '../src/hooks/useAnonAadhaar'
import { sha256Pad } from '@zk-email/helpers/dist/shaHash'
import { Uint8ArrayToCharArray } from '@zk-email/helpers/dist/binaryFormat'
import { AnonAadhaarPCDArgs, splitToWords } from 'anon-aadhaar-pcd'
import { ArgumentTypeName } from '@pcd/pcd-types'
import { AnonAadhaarProvider } from '../src/provider/AnonAadhaarProvider'
import { genData } from 'anon-aadhaar-pcd/test/utils'

describe('useCountryIdentity Hook', () => {
  let testData: [bigint, bigint, bigint, bigint]
  let paddedMsg: Uint8Array
  let messageLen: number

  before(async () => {
    const signedData = 'Hello-world'

    testData = await genData(signedData, 'SHA-256')
    ;[paddedMsg, messageLen] = sha256Pad(
      Buffer.from(signedData, 'ascii'),
      512 * 3,
    )
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
          appId: BigInt(1234555).toString(),
          testing: true,
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
    const pcdArgs: AnonAadhaarPCDArgs = {
      padded_message: {
        argumentType: ArgumentTypeName.StringArray,
        value: Uint8ArrayToCharArray(paddedMsg),
      },
      message_len: {
        argumentType: ArgumentTypeName.Number,
        value: messageLen.toString(),
      },
      signature: {
        argumentType: ArgumentTypeName.StringArray,
        value: splitToWords(testData[1], BigInt(64), BigInt(32)),
      },
      modulus: {
        argumentType: ArgumentTypeName.StringArray,
        value: splitToWords(testData[2], BigInt(64), BigInt(32)),
      },
    }

    render(
      <AnonAadhaarProvider _appId={BigInt(1234555).toString()}>
        <TestComponent pcdArgs={pcdArgs} />
      </AnonAadhaarProvider>,
    )

    // Verify initial state
    const statusElement = screen.getByTestId('status')
    expect(statusElement.textContent).to.equal('logged-out')

    // Simulate a button click
    const button = screen.getByText('Trigger Login')
    fireEvent.click(button)

    // Verify that the login request was triggered and state is updated
    expect(statusElement.textContent).to.equal('logging-in')
  })
})

function TestComponent({ pcdArgs }: { pcdArgs: AnonAadhaarPCDArgs }) {
  const [state, startReq] = useAnonAadhaar()

  return (
    <div>
      <span data-testid="status">{state.status}</span>
      <button onClick={() => startReq({ type: 'login', args: pcdArgs })}>
        Trigger Login
      </button>
    </div>
  )
}
