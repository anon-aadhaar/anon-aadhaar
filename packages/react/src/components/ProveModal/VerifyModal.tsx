import React, { Dispatch, SetStateAction } from 'react'
import styled from 'styled-components'
import { FileInput } from '../FileInput'
import { uploadQRpng } from '../../util'
import { AadhaarQRValidation } from '../../interface'
import { Logo } from '../LogInWithAnonAadhaar'
import { FaChevronRight } from 'react-icons/fa'

interface VerifyModalProps {
  logo: string
  qrStatus: AadhaarQRValidation | null
  provingEnabled: boolean
  setQrStatus: Dispatch<SetStateAction<AadhaarQRValidation | null>>
  setQrData: Dispatch<SetStateAction<string | null>>
  setCurrentView: Dispatch<SetStateAction<'Verify' | 'Prove'>>
}

export const VerifyModal: React.FC<VerifyModalProps> = ({
  logo,
  qrStatus,
  provingEnabled,
  setQrStatus,
  setQrData,
  setCurrentView,
}) => {
  return (
    <>
      <TitleSection>
        <Title>
          <Logo src={logo} />
          Prove your Identity
        </Title>
        <Disclaimer>
          Anon Aadhaar allows you to create a proof of your Aadhaar ID without
          revealing any personal data. Generate a QR code using the mAadhaar app
          (
          <PhonePlatformLinks
            href={'https://apps.apple.com/in/app/maadhaar/id1435469474'}
            target="_blank"
            rel="noreferrer"
          >
            iOS
          </PhonePlatformLinks>{' '}
          /{' '}
          <PhonePlatformLinks
            href={
              'https://play.google.com/store/apps/details?id=in.gov.uidai.mAadhaarPlus&hl=en_IN&pli=1'
            }
            target="_blank"
            rel="noreferrer"
          >
            Android
          </PhonePlatformLinks>
          ), by entering your Aadhaar number and OTP verification. You can then
          save the QR as an image using the &apos;Share&apos; button for import.
          <p>
            This process is local to your browser for privacy, and QR images are
            not uploaded to any server.
          </p>
          <p>&nbsp;</p>
          <p>Note: Internet speed may affect processing time.</p>
        </Disclaimer>
      </TitleSection>

      <UploadSection>
        <UploadFile>
          <Label>Upload your Aadhaar secure QR Code: </Label>
          <FileInput
            onChange={async e => {
              const { qrValue } = await uploadQRpng(e, setQrStatus)
              setQrData(qrValue)
            }}
            id={'handlePdfChange'}
          />
          <DocumentResult>{qrStatus}</DocumentResult>
        </UploadFile>
      </UploadSection>

      <Container>
        <Placeholder />

        <StepDisplay>1/2</StepDisplay>

        {provingEnabled ? (
          <Button
            disabled={!provingEnabled}
            onClick={() => {
              setCurrentView('Prove')
            }}
          >
            Next <FaChevronRight height={15} />
          </Button>
        ) : (
          <Placeholder />
        )}
      </Container>
    </>
  )
}

const UploadFile = styled.div`
  margin-top: 20px;
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
  margin: 1rem 1rem 0;
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
  margin-top: 0.3rem;
  font-size: small;
  font-weight: normal;
`

const UploadSection = styled.div`
  margin: 0 1rem 0;
  row-gap: 1rem;
  max-width: 100%;
`

const Label = styled.div`
  font-size: medium;
  text-align: left;
  font-weight: 500;
  color: #111827;
`

const PhonePlatformLinks = styled.a`
  color: #1d24e0;
  margin-top: 0.3rem;
  font-size: small;
  font-weight: normal;
`
const Container = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  padding: 1.5rem;
`

const Button = styled.button`
  display: flex;
  align-items: center;
  font-weight: 600; /* semibold */
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`

const Placeholder = styled.div`
  display: flex;
  width: 3rem; /* 48px */
`

const StepDisplay = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
`
