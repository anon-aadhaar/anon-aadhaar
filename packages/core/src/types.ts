import {
  NumberArgument,
  StringArrayArgument,
  StringArgument,
} from '@pcd/pcd-types'
import { Groth16Proof } from 'snarkjs'

export type BigNumberish = string | bigint

export const AnonAadhaarTypeName = 'anon-aadhaar'

export interface InitArgs {
  // TODO: how do we distribute these in-package, so that consumers
  // of the package don't have to copy-paste these artifacts?
  // TODO: how do we account for different versions of the same type
  // of artifact? eg. this one is parameterized by group size. Should
  // we pre-generate a bunch of artifacts per possible group size?
  // Should we do code-gen?
  wasmURL: string
  zkeyURL: string
  vkeyURL: string
  isWebEnv: boolean
}

/**
 * @dev claim this public key signed a message
 */
export type AnonAadhaarClaim = {
  pubKey: string[]
  signalHash: string
}

/**
 * @dev proof of claim correct
 */
export type AnonAadhaarProof = {
  groth16Proof: Groth16Proof // 3 points on curve if we use groth16
  identityNullifier: string
  userNullifier: string
  timestamp: string
  pubkeyHash: string
  signalHash: string
}

/**
 * @dev witness use for create zk proof of AnonAadhaarPCD package.
 */
export type AnonAadhaarArgs = {
  aadhaarData: StringArrayArgument // private
  aadhaarDataLength: NumberArgument // private
  signature: StringArrayArgument // private
  pubKey: StringArrayArgument // public
  signalHash: StringArgument // public
}

export type Proof = [
  BigNumberish,
  BigNumberish,
  BigNumberish,
  BigNumberish,
  BigNumberish,
  BigNumberish,
  BigNumberish,
  BigNumberish
]

export type WitnessQRInputs = {
  paddedMessage: string[]
  messageLength: number
  signatureBigint: bigint
  modulusBigint: bigint
}
