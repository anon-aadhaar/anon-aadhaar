import React, { FunctionComponent } from 'react'
import styled from 'styled-components'

interface SignalDisplayProps {
  signal: string | object
}

export const SignalDisplay: FunctionComponent<SignalDisplayProps> = ({
  signal,
}) => {
  const isJsonObject = typeof signal === 'object' && signal !== null
  const displaySignal = isJsonObject ? JSON.stringify(signal, null, 2) : signal

  return (
    <InputFile>
      <FileName id="file-chosen">{displaySignal}</FileName>
    </InputFile>
  )
}

const FileName = styled.span`
  margin-left: 5px;
  white-space: pre-wrap;
  overflow: auto;
  max-height: 200px;
`

const InputFile = styled.div`
  display: flex;
  align-items: center;
  border-radius: 0.5rem;
  border: 1px solid #d1d5db;
  padding: 0.3rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: #111827;
  background-color: #f9fafb;
  margin-top: 0.3rem;
  margin-bottom: 0.8rem;
  max-width: 100%;
`
