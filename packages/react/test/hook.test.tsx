import React, { ReactNode } from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { expect } from 'chai'
import {
  useAnonAadhaar,
  AnonAadhaarContext,
  AnonAadhaarState,
} from '../src/hooks/useAnonAadhaar'
import { ProverState, AnonAadhaarArgs } from '@anon-aadhaar/core'
import { AnonAadhaarProvider } from '../src/provider/AnonAadhaarProvider'
import { useProver } from '../src/hooks/useProver'
import { processAadhaarArgs } from '../src/prove'
import { testQRData } from '../../circuits/assets/dataInput.json'

describe('useAnonAadhaar Hook', () => {
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

  it('returns updated state when request sent', async () => {
    const anonAadhaarArgs: AnonAadhaarArgs = await processAadhaarArgs(
      testQRData,
      true,
      1234,
    )

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

    // Clean up process after check
    cleanup()
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
