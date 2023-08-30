/* eslint-disable react/no-unescaped-entities */
import { AnonAadhaarPCD } from './pcd'
import styled from 'styled-components'
import { FieldLabel, Separator, Spacer, TextContainer } from '@pcd/passport-ui'

export function AnonAadhaarPCDCardBody({ pcd }: { pcd: AnonAadhaarPCD }) {
  return (
    <Container>
      <p>
        This PCD represents an identity signal in the context of the Aadhaar
        card program. In other words, this is a ZK proof that you're an indian
        citizen and have an Aadhaar card.
      </p>

      <Separator />
      <FieldLabel>Modulus</FieldLabel>
      <TextContainer>{pcd.claim.modulus.toString()}</TextContainer>
      <Spacer h={8} />
    </Container>
  )
}

const Container = styled.div`
  padding: 16px;
  overflow: hidden;
  width: 100%;
`
