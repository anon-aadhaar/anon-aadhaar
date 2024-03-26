import React, {
  useEffect,
  useState,
  Dispatch,
  SetStateAction,
  useContext,
  useMemo,
} from 'react'
import styled from 'styled-components'
import { ProveButton } from './ProveButton'
import {
  AadhaarQRValidation,
  FieldsToRevealArray,
  fieldsLabel,
} from '../../types'
import { Logo } from '../LogInWithAnonAadhaar'
import { SignalDisplay } from './SignalDisplay'
import { AnonAadhaarContext } from '../../hooks/useAnonAadhaar'
import { icons } from '../ButtonLogo'

interface ProveModalProps {
  setErrorMessage: Dispatch<SetStateAction<string | null>>
  logo: string
  qrStatus: AadhaarQRValidation | null
  qrData: string | null
  setQrStatus: Dispatch<SetStateAction<AadhaarQRValidation | null>>
  fieldsToReveal?: FieldsToRevealArray
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
  const { appName } = useContext(AnonAadhaarContext)
  const blob = new Blob([icons.illustration], { type: 'image/svg+xml' })
  const noRevealillustration = useMemo(
    () => URL.createObjectURL(blob),
    [icons.illustration],
  )

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
          The signature of your document has been verified, you can now
          genereate your Proof of Identity.
        </Disclaimer>
      </TitleSection>

      {fieldsToReveal === undefined ? (
        <Section>
          <Label>{appName} doesn&apos;t requests you to share any data</Label>
          <Illustration src={noRevealillustration} />
        </Section>
      ) : (
        <Section>
          <Label>{appName} requests you to share data: </Label>
          <RevealSection>
            {fieldsLabel.map(({ key, label }) =>
              fieldsToReveal.includes(key) ? (
                <FieldRow key={key}>
                  <CheckmarkIconWrapper>✅</CheckmarkIconWrapper>
                  <FieldLabel>{label}</FieldLabel>
                </FieldRow>
              ) : null,
            )}
          </RevealSection>
        </Section>
      )}

      {signal && (
        <Section>
          <Label>Data you are signing: </Label>
          <SignalDisplay signal={signal} />
        </Section>
      )}

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

const Section = styled.div`
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
const Illustration = styled.img`
  height: 10rem;
  margin-right: auto;
  margin-left: auto;
`
const RevealSection = styled.div`
  /* Add your styles here */
`

const FieldRow = styled.div`
  display: flex;
  align-items: center;
  /* Add additional styles here */
`

const CheckmarkIconWrapper = styled.div`
  margin-right: 8px; // or whatever spacing you prefer
  // Styles for the checkmark icon wrapper
`

const FieldLabel = styled.span`
  // Styles for the label
`
