import styled from 'styled-components'
import { Dispatch, useContext, SetStateAction } from 'react'
import { AnonAadhaarContext } from '../../hooks/useAnonAadhaar'
import { Spinner } from '../LoadingSpinner'
import React from 'react'
import { processAadhaarArgs } from '../../prove'
import { AadhaarQRValidation } from '../../types'
import { FieldsToRevealArray, ProverState } from '@anon-aadhaar/core'

interface ProveButtonProps {
  qrData: string | null
  provingEnabled: boolean
  setErrorMessage: Dispatch<SetStateAction<string | null>>
  fieldsToReveal?: FieldsToRevealArray
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

      if (fieldsToReveal === undefined) fieldsToReveal = []

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
            GENERATE ANON AADHAAR PROOF{' '}
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
  font-family: 'Rajdhani', sans-serif;
  font-weight: 600;
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  font-size: 16px;
  cursor: pointer;
  color: white;
  background-color: #009a08;
  border: none;
  min-width: 12rem;
  min-height: 3rem;
  border-radius: 6px;

  &:hover {
    opacity: 70%;
  }

  &:active {
    background: #f8f8f8;
  }

  &:disabled {
    color: #a8aaaf;
    background: #e8e8e8;
    cursor: default;
    cursor: not-allowed;
  }
`
