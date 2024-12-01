import React, { useEffect, useState, Dispatch, SetStateAction } from 'react'
import styled from 'styled-components'
import { AadhaarQRValidation, ModalViews } from '../../types'
import { ErrorToast } from './ErrorToast'
import { verifySignature } from '../../verifySignature'
import { VerifyModal } from './VerifyModal'
import { ProveModal } from './ProveModal'
import { FieldsToRevealArray } from '@anon-aadhaar/core'
import { LoaderView } from './LoaderView'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  errorMessage: string | null
  setErrorMessage: Dispatch<SetStateAction<string | null>>
  logo: string
  qrStatus: AadhaarQRValidation | null
  setQrStatus: Dispatch<SetStateAction<AadhaarQRValidation | null>>
  nullifierSeed: number | bigint
  currentView: ModalViews
  setCurrentView: Dispatch<SetStateAction<ModalViews>>
  fieldsToReveal?: FieldsToRevealArray
  signal?: string
  useTestAadhaar?: boolean
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  errorMessage,
  setErrorMessage,
  qrStatus,
  setQrStatus,
  signal,
  fieldsToReveal,
  nullifierSeed,
  currentView,
  setCurrentView,
  useTestAadhaar = false,
}) => {
  const [qrData, setQrData] = useState<string | null>(null)
  const [provingEnabled, setProvingEnabled] = useState<boolean>(false)

  useEffect(() => {
    if (qrData) {
      verifySignature(qrData, useTestAadhaar)
        .then(verified => {
          verified.isSignatureValid
            ? setQrStatus(AadhaarQRValidation.SIGNATURE_VERIFIED)
            : setQrStatus(AadhaarQRValidation.ERROR_PARSING_QR)
        })
        .catch(error => {
          setQrStatus(AadhaarQRValidation.ERROR_PARSING_QR)
          console.error(error)
        })
    }
  }, [qrData])

  useEffect(() => {
    if (qrStatus === AadhaarQRValidation.SIGNATURE_VERIFIED) {
      setProvingEnabled(true)
    } else {
      setProvingEnabled(false)
    }
  }, [qrStatus])

  return isOpen ? (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        {errorMessage !== null && (
          <ErrorToast
            message={errorMessage}
            setErrorMessage={setErrorMessage}
          />
        )}
        {(() => {
          switch (currentView) {
            case 'Verify':
              return (
                <VerifyModal
                  provingEnabled={provingEnabled}
                  qrStatus={qrStatus}
                  setQrStatus={setQrStatus}
                  setQrData={setQrData}
                  setCurrentView={setCurrentView}
                  useTestAadhaar={useTestAadhaar}
                />
              )
            case 'Prove':
              return (
                <ProveModal
                  setErrorMessage={setErrorMessage}
                  qrStatus={qrStatus}
                  qrData={qrData}
                  setQrStatus={setQrStatus}
                  signal={signal}
                  fieldsToReveal={fieldsToReveal}
                  nullifierSeed={nullifierSeed}
                  setCurrentView={setCurrentView}
                  useTestAadhaar={useTestAadhaar}
                />
              )
            case 'Proving':
              return <LoaderView />
          }
        })()}
      </ModalContent>
    </ModalOverlay>
  ) : null
}

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`
const ModalContent = styled.div`
  position: fixed;
  display: flex;
  flex-direction: column;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #ffffff;
  border-radius: 1rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  padding: 2rem;

  /* Mobile devices */
  @media screen and (max-width: 480px) {
    width: 90%;
    min-height: 450px;
    padding: 1.5rem;
  }

  /* Tablets and Desktop */
  @media screen and (min-width: 481px) {
    width: 450px;
    height: 600px;
  }

  /* Very small screens */
  @media screen and (max-height: 550px) {
    min-height: 400px;
    padding: 1rem;
  }
`
