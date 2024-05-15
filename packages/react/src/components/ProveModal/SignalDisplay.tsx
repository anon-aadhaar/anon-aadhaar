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

  return <Signal>{displaySignal}</Signal>
}

const Signal = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  border: solid;
  align-items: center;
  border-color: #b6b9c3;
  font-size: 14px;
  border-radius: 4px;
  color: black;
  padding-top: 8px;
  padding-bottom: 8px;
  padding-left: 12px;
  padding-right: 12px;
  margin-top: 10px;
`
