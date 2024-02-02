import React, { FunctionComponent } from 'react'
import styled from 'styled-components'

interface SignalDisplayProps {
  signal: string
}

export const SignalDisplay: FunctionComponent<SignalDisplayProps> = ({
  signal,
}) => {
  return (
    <InputFile>
      <FileName id="file-chosen">{signal}</FileName>
    </InputFile>
  )
}

const FileName = styled.span`
  margin-left: 5px;
`

const InputFile = styled.div`
  display: flex;
  align-items: center;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 80%;
  border-radius: 0.5rem;
  border-width: 1px;
  border-color: #d1d5db;
  max-width: 100%;
  font-size: 0.875rem;
  line-height: 2.25rem;
  color: #111827;
  background-color: #f9fafb;
  margin-top: 0.3rem;
  margin-bottom: 0.8rem;
`
