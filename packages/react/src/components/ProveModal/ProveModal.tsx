import React, { useEffect, useState, Dispatch, SetStateAction } from 'react'
import styled from 'styled-components'
import { ProveButton } from './ProveButton'
import { AadhaarQRValidation, FieldsToReveal } from '../../interface'
import { Logo } from '../LogInWithAnonAadhaar'
import { SignalDisplay } from './SignalDisplay'

interface ProveModalProps {
  setErrorMessage: Dispatch<SetStateAction<string | null>>
  logo: string
  qrStatus: AadhaarQRValidation | null
  qrData: string | null
  setQrStatus: Dispatch<SetStateAction<AadhaarQRValidation | null>>
  fieldsToReveal: FieldsToReveal
  nullifierSeed: number
  signal?: string
}

export const ProveModal: React.FC<ProveModalProps> = ({
  setErrorMessage,
  logo,
  qrStatus,
  qrData,
  setQrStatus,
  signal,
  fieldsToReveal,
  nullifierSeed,
}) => {
  const [provingEnabled, setProvingEnabled] = useState<boolean>(false)

  useEffect(() => {
    if (qrStatus === AadhaarQRValidation.SIGNATURE_VERIFIED) {
      setProvingEnabled(true)
    } else {
      setProvingEnabled(false)
    }
  }, [qrStatus])

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
        {signal && (
          <>
            <Label>Data you are signing: </Label>
            <SignalDisplay signal={signal} />
          </>
        )}
      </UploadSection>

      <ProveButton
        qrData={qrData}
        provingEnabled={provingEnabled}
        setErrorMessage={setErrorMessage}
        signal={signal}
        setQrStatus={setQrStatus}
        nullifierSeed={nullifierSeed}
        fieldsToReveal={fieldsToReveal}
      />
    </>
  )
}

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
