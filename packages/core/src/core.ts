import { DisplayOptions, PCD, PCDPackage, SerializedPCD } from '@pcd/pcd-types'
import {
  InitArgs,
  AnonAadhaarTypeName,
  AnonAadhaarClaim,
  AnonAadhaarProof,
  AnonAadhaarArgs,
  ArtifactsOrigin,
  ProverState,
} from './types'

import { v4 as uuidv4 } from 'uuid'
import { groth16 } from 'snarkjs'
import JSONBig from 'json-bigint'
import { AnonAadhaarProver, ProverInferace } from './prover'
import { productionPublicKeyHash, testPublicKeyHash } from './constants'
import { convertRevealBigIntToString } from './utils'

export class AnonAadhaarCore
  implements PCD<AnonAadhaarClaim, AnonAadhaarProof>
{
  type = AnonAadhaarTypeName
  claim: AnonAadhaarClaim
  proof: AnonAadhaarProof
  id: string

  public constructor(
    id: string,
    claim: AnonAadhaarClaim,
    proof: AnonAadhaarProof
  ) {
    this.id = id
    this.claim = claim
    this.proof = proof
  }
}

// initial function
let initArgs: InitArgs | undefined = undefined
export async function init(args: InitArgs): Promise<void> {
  initArgs = args
}

export async function prove(
  args: AnonAadhaarArgs,
  updateState?: (state: ProverState) => void
): Promise<AnonAadhaarCore> {
  if (!initArgs) {
    throw new Error(
      'cannot make Anon Aadhaar proof: init has not been called yet'
    )
  }

  if (!args.pubKey.value) {
    throw new Error('Invalid pubKey argument')
  }

  if (!args.signalHash.value) {
    throw new Error('Invalid signalHash argument')
  }

  if (!args.revealAgeAbove18.value) {
    throw new Error('Invalid revealAgeAbove18 argument')
  }

  const id = uuidv4()

  const prover: ProverInferace = new AnonAadhaarProver(
    initArgs.wasmURL,
    initArgs.zkeyURL,
    initArgs.artifactsOrigin
  )

  const anonAadhaarProof = await prover.proving(args, updateState)

  const anonAadhaarClaim: AnonAadhaarClaim = {
    pubKey: args.pubKey.value,
    signalHash: args.signalHash.value,
    ageAbove18:
      args.revealAgeAbove18.value === '1'
        ? anonAadhaarProof.ageAbove18 === '1'
        : null,
    gender: convertRevealBigIntToString(anonAadhaarProof.gender) || null,
    pincode: anonAadhaarProof.pincode === '0' ? null : anonAadhaarProof.pincode,
    state: convertRevealBigIntToString(anonAadhaarProof.state) || null,
  }

  return new AnonAadhaarCore(id, anonAadhaarClaim, anonAadhaarProof)
}

async function getVerifyKey() {
  let vk
  if (!initArgs) {
    throw new Error(
      'cannot make Anon Aadhaar proof: init has not been called yet'
    )
  }
  if (initArgs.artifactsOrigin === ArtifactsOrigin.local) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    vk = require(initArgs.vkeyURL)
  } else {
    const response = await fetch(initArgs.vkeyURL)
    if (!response.ok) {
      throw new Error(`Failed to fetch the verify key from server`)
    }

    vk = await response.json()
  }
  return vk
}

export async function verify(
  pcd: AnonAadhaarCore,
  useTestAadhaar?: boolean
): Promise<boolean> {
  let pubkeyHash = productionPublicKeyHash

  if (useTestAadhaar) {
    pubkeyHash = testPublicKeyHash
  }

  if (pcd.proof.pubkeyHash !== pubkeyHash) {
    throw new Error('VerificationError: public key mismatch.')
  }

  const vk = await getVerifyKey()

  return groth16.verify(
    vk,
    [
      pcd.proof.pubkeyHash,
      pcd.proof.nullifier,
      pcd.proof.timestamp,
      pcd.proof.ageAbove18,
      pcd.proof.gender,
      pcd.proof.pincode,
      pcd.proof.state,
      pcd.proof.nullifierSeed,
      pcd.proof.signalHash,
    ],
    pcd.proof.groth16Proof
  )
}

export function serialize(
  pcd: AnonAadhaarCore
): Promise<SerializedPCD<AnonAadhaarCore>> {
  return Promise.resolve({
    type: AnonAadhaarTypeName,
    pcd: JSONBig().stringify({
      type: pcd.type,
      id: pcd.id,
      claim: pcd.claim,
      proof: pcd.proof,
    }),
  } as SerializedPCD<AnonAadhaarCore>)
}

export async function deserialize(
  serialized: string
): Promise<AnonAadhaarCore> {
  return JSONBig().parse(serialized)
}

export function getDisplayOptions(pcd: AnonAadhaarCore): DisplayOptions {
  return {
    header: 'Anon Aadhaar Signature',
    displayName: 'pcd-' + pcd.type,
  }
}

export const AnonAadhaarCorePackage: PCDPackage<
  AnonAadhaarClaim,
  AnonAadhaarProof,
  AnonAadhaarArgs,
  InitArgs
> = {
  name: AnonAadhaarTypeName,
  getDisplayOptions,
  prove,
  init,
  verify,
  serialize,
  deserialize,
}
