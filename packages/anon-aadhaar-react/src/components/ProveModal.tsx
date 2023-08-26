import React, { useState } from 'react'
import styled from 'styled-components'
import { FileInput } from './UploadButton'
import { ProveButton } from './ProveButton'
import { pdfUpload, cerUpload } from '../util'
import {
  AadhaarPdfValidation,
  AadhaarSignatureValidition,
  AadhaarCertificateValidation,
} from '../interface'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [signedPdfData, setSignedPdfData] = useState(Buffer.from([]))
  const [signature, setSignature] = useState('')
  const [msgBigInt, setMsgBigInt] = useState<bigint>()
  const [sigBigInt, setSigBigInt] = useState<bigint>()
  const [modulusBigInt, setModulusBigInt] = useState<bigint>()
  const [pdfStatus, setpdfStatus] = useState<'' | AadhaarPdfValidation>('')
  const [signatureValidity, setsignatureValidity] = useState<
    '' | AadhaarSignatureValidition
  >('')
  const [certificateStatus, setcertificateStatus] = useState<
    '' | AadhaarCertificateValidation
  >('')

  const certificateOrSignatureStatus =
    certificateStatus ==
      AadhaarCertificateValidation.ERROR_PARSING_CERTIFICATE ||
    certificateStatus == '' ||
    certificateStatus == AadhaarCertificateValidation.NO_PDF_UPLOADED
      ? certificateStatus
      : signatureValidity

  const handlePdfChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { signature, signedData } = await pdfUpload(
      e,
      setpdfStatus,
      setsignatureValidity,
    )
    setSignature(signature)
    setSignedPdfData(signedData)
  }

  const handleCerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { msgBigInt, sigBigInt, modulusBigInt } = await cerUpload(
      e,
      signedPdfData,
      signature,
      pdfStatus,
      setcertificateStatus,
      setsignatureValidity,
    )

    setMsgBigInt(msgBigInt)
    setSigBigInt(sigBigInt)
    setModulusBigInt(modulusBigInt)
  }
  return isOpen ? (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <TitleSection>
          <p>Prove your Identity with your Aadhar card</p>
        </TitleSection>

        <UploadSection>
          <UploadFile>
            <Label>Upload your Aadhaar card pdf</Label>
            <FileInput onChange={handlePdfChange} />
            <DocumentResult>{pdfStatus}</DocumentResult>
          </UploadFile>

          <UploadFile>
            <Label>Upload your Aadhaar card certification</Label>
            <FileInput onChange={handleCerUpload} />
            <DocumentResult>{certificateOrSignatureStatus}</DocumentResult>
          </UploadFile>
        </UploadSection>
        <ProveButton
          sigBigInt={sigBigInt}
          modulusBigInt={modulusBigInt}
          msgBigInt={msgBigInt}
          signatureValidity={signatureValidity}
        />
      </ModalContent>
    </ModalOverlay>
  ) : null
}

export default Modal

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.2); /* Low opacity gray */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999; /* Ensure the modal appears on top of other elements */
`

const ModalContent = styled.div`
  /* Modal styles common to both desktop and mobile */
  position: fixed;
  display: flex;
  flex-direction: column;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #ffffff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  justify-content: space-between;

  /* Responsive styles */
  @media (max-width: 768px) {
    /* For screens <= 768px (e.g., mobile devices) */
    width: 100%;
    height: 60%;
    max-width: 100%;
    max-height: 100%;
  }

  @media (min-width: 769px) {
    /* For screens > 768px (e.g., desktop) */
    min-height: 400px;
    width: 80%; /* Adjust the percentage as needed */
    max-width: 400px; /* Set a maximum width for desktop */
  }
`

const UploadFile = styled.div`
  margin-top: 10px;
  margin-bottom: 10px;
`

const DocumentResult = styled.div`
  position: absolute;
  font-size: 0.875rem;
  margin-top: 4px;
`

const TitleSection = styled.div`
  flex-shrink: 0;
  margin-left: auto;
  margin-right: auto;
  font-size: medium;
  font-weight: bold;
`

const UploadSection = styled.div`
  display: grid;
  row-gap: 20px;
`

const Label = styled.div`
  margin-bottom: 0.5rem;
  line-height: 1.25rem;
  font-weight: 500;
  color: #111827;
`
