import { useMemo, useState } from 'react'
import { ProveModal } from './ProveModal'
import styled from 'styled-components'
import { useEffect, useContext } from 'react'
import { AnonAadhaarContext } from '../hooks/useAnonAadhaar'
import { icon } from './ButtonLogo'
import { AadhaarQRValidation } from '../interface'
import React from 'react'

interface LogInWithAnonAadhaarProps {
  signal?: string
}

/**
 * LogInWithAnonAadhaar is a React component that provides a user interface
 * for logging in and logging out using the AnonAadhaarContext. It renders a
 * button that triggers a login modal when clicked, and provides methods to
 * initiate user login using the anon aadhaar zk circuit. The component utilizes
 * the authentication state and login request function from the context.
 *
 * @returns A JSX element representing the LogInWithAnonAadhaarV2 component.
 */
export const LogInWithAnonAadhaar = ({ signal }: LogInWithAnonAadhaarProps) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [qrStatus, setQrStatus] = useState<null | AadhaarQRValidation>(null)
  const { state, startReq } = useContext(AnonAadhaarContext)

  const blob = new Blob([icon], { type: 'image/svg+xml' })
  const anonAadhaarLogo = useMemo(() => URL.createObjectURL(blob), [icon])

  useEffect(() => {
    if (state.status === 'logged-in') setIsModalOpen(false)
  }, [state])

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
      {(state.status === 'logged-out' || state.status === 'logging-in') && (
        <div>
          <Btn onClick={openModal}>
            <Logo src={anonAadhaarLogo} />
            Login
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
      )}
      {state.status === 'logged-in' && (
        <div>
          <Btn onClick={() => startReq({ type: 'logout' })}>
            <Logo src={anonAadhaarLogo} />
            Logout
          </Btn>
        </div>
      )}
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
