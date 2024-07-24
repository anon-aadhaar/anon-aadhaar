import React, {
  useEffect,
  useState,
  Dispatch,
  SetStateAction,
  useContext,
} from 'react'
import styled from 'styled-components'
import { ProveButton } from './ProveButton'
import { AadhaarQRValidation, ModalViews } from '../../types'
import { SignalDisplay } from './SignalDisplay'
import { AnonAadhaarContext } from '../../hooks/useAnonAadhaar'
import { icons } from '../MainIcons'
import { FieldsToRevealArray, fieldsLabel } from '@anon-aadhaar/core'
import { createBlobURL } from '../../util'

interface ProveModalProps {
  setErrorMessage: Dispatch<SetStateAction<string | null>>
  qrStatus: AadhaarQRValidation | null
  qrData: string | null
  setQrStatus: Dispatch<SetStateAction<AadhaarQRValidation | null>>
  fieldsToReveal?: FieldsToRevealArray
  nullifierSeed: number | bigint
  signal?: string
  setCurrentView: Dispatch<SetStateAction<ModalViews>>
  useTestAadhaar?: boolean
}

export const ProveModal: React.FC<ProveModalProps> = ({
  setErrorMessage,
  qrStatus,
  qrData,
  setQrStatus,
  signal,
  fieldsToReveal,
  nullifierSeed,
  setCurrentView,
  useTestAadhaar,
}) => {
  const [provingEnabled, setProvingEnabled] = useState<boolean>(false)
  const { appName } = useContext(AnonAadhaarContext)
  const noRevealillustration = createBlobURL(icons.eyeOff)
  const revealillustration = createBlobURL(icons.eye)

  useEffect(() => {
    if (qrStatus === AadhaarQRValidation.SIGNATURE_VERIFIED) {
      setProvingEnabled(true)
    } else {
      setProvingEnabled(false)
    }
  }, [qrStatus])

  return (
    <MainContainer>
      <div>
        <TitleSection>YOUR QR CODE IS VERIFIED!</TitleSection>

        <Section>
          <Label>Data you are sharing to {appName}: </Label>
          <RevealSection>
            {fieldsToReveal
              ? fieldsLabel.map(({ key, label }) =>
                  fieldsToReveal.includes(key) ? (
                    <FieldRow key={key}>
                      <DiscloseOn>
                        <Icon src={revealillustration} />
                        {label.toLocaleUpperCase()}
                      </DiscloseOn>
                    </FieldRow>
                  ) : (
                    <FieldRow key={key}>
                      <DiscloseOff>
                        <Icon src={noRevealillustration} />
                        {label.toLocaleUpperCase()}
                      </DiscloseOff>
                    </FieldRow>
                  ),
                )
              : fieldsLabel.map(({ key, label }) => (
                  <FieldRow key={key}>
                    <DiscloseOff>
                      <Icon src={noRevealillustration} />
                      {label.toLocaleUpperCase()}
                    </DiscloseOff>
                  </FieldRow>
                ))}
          </RevealSection>
        </Section>

        {signal && (
          <Section>
            <Label>Data you are signing: </Label>
            <SignalDisplay signal={signal} />
          </Section>
        )}
      </div>
      <div>
        <ProveButton
          qrData={qrData}
          provingEnabled={provingEnabled}
          setErrorMessage={setErrorMessage}
          signal={signal}
          setQrStatus={setQrStatus}
          nullifierSeed={nullifierSeed}
          fieldsToReveal={fieldsToReveal}
          setCurrentView={setCurrentView}
          useTestAadhaar={useTestAadhaar}
        />
        <SmallDisclaimer>
          No Aadhaar data ever leaves your device!
        </SmallDisclaimer>
      </div>
    </MainContainer>
  )
}

const TitleSection = styled.div`
  font-family: 'Rajdhani', sans-serif;
  font-weight: 600; // Regular weight
  font-size: 16px; // Example font size
  color: #333; // Example text color
  line-height: 1.5;
  text-transform: capitalize;
`

// const Disclaimer = styled.span`
//   color: #6d6d6d;
//   margin-top: 0.3rem;
//   font-size: 0.9rem;
//   font-weight: normal;
// `

export const Icon = styled.img`
  height: 1.5rem;
  margin-right: 5px;
`

const DiscloseOn = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  border: solid;
  align-items: center;
  border-color: #009a08;
  border-radius: 4px;
  font-family: 'Rajdhani', sans-serif;
  font-weight: 600;
  color: black;
  padding-top: 8px;
  padding-bottom: 8px;
  padding-left: 12px;
  padding-right: 12px;
`

const DiscloseOff = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  border: solid;
  align-items: center;
  border-color: #b6b9c3;
  border-radius: 4px;
  font-family: 'Rajdhani', sans-serif;
  font-weight: 600;
  color: #b6b9c3;
  padding-top: 8px;
  padding-bottom: 8px;
  padding-left: 12px;
  padding-right: 12px;
`

const Section = styled.div`
  margin-top: 15px;
  row-gap: 1rem;
  max-width: 100%;
`

const Label = styled.div`
  font-size: 14px;
  text-align: left;
  font-weight: 400;
  color: #6b7280;
`
const RevealSection = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 10px;
  margin-top: 10px;
`

const FieldRow = styled.div`
  display: flex;
  align-items: center;
`
const MainContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  width: 100%;
`
const SmallDisclaimer = styled.p`
  font-size: small;
  color: #717686;
  text-decoration: wavy;
  text-align: center;
  margin-top: 10px;
`
