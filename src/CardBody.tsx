/* eslint-disable react/no-unescaped-entities */
import { IdentityPCD } from './pcd'
import styled from 'styled-components'
import { FieldLabel, Separator, Spacer, TextContainer } from '@pcd/passport-ui'

export function IdentityPCDCardBody({ pcd }: { pcd: IdentityPCD }) {
  return (
    <Container>
      <p>
        This PCD represents an identity signal in the context of the Aadhaar
        card program. In other words, this is a ZK proof that you're an indian
        citizen and have an Aadhaar card.
      </p>

      <Separator />

      <FieldLabel>Exp</FieldLabel>
      <TextContainer>{pcd.claim.exp.toString()}</TextContainer>
      <Spacer h={8} />

      <FieldLabel>Mod</FieldLabel>
      <TextContainer>{pcd.claim.mod.toString()}</TextContainer>
      <Spacer h={8} />
    </Container>
  )
}

const Container = styled.div`
  padding: 16px;
  overflow: hidden;
  width: 100%;
`
