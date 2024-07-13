import React, { Dispatch, SetStateAction } from 'react'
import styled from 'styled-components'
import { FileInput } from '../FileInput'
import { uploadQRpng } from '../../util'
import { AadhaarQRValidation, ModalViews } from '../../types'
import { useFonts } from '../../hooks/useFonts'

interface VerifyModalProps {
  qrStatus: AadhaarQRValidation | null
  provingEnabled: boolean
  setQrStatus: Dispatch<SetStateAction<AadhaarQRValidation | null>>
  setQrData: Dispatch<SetStateAction<string | null>>
  setCurrentView: Dispatch<SetStateAction<ModalViews>>
  useTestAadhaar?: boolean
}

export const VerifyModal: React.FC<VerifyModalProps> = ({
  qrStatus,
  provingEnabled,
  setQrStatus,
  setQrData,
  setCurrentView,
  useTestAadhaar,
}) => {
  useFonts()

  return (
    <MainContainer>
      <Container>
        <TitleSection>
          <Disclaimer>
            Anon Aadhaar allows you to create a proof of your Aadhaar ID without
            revealing any personal data. This process is local to your browser
            for privacy, and QR images are not uploaded to any server.
            <p>&nbsp;</p>
            <p>Note: Internet speed may affect processing time.</p>
            <Line></Line>
            <StyledParagraph>GENERATE A QR CODE:</StyledParagraph>
            {useTestAadhaar ? (
              <>
                You can try this example app by generating a test Adhaar QR Code
                <p>&nbsp;</p>
                <PhonePlatformLinks
                  href={
                    'https://documentation.anon-aadhaar.pse.dev/docs/generate-qr'
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  Link to generate a QR Code
                </PhonePlatformLinks>
              </>
            ) : (
              <>
                Open mAadhaar app{' '}
                <PhonePlatformLinks
                  href={'https://apps.apple.com/in/app/maadhaar/id1435469474'}
                  target="_blank"
                  rel="noreferrer"
                >
                  iOS
                </PhonePlatformLinks>{' '}
                or{' '}
                <PhonePlatformLinks
                  href={
                    'https://play.google.com/store/apps/details?id=in.gov.uidai.mAadhaarPlus&hl=en_IN&pli=1'
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  Android
                </PhonePlatformLinks>
                <p>
                  By entering your Aadhaar number and OTP verification. You can
                  then save the QR as an image using the &apos;Share&apos;
                  button for import.
                </p>
              </>
            )}
          </Disclaimer>
        </TitleSection>

        <UploadSection>
          <UploadFile>
            <StyledParagraph>
              UPLOAD YOUR AADHAAR SECURE QR CODE:{' '}
            </StyledParagraph>
            <FileInput
              onChange={async e => {
                const { qrValue } = await uploadQRpng(e, setQrStatus)
                setQrData(qrValue)
              }}
              id={'handlePdfChange'}
              setQrStatus={setQrStatus}
              qrStatus={qrStatus}
            />
          </UploadFile>
        </UploadSection>
      </Container>

      <Container>
        <Btn disabled={!provingEnabled} onClick={() => setCurrentView('Prove')}>
          CONTINUE
        </Btn>
        <SmallDisclaimer>
          No Aadhaar data ever leaves your device!
        </SmallDisclaimer>
      </Container>
    </MainContainer>
  )
}

const UploadFile = styled.div`
  margin-top: 20px;
  margin-bottom: 30px;
`

const SmallDisclaimer = styled.p`
  font-size: small;
  color: #717686;
  text-decoration: wavy;
  text-align: center;
  margin-top: 10px;
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

const Disclaimer = styled.span`
  color: #717686;
  font-size: 14px;
  font-weight: normal;
  line-height: 20px;
`

const UploadSection = styled.div`
  row-gap: 1rem;
  max-width: 100%;
`

const PhonePlatformLinks = styled.a`
  color: #1d24e0;
  margin-top: 0.3rem;
  font-size: 0.9rem;
  font-weight: normal;
  text-decoration: underline;
`
const Container = styled.div`
  width: 100%;
`

// const StepDisplay = styled.div`
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   font-weight: bold;
// `
const Line = styled.div`
  height: 2px;
  margin: 20px 0;
  width: 5rem;
  background-color: rgba(0, 154, 8, 1);
  margin-left: auto;
  margin-right: auto;
`
const StyledParagraph = styled.p`
  font-family: 'Rajdhani', sans-serif;
  font-weight: 600; // Regular weight
  font-size: 16px; // Example font size
  color: #333; // Example text color
  margin: 10px 0;
  line-height: 1.5;
  text-transform: capitalize;
`
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
const MainContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  width: 100%;
`
