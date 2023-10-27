/* eslint-disable @typescript-eslint/ban-ts-comment */
import { DisplayOptions, PCD, PCDPackage, SerializedPCD } from '@pcd/pcd-types'
import {
  PCDInitArgs,
  AnonAadhaarPCDTypeName,
  AnonAadhaarPCDClaim,
  AnonAadhaarPCDProof,
  AnonAadhaarPCDArgs,
} from './types'

import { v4 as uuidv4 } from 'uuid'

// @ts-ignore
import { groth16 } from 'snarkjs'

import { splitToWords } from './utils'
import JSONBig from 'json-bigint'
import { BackendProver, ProverInferace, WebProver } from './prover'
import axios from 'axios'

export class AnonAadhaarPCD
  implements PCD<AnonAadhaarPCDClaim, AnonAadhaarPCDProof>
{
  type = AnonAadhaarPCDTypeName
  claim: AnonAadhaarPCDClaim
  proof: AnonAadhaarPCDProof
  id: string

  public constructor(
    id: string,
    claim: AnonAadhaarPCDClaim,
    proof: AnonAadhaarPCDProof
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

export async function prove(args: AnonAadhaarPCDArgs): Promise<AnonAadhaarPCD> {
  if (!initArgs) {
    throw new Error(
      'cannot make Anon Aadhaar proof: init has not been called yet'
    )
  }

  if (!args.modulus.value) {
    throw new Error('Invalid arguments')
  }

  const id = uuidv4()

  const pcdClaim: AnonAadhaarPCDClaim = {
    modulus: args.modulus.value,
  }

  let prover: ProverInferace

  if (initArgs.isWebEnv) {
    prover = new WebProver(initArgs.wasmURL, initArgs.zkeyURL)
  } else {
    prover = new BackendProver(initArgs.wasmURL, initArgs.zkeyURL)
  }

  const pcdProof = await prover.proving(args)

  return new AnonAadhaarPCD(id, pcdClaim, pcdProof)
}

async function getVerifyKey() {
  let vk
  if (!initArgs) {
    throw new Error(
      'cannot make Anon Aadhaar proof: init has not been called yet'
    )
  }
  if (initArgs.isWebEnv) {
    vk = await axios.get(initArgs.vkeyURL).then(response => {
      return response.data
    })
  } else {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    vk = require(initArgs.vkeyURL)
  }
  return vk
}

export async function verify(pcd: AnonAadhaarPCD): Promise<boolean> {
  const vk = await getVerifyKey()

  return groth16.verify(
    vk,
    [...splitToWords(BigInt(pcd.proof.modulus), BigInt(64), BigInt(32))],
    pcd.proof.proof
  )
}

export function serialize(
  pcd: AnonAadhaarPCD
): Promise<SerializedPCD<AnonAadhaarPCD>> {
  return Promise.resolve({
    type: AnonAadhaarPCDTypeName,
    pcd: JSONBig().stringify({
      type: pcd.type,
      id: pcd.id,
      claim: pcd.claim,
      proof: pcd.proof,
    }),
  } as SerializedPCD<AnonAadhaarPCD>)
}

export async function deserialize(serialized: string): Promise<AnonAadhaarPCD> {
  return JSONBig().parse(serialized)
}

export function getDisplayOptions(pcd: AnonAadhaarPCD): DisplayOptions {
  return {
    header: 'Anon Aadhaar Signature',
    displayName: 'pcd-' + pcd.type,
  }
}

export const AnonAadhaarPCDPackage: PCDPackage<
  AnonAadhaarPCDClaim,
  AnonAadhaarPCDProof,
  AnonAadhaarPCDArgs,
  PCDInitArgs
> = {
  name: AnonAadhaarPCDTypeName,
  getDisplayOptions,
  prove,
  init,
  verify,
  serialize,
  deserialize,
}
