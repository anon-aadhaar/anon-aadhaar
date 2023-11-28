import React, {
  FunctionComponent,
  useState,
  Dispatch,
  SetStateAction,
  useEffect,
} from 'react'
import styled from 'styled-components'

interface ErrorToastProps {
  message: string | null
  setErrorMessage: Dispatch<SetStateAction<string | null>>
}

export const ErrorToast: FunctionComponent<ErrorToastProps> = ({
  message,
  setErrorMessage,
}) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    console.log('Rendering Erreur Component')
  })

  useEffect(() => {
    if (message) setIsVisible(true)
  }, [message])

  const handleClose = () => {
    setIsVisible(false)
    setErrorMessage(null)
  }

  return (
    <>
      {isVisible && (
        <Box>
          <Message>{message}</Message>
          <CloseButton onClick={handleClose} />
        </Box>
      )}
    </>
  )
}

const Box = styled.div`
  display: flex;
  position: absolute;
  width: 90%;
  border-radius: 5px;
  background-color: #efc8c8;
  padding: 4px;
  align-items: flex-start; /* Align items to the top */
`

const Message = styled.div`
  margin-left: 3px;
  font-size: 0.875rem;
  color: #a00f0f;
  flex: 1; /* Allow message to expand */
  width: fit-content; /* Adjust to fit your layout */
  max-width: 92%; /* Maximum width for the message */
  overflow: hidden; /* Hide overflow content */
  text-overflow: ellipsis; /* Show ellipsis for overflow */
`

const CloseButton = styled.button`
  border: none;
  background: none;
  color: #a00f0f;
  cursor: pointer;
  width: 24px; /* Fixed width */
  height: 24px; /* Fixed height */
  display: flex;
  align-items: center;
  justify-content: center;

  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 2px;
    height: 12px;
    background-color: currentColor;
  }

  &::before {
    transform: rotate(45deg);
  }

  &::after {
    transform: rotate(-45deg);
  }
`
