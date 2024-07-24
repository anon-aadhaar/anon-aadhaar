import React, { useEffect, useState, Dispatch, SetStateAction } from 'react'
import styled from 'styled-components'
import { AadhaarQRValidation, ModalViews } from '../../types'
import { ErrorToast } from './ErrorToast'
import { BrowserView, MobileView } from 'react-device-detect'
import { Logo } from '../LogInWithAnonAadhaar'
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
  logo,
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
      <BrowserView>
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
      </BrowserView>
      <MobileView>
        <ModalContent onClick={e => e.stopPropagation()}>
          {errorMessage !== null && (
            <ErrorToast
              message={errorMessage}
              setErrorMessage={setErrorMessage}
            />
          )}
          <TitleSection>
            <Title>
              <Logo src={logo} />
              Prove your Identity
            </Title>
            <Disclaimer>
              <b>Notice: </b> Currently, Anon Aadhaar Identity verification is
              not available on mobile devices. To complete this process, please
              visit this website using a desktop browser. We apologize for any
              inconvenience and thank you for your understanding.
            </Disclaimer>
          </TitleSection>
        </ModalContent>
      </MobileView>
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

  @media (max-width: 425px) {
    /* For screens <= 425px (e.g., mobile devices) */
    width: 100%;
    height: 30%;
    max-width: 100%;
    max-height: 100%;
  }

  @media (min-width: 426px) {
    /* For screens > 426px (e.g., desktop) */
    min-height: 600px;
    max-width: 450px;
    width: 80%;
  }
`

const TitleSection = styled.div`
  color: #111827;
  flex-shrink: 0;
  row-gap: 1rem;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-flow: column;
`

const Title = styled.h3`
  display: flex;
  flex-shrink: 0;
  margin-left: auto;
  margin-right: auto;
  font-size: medium;
  font-weight: bold;
`

const Disclaimer = styled.span`
  color: #6d6d6d;
  font-size: small;
  font-weight: normal;
`
