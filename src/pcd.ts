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
import { IdentityPCDCardBody } from './CardBody'
import { BackendProver, ProverInferace, WebProver } from './prover'

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

  if (!args.exp.value || !args.mod.value) {
    throw new Error('Invalid arguments')
  }

  const id = uuidv4()

  const pcdClaim: IdentityPCDClaim = {
    exp: args.exp.value,
    mod: args.mod.value,
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

export async function verify(pcd: IdentityPCD): Promise<boolean> {
  const vk = getVerifyKey()
  return groth16.verify(
    vk,
    [
      ...splitToWords(BigInt(65337), BigInt(64), BigInt(32)),
      ...splitToWords(BigInt(pcd.proof.mod), BigInt(64), BigInt(32)),
    ],
    pcd.proof.proof
  )
}

export function serialize(
  pcd: IdentityPCD
): Promise<SerializedPCD<IdentityPCD>> {
  return Promise.resolve({
    type: IdentityPCDTypeName,
    pcd: JSON.stringify({
      type: pcd.type,
      id: pcd.id,
      claim: pcd.claim,
    }),
  } as SerializedPCD<IdentityPCD>)
}

export function deserialize(serialized: string): Promise<IdentityPCD> {
  return JSON.parse(serialized)
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
