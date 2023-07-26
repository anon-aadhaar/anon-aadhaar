/* eslint-disable @typescript-eslint/ban-ts-comment */
import { DisplayOptions, PCD, PCDPackage, SerializedPCD } from '@pcd/pcd-types'
import {
  PCDInitArgs,
  IdentityPCDTypeName,
  IdentityPCDClaim,
  IdentityPCDProof,
  IdentityPCDArgs,
} from './types'

import { v4 as uuidv4 } from 'uuid'

// @ts-ignore
import { groth16 } from 'snarkjs'

import { splitToWords } from './utils'
import JSONBig from 'json-bigint'
import { IdentityPCDCardBody } from './CardBody'
import { BackendProver, ProverInferace, WebProver } from './prover'
import axios from 'axios'

export class IdentityPCD implements PCD<IdentityPCDClaim, IdentityPCDProof> {
  type = IdentityPCDTypeName
  claim: IdentityPCDClaim
  proof: IdentityPCDProof
  id: string

  public constructor(
    id: string,
    claim: IdentityPCDClaim,
    proof: IdentityPCDProof
  ) {
    this.id = id
    this.claim = claim
    this.proof = proof
  }
}

// initial function
let initArgs: PCDInitArgs | undefined = undefined
export async function init(args: PCDInitArgs): Promise<void> {
  initArgs = args
}

export async function prove(args: IdentityPCDArgs): Promise<IdentityPCD> {
  if (!initArgs) {
    throw new Error(
      'cannot make semaphore signature proof: init has not been called yet'
    )
  }

  if (!args.modulus.value) {
    throw new Error('Invalid arguments')
  }

  const id = uuidv4()

  const pcdClaim: IdentityPCDClaim = {
    modulus: args.modulus.value,
  }

  let prover: ProverInferace

  if (initArgs.isWebEnv) {
    prover = new WebProver(initArgs.wasmURL, initArgs.zkeyURL)
  } else {
    prover = new BackendProver(initArgs.wasmURL, initArgs.zkeyURL)
  }

  const pcdProof = await prover.proving(args)

  return new IdentityPCD(id, pcdClaim, pcdProof)
}

function getVerifyKey() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const verifyKey = require('../artifacts/verification_key.json')
  return verifyKey
}

export async function verify(
  pcd: IdentityPCD,
  isWebEnv?: boolean
): Promise<boolean> {
  let vk
  if (isWebEnv === true) {
    vk = await axios
      .get('https://d3dxq5smiosdl4.cloudfront.net/verification_key.json')
      .then(response => {
        return response.data
      })
  } else {
    vk = getVerifyKey()
  }
  return groth16.verify(
    vk,
    [...splitToWords(BigInt(pcd.proof.modulus), BigInt(64), BigInt(32))],
    pcd.proof.proof
  )
}

export function serialize(
  pcd: IdentityPCD
): Promise<SerializedPCD<IdentityPCD>> {
  return Promise.resolve({
    type: IdentityPCDTypeName,
    pcd: JSONBig().stringify({
      type: pcd.type,
      id: pcd.id,
      claim: pcd.claim,
      proof: pcd.proof,
    }),
  } as SerializedPCD<IdentityPCD>)
}

export async function deserialize(serialized: string): Promise<IdentityPCD> {
  return JSONBig().parse(serialized)
}

export function getDisplayOptions(pcd: IdentityPCD): DisplayOptions {
  return {
    header: 'Country Identity Signature',
    displayName: 'pcd-' + pcd.type,
  }
}

export const IdentityPCDPackage: PCDPackage<
  IdentityPCDClaim,
  IdentityPCDProof,
  IdentityPCDArgs,
  PCDInitArgs
> = {
  name: IdentityPCDTypeName,
  renderCardBody: IdentityPCDCardBody,
  getDisplayOptions,
  prove,
  init,
  verify,
  serialize,
  deserialize,
}
