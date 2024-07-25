import { useState } from 'react'
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
  fieldsToReveal?: FieldsToRevealArray
  nullifierSeed: number | bigint
}

/**
 * LogInWithAnonAadhaar is a React component that provides a user interface
 * for logging in and logging out using the AnonAadhaarContext. It renders a
 * button that triggers a login modal when clicked, and provides methods to
 * initiate user login using the anon aadhaar zk circuit. The component utilizes
 * the authentication state and login request function from the context.
 *
 * @returns A JSX element representing the LogInWithAnonAadhaar component.
 */
export const LogInWithAnonAadhaar = ({
  signal,
  fieldsToReveal,
  nullifierSeed,
}: LogInWithAnonAadhaarProps) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [qrStatus, setQrStatus] = useState<null | AadhaarQRValidation>(null)
  const [currentView, setCurrentView] = useState<ModalViews>('Verify')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { state, startReq, proverState, useTestAadhaar } =
    useContext(AnonAadhaarContext)
  const anonAadhaarLogo = createBlobURL(icons.aalogo)
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

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
      {(state.status === 'logged-out' || state.status === 'logging-in') && (
        <div>
          <Btn onClick={openModal}>
            <Logo src={anonAadhaarLogo} />
            Login
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
      )}
      {state.status === 'logged-in' && (
        <RelativeContainer>
          <Btn onClick={toggleMenu}>
            <Logo src={anonAadhaarLogo} />
            Menu
          </Btn>
          <MenuContainer $isopen={isMenuOpen}>
            <MenuItem onClick={openModal}>Create a proof</MenuItem>
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
            <MenuItem onClick={() => startReq({ type: 'logout' })}>
              Logout
            </MenuItem>
          </MenuContainer>
        </RelativeContainer>
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

const MenuItem = styled.button`
  display: block;
  width: 100%;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  color: #000000;
  text-align: left;
  background: none;
  border: none;
  border-bottom: 1px solid #cccccc;
  cursor: pointer;

  &:hover {
    border-radius: 0.5rem;
    background-color: #f2f2f2;
  }

  &:last-child {
    border-bottom: none;
  }
`

const MenuContainer = styled.div<{ $isopen?: boolean }>`
  display: ${props => (props.$isopen ? 'block' : 'none')};
  position: absolute;
  margin-top: 0.5rem;
  top: 100%;
  right: 0;
  width: 130%;
  background: #fff;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  border-radius: 0.5rem;
  z-index: 10;
`
const RelativeContainer = styled.div`
  position: relative;
  display: inline-block;
`
