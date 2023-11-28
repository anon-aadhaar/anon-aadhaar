import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { FileInput } from './FileInput'
import { ProveButton } from './ProveButton'
import { uploadPdf } from '../util'
import { PasswordInput } from './PasswordInput'
import { AadhaarPdfValidation } from '../interface'
import { ErrorToast } from './ErrorToast'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
}

export const ProveModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [pdfData, setPdfData] = useState(Buffer.from([]))
  const [password, setPassword] = useState<string>('')
  const [pdfStatus, setpdfStatus] = useState<'' | AadhaarPdfValidation>('')
  const [provingEnabled, setProvingEnabled] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handlePdfChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { pdf } = await uploadPdf(e, setpdfStatus)
    setPdfData(pdf)
  }

  useEffect(() => {
    if (
      pdfStatus === AadhaarPdfValidation.SIGNATURE_PRESENT &&
      password !== ''
    ) {
      setProvingEnabled(true)
    } else {
      setProvingEnabled(false)
    }
  }, [pdfStatus, password, pdfData])

  return isOpen ? (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ErrorToast message={errorMessage} setErrorMessage={setErrorMessage} />
        <TitleSection>
          <Title>Prove your Identity with your Aadhar card</Title>
          <Disclaimer>
            Anon Aadhaar lets you prove your identity by generating a ZK Proof
            verifying your Aadhaar card was signed with the Indian government
            public key.
          </Disclaimer>
        </TitleSection>

        <UploadSection>
          <UploadFile>
            <Label>Upload your Masked Aadhaar PDF</Label>
            <FileInput onChange={handlePdfChange} id={'handlePdfChange'} />
            <DocumentResult>{pdfStatus}</DocumentResult>
          </UploadFile>

          <UploadFile>
            <Label>Enter your Aadhaar pdf password</Label>
            <PasswordInput setPassword={setPassword} id={'password'} />
          </UploadFile>
        </UploadSection>

        <ProveButton
          pdfData={pdfData}
          password={password}
          provingEnabled={provingEnabled}
          setErrorMessage={setErrorMessage}
        />
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
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  justify-content: space-between;

  @media (max-width: 425px) {
    /* For screens <= 425px (e.g., mobile devices) */
    width: 100%;
    height: 60%;
    max-width: 100%;
    max-height: 100%;
  }

  @media (min-width: 426px) {
    /* For screens > 426px (e.g., desktop) */
    min-height: 400px;
    max-width: 400px;
    width: 80%;
  }
`

const UploadFile = styled.div`
  margin-top: 30px;
  margin-bottom: 30px;
`

const DocumentResult = styled.div`
  color: #111827;
  position: absolute;
  font-size: 0.875rem;
  margin-top: 4px;
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
  flex-shrink: 0;
  margin-left: auto;
  margin-right: auto;
  font-size: medium;
  font-weight: bold;

  @media (max-width: 425px) {
    /* For screens <= 425px (e.g., mobile devices) */
    font-size: small;
  }
`

const Disclaimer = styled.p`
  color: #6d6d6d;
  margin-top: 0.3rem;
  font-size: small;
  font-weight: normal;
`

const UploadSection = styled.div`
  row-gap: 1rem;
  max-width: 100%;
`

const Label = styled.div`
  font-weight: 500;
  color: #111827;
`
