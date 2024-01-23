import { NumberArgument, StringArrayArgument } from '@pcd/pcd-types'
import { Groth16Proof } from 'snarkjs'

export type BigNumberish = string | bigint

export const AnonAadhaarPCDTypeName = 'anon-aadhaar-pcd'

export interface PCDInitArgs {
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
export type AnonAadhaarPCDClaim = {
  modulus: string[]
}

/**
 * @dev proof of claim correct
 */
export type AnonAadhaarPCDProof = {
  groth16Proof: Groth16Proof // 3 points on curve if we use groth16
  identityNullifier: string
  userNullifier: string
  timestamp: string
  pubkeyHash: string
  modulus: string[]
}

/**
 * @dev witness use for create zk proof of AnonAadhaarPCD package.
 */
export type AnonAadhaarPCDArgs = {
  padded_message: StringArrayArgument // private witness
  message_len: NumberArgument // private witness
  signature: StringArrayArgument // public witness
  modulus: StringArrayArgument // public witness
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
