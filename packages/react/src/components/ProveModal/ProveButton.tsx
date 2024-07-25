import styled from 'styled-components'
import { Dispatch, useContext, SetStateAction } from 'react'
import { AnonAadhaarContext } from '../../hooks/useAnonAadhaar'
import React from 'react'
import { processAadhaarArgs } from '../../prove'
import { AadhaarQRValidation, ModalViews } from '../../types'
import { FieldsToRevealArray } from '@anon-aadhaar/core'

interface ProveButtonProps {
  qrData: string | null
  provingEnabled: boolean
  setErrorMessage: Dispatch<SetStateAction<string | null>>
  fieldsToReveal?: FieldsToRevealArray
  nullifierSeed: number | bigint
  setQrStatus: Dispatch<SetStateAction<AadhaarQRValidation | null>>
  signal?: string
  setCurrentView: Dispatch<SetStateAction<ModalViews>>
  useTestAadhaar?: boolean
}

export const ProveButton: React.FC<ProveButtonProps> = ({
  qrData,
  provingEnabled,
  setErrorMessage,
  signal,
  fieldsToReveal,
  nullifierSeed,
  setQrStatus,
  setCurrentView,
  useTestAadhaar = false,
}) => {
  const { startReq } = useContext(AnonAadhaarContext)

  const startProving = async () => {
    try {
      setCurrentView('Proving')
      if (qrData === null) throw new Error('Missing QR code data.')

      if (fieldsToReveal === undefined) fieldsToReveal = []

      const args = await processAadhaarArgs(
        qrData,
        useTestAadhaar,
        nullifierSeed,
        fieldsToReveal,
        signal,
      )

      startReq({ type: 'login', args, useTestAadhaar })
      setQrStatus(null)
    } catch (error) {
      console.log(error)
      if (error instanceof Error) setErrorMessage(error.message)
    }
  }

  return (
    <Btn disabled={!provingEnabled} onClick={startProving}>
      {' '}
      GENERATE ANON AADHAAR PROOF{' '}
    </Btn>
  )
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
