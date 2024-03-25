import { CSSProperties, useMemo, useState } from 'react'
import { ProveModal } from './ProveModal'
import styled from 'styled-components'
import { useEffect, useContext } from 'react'
import { AnonAadhaarContext } from '../hooks/useAnonAadhaar'
import { icon } from './ButtonLogo'
import { AadhaarQRValidation } from '../interface'
import { ProverState } from '@anon-aadhaar/core'

interface LogInWithAnonAadhaarProps {
  signal?: string
  buttonStyle?: CSSProperties
  buttonTitle?: string
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
  buttonTitle = 'Generate a proof',
}: LogInWithAnonAadhaarProps) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [qrStatus, setQrStatus] = useState<null | AadhaarQRValidation>(null)
  const { proverState } = useContext(AnonAadhaarContext)

  const blob = new Blob([icon], { type: 'image/svg+xml' })
  const anonAadhaarLogo = useMemo(() => URL.createObjectURL(blob), [icon])

  useEffect(() => {
    if (proverState === ProverState.Completed) setIsModalOpen(false)
  }, [proverState])

  const openModal = () => {
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setErrorMessage(null)
    setQrStatus(null)
  }

  return (
    <div>
      <Btn style={buttonStyle} onClick={openModal}>
        <Logo src={anonAadhaarLogo} />
        {buttonTitle}
      </Btn>
      <ProveModal
        isOpen={isModalOpen}
        onClose={closeModal}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
        logo={anonAadhaarLogo}
        qrStatus={qrStatus}
        setQrStatus={setQrStatus}
        signal={signal}
      ></ProveModal>
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
