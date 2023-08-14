import { useCallback, useState } from 'react'
import styled from 'styled-components'

export const Container = styled.div`
  font-family: system-ui, sans-serif;
  border: 1px solid black;
  border-radius: 8px;
  padding: 8px;
  margin-bottom: 8px;
`

export const Proof = ({ code, label }: { code: string; label?: string }) => {
  const [collapsed, setCollapsed] = useState(true)

  const toggle = useCallback(() => {
    setCollapsed(collapsed => !collapsed)
  }, [])

  let buttonText = collapsed ? 'Expand' : 'Collapse'
  if (label !== undefined) {
    buttonText += ' ' + label
  }

  if (collapsed) {
    return <RevealProofBtn onClick={toggle}>{buttonText}</RevealProofBtn>
  }

  return (
    <>
      <RevealProofBtn onClick={toggle}>{buttonText}</RevealProofBtn>
      <ProofContainer>
        <pre>{code}</pre>
      </ProofContainer>
    </>
  )
}

const ProofContainer = styled.div`
  border-radius: 8px;
  border: 1px solid grey;
  overflow-y: scroll;
  max-width: 100%;
  padding: 8px;
`

const RevealProofBtn = styled.button`
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  color: #000000;
  font-weight: bold;
  border-radius: 1.3125rem;
  background: #fff;
  box-shadow: 0px 3px 8px 1px rgba(0, 0, 0, 0.25);
  border: none;
  min-width: 12rem;
  min-height: 3rem;
  border-radius: 0.5rem;
`
