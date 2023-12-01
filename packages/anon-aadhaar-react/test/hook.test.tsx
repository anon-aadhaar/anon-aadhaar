import React, { ReactNode } from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { render, screen, fireEvent } from '@testing-library/react'
import { expect } from 'chai'
import {
  useAnonAadhaar,
  AnonAadhaarContext,
  AnonAadhaarState,
} from '../src/hooks/useAnonAadhaar'
import { AnonAadhaarPCDArgs, genData } from 'anon-aadhaar-pcd'
import { ArgumentTypeName } from '@pcd/pcd-types'
import { AnonAadhaarProvider } from '../src/provider/AnonAadhaarProvider'

describe('useCountryIdentity Hook', () => {
  let testData: [bigint, bigint, bigint, bigint]

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

  before(async () => {
    testData = await genData('Hello world', 'SHA-1')
  })

  it('returns updated state when request sent', () => {
    const pcdArgs: AnonAadhaarPCDArgs = {
      signature: {
        argumentType: ArgumentTypeName.BigInt,
        value: testData[1] + '',
      },
      modulus: {
        argumentType: ArgumentTypeName.BigInt,
        value: testData[2] + '',
      },
      base_message: {
        argumentType: ArgumentTypeName.BigInt,
        value: testData[3] + '',
      },
      app_id: {
        argumentType: ArgumentTypeName.BigInt,
        value: BigInt(1234555).toString(),
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
