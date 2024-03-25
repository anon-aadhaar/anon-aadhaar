import {
  NumberArgument,
  StringArrayArgument,
  StringArgument,
} from '@pcd/pcd-types'
import { Groth16Proof } from 'snarkjs'

export type BigNumberish = string | bigint

export const AnonAadhaarTypeName = 'anon-aadhaar'

export enum ArtifactsOrigin {
  'server',
  'local',
  'chunked',
}

/**
 * @dev all the arguments needed to initalize the Core package.
 * You can find these URLs in ./constants.ts
 */
export interface InitArgs {
  wasmURL: string
  zkeyURL: string
  vkeyURL: string
  artifactsOrigin: ArtifactsOrigin
}

/**
 * @dev claim that you have a document signed by pubKey.
 */
export type AnonAadhaarClaim = {
  pubKey: string[]
  signalHash: string
}

/**
 * @dev proof of a correct claim
 */
export type AnonAadhaarProof = {
  groth16Proof: Groth16Proof // 3 points on curve if we use groth16
  pubkeyHash: string
  timestamp: string
  nullifierSeed: string
  nullifier: string
  signalHash: string
  ageAbove18: string
  gender: string
  state: string
  pincode: string
}

/**
 * @dev Arguments needed to compute the witness.
 */
export type AnonAadhaarArgs = {
  qrDataPadded: StringArrayArgument // private
  qrDataPaddedLength: NumberArgument // private
  nonPaddedDataLength: NumberArgument
  delimiterIndices: StringArrayArgument
  signature: StringArrayArgument // private
  pubKey: StringArrayArgument // public
  nullifierSeed: StringArgument // private
  signalHash: StringArgument // public
  revealGender: NumberArgument
  revealAgeAbove18: NumberArgument
  revealState: NumberArgument
  revealPinCode: NumberArgument
}

export type PackedGroth16Proof = [
  BigNumberish,
  BigNumberish,
  BigNumberish,
  BigNumberish,
  BigNumberish,
  BigNumberish,
  BigNumberish,
  BigNumberish
]
