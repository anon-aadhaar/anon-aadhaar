import React, { ReactNode } from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { render, screen, fireEvent } from '@testing-library/react'
import { expect } from 'chai'
import {
  useCountryIdentity,
  CountryIdentityContext,
  CountryIdentityState,
} from '../src/hooks/useCountryIdentity'
import { genData } from './utils'
import { IdentityPCDArgs } from 'pcd-country-identity'
import { ArgumentTypeName } from '@pcd/pcd-types'
import { CountryIdentityProvider } from '../src/provider/CountryIdentityProvider'

describe('useCountryIdentity Hook', () => {
  let testData: [bigint, bigint, bigint, bigint]

  it('returns initial state and startReq function', () => {
    const initialState: CountryIdentityState = { status: 'logged-out' }
    const startReqFunction = () => {}

    const wrapper: React.FC<{ children: ReactNode }> = ({ children }) => (
      <CountryIdentityContext.Provider
        value={{ state: initialState, startReq: startReqFunction }}
      >
        {children}
      </CountryIdentityContext.Provider>
    )

    const { result } = renderHook(() => useCountryIdentity(), { wrapper })

    const [state, startReq] = result.current

    expect(state).to.deep.equal(initialState)
    expect(startReq).to.equal(startReqFunction)
  })

  before(async () => {
    testData = await genData('Hello world', 'SHA-1')
  })

  it('returns updated state when request sent', () => {
    const pcdArgs: IdentityPCDArgs = {
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
    }

    render(
      <CountryIdentityProvider>
        <TestComponent pcdArgs={pcdArgs} />
      </CountryIdentityProvider>,
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

function TestComponent({ pcdArgs }: { pcdArgs: IdentityPCDArgs }) {
  const [state, startReq] = useCountryIdentity()

  return (
    <div>
      <span data-testid="status">{state.status}</span>
      <button onClick={() => startReq({ type: 'login', args: pcdArgs })}>
        Trigger Login
      </button>
    </div>
  )
}
