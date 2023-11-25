import React, { FunctionComponent, Dispatch, SetStateAction } from 'react'
import styled from 'styled-components'

interface PasswordInputProps {
  setPassword: Dispatch<SetStateAction<string>>
  id: string
}

export const PasswordInput: FunctionComponent<PasswordInputProps> = ({
  setPassword,
  id,
}) => {
  return (
    <InputPass
      type="password"
      id={id}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value)
      }}
    />
  )
}

const InputPass = styled.input`
  display: flex;
  align-items: center;
  width: 100%;
  border-radius: 0.5rem;
  border-width: 1px;
  border-color: #d1d5db;
  font-size: 18px;
  line-height: 1.75rem;
  color: #111827;
  background-color: #f9fafb;
  cursor: text;
  margin-top: 0.3rem;
  padding: 0.3rem;
`
