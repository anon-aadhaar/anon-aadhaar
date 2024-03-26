import styled from 'styled-components'
import { Dispatch, useContext, SetStateAction } from 'react'
import { AnonAadhaarContext } from '../../hooks/useAnonAadhaar'
import { Spinner } from '../LoadingSpinner'
import React from 'react'
import { processAadhaarArgs } from '../../prove'
import { FieldsToReveal } from '../../interface'
import { AadhaarQRValidation } from '../../interface'
import { ProverState } from '@anon-aadhaar/core'

interface ProveButtonProps {
  qrData: string | null
  provingEnabled: boolean
  setErrorMessage: Dispatch<SetStateAction<string | null>>
  fieldsToReveal: FieldsToReveal
  nullifierSeed: number
  setQrStatus: Dispatch<SetStateAction<AadhaarQRValidation | null>>
  signal?: string
}

export const ProveButton: React.FC<ProveButtonProps> = ({
  qrData,
  provingEnabled,
  setErrorMessage,
  signal,
  fieldsToReveal,
  nullifierSeed,
  setQrStatus,
}) => {
  const { startReq, useTestAadhaar, proverState } =
    useContext(AnonAadhaarContext)

  const startProving = async () => {
    try {
      if (qrData === null) throw new Error('Missing QR code data.')

      const args = await processAadhaarArgs(
        qrData,
        useTestAadhaar,
        nullifierSeed,
        fieldsToReveal,
        signal,
      )

      startReq({ type: 'login', args })
      setQrStatus(null)
    } catch (error) {
      console.log(error)
      if (error instanceof Error) setErrorMessage(error.message)
    }
  }

  return (() => {
    switch (proverState) {
      case ProverState.Initializing:
        return (
          <Btn disabled={!provingEnabled} onClick={startProving}>
            {' '}
            Request Aadhaar Proof{' '}
          </Btn>
        )
      case ProverState.Completed:
        return (
          <Btn disabled={!provingEnabled} onClick={startProving}>
            {' '}
            Request Aadhaar Proof{' '}
          </Btn>
        )
      case ProverState.FetchingWasm:
        return (
          <Btn>
            Searching for wasm file...
            {'\u2003'}
            <Spinner />
          </Btn>
        )
      case ProverState.FetchingZkey:
        return (
          <Btn>
            Searching for zkey file...
            {'\u2003'}
            <Spinner />
          </Btn>
        )
      case ProverState.Proving:
        return (
          <Btn>
            Generating proof...
            {'\u2003'}
            <Spinner />
          </Btn>
        )
      case ProverState.Error:
        return (
          <Btn>
            Oups something went wrong...
            {'\u2003'}
            <Spinner />
          </Btn>
        )
    }
  })()
}

const Btn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  color: #f8f8f8;
  font-weight: bold;
  box-shadow: 0px 0.25rem 0.75rem rgba(0, 0, 0, 0.1);
  border: none;
  min-width: 12rem;
  min-height: 3rem;
  border-radius: 0.5rem;
  background: linear-gradient(345deg, #10fe53 0%, #09d3ff 100%);
  margin: 1rem;

  &:hover {
    opacity: 70%;
    background: linear-gradient(345deg, #10fe53 0%, #09d3ff 100%);
  }

  &:active {
    background: #f8f8f8;
  }

  &:disabled {
    color: #a8aaaf;
    background: #e8e8e8;
    cursor: default;
  }
`
