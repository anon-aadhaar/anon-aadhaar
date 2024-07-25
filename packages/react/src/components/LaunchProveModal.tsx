import { CSSProperties, useState } from 'react'
import { Modal } from './ProveModal/Modal'
import styled from 'styled-components'
import { useEffect, useContext } from 'react'
import { AnonAadhaarContext } from '../hooks/useAnonAadhaar'
import { icons } from './MainIcons'
import { AadhaarQRValidation, ModalViews } from '../types'
import { ProverState, FieldsToRevealArray } from '@anon-aadhaar/core'
import { createBlobURL } from '../util'

interface LogInWithAnonAadhaarProps {
  signal?: string
  buttonStyle?: CSSProperties
  buttonTitle?: string
  fieldsToReveal?: FieldsToRevealArray
  nullifierSeed: number | bigint
}

/**
 * LaunchProveModal is a React component that provides a user interface
 * to launch the prove Modal and start the proof generation using the AnonAadhaarContext.
 * It renders a button that triggers a prove modal when clicked, and provides methods to
 * initiate user proof using the anon aadhaar zk circuit.
 *
 * @returns A JSX element representing the LaunchProveModal component.
 */
export const LaunchProveModal = ({
  signal,
  buttonStyle,
  fieldsToReveal,
  nullifierSeed,
  buttonTitle = 'Generate a proof',
}: LogInWithAnonAadhaarProps) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [qrStatus, setQrStatus] = useState<null | AadhaarQRValidation>(null)
  const [currentView, setCurrentView] = useState<ModalViews>('Verify')
  const { proverState, useTestAadhaar } = useContext(AnonAadhaarContext)
  const anonAadhaarLogo = createBlobURL(icons.aalogo)

  useEffect(() => {
    if (proverState === ProverState.Completed) closeModal()
  }, [proverState])

  const openModal = () => {
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setErrorMessage(null)
    setQrStatus(null)
    setCurrentView('Verify')
  }

  return (
    <div>
      <Btn style={buttonStyle} onClick={openModal}>
        <Logo src={anonAadhaarLogo} />
        {buttonTitle}
      </Btn>
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
        logo={anonAadhaarLogo}
        qrStatus={qrStatus}
        setQrStatus={setQrStatus}
        signal={signal}
        fieldsToReveal={fieldsToReveal}
        nullifierSeed={nullifierSeed}
        setCurrentView={setCurrentView}
        currentView={currentView}
        useTestAadhaar={useTestAadhaar}
      ></Modal>
    </div>
  )
}

export const Logo = styled.img`
  height: 1.5rem;
  margin-right: 0.5rem;
`

const Btn = styled.button`
  display: flex;
  padding: 0 1rem;
  font-size: 1rem;
  cursor: pointer;
  color: #000000;
  font-weight: bold;
  border-radius: 1.3125rem;
  background: #fff;
  box-shadow: 0px 3px 8px 1px rgba(0, 0, 0, 0.25);
  border: none;
  min-height: 2.5rem;
  border-radius: 0.5rem;
  align-items: center;

  &:hover {
    background: #fafafa;
  }

  &:active {
    background: #f8f8f8;
  }

  &:disabled {
    color: #a8aaaf;
    background: #e8e8e8;
    cursor: default;
  }
`
