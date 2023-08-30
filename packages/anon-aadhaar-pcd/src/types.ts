import { BigIntArgument } from '@pcd/pcd-types'

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
export interface AnonAadhaarPCDClaim {
  modulus: BigNumberish
}

/**
 * @dev proof of claim correct
 */
export interface AnonAadhaarPCDProof {
  modulus: BigNumberish
  proof: SnarkJSProof // 3 points on curve if we use groth16
}

/**
 * @dev witness use for create zk proof of AnonAadhaarPCD package.
 */
export interface AnonAadhaarPCDArgs {
  base_message: BigIntArgument // private witness
  signature: BigIntArgument // private witness
  modulus: BigIntArgument
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

export interface FullProof {
  modulus: BigNumberish[]
  proof: Proof
}

export interface PCDProof {
  modulus: BigNumberish
  proof: SnarkJSProof
}

export type SnarkJSProof = {
  pi_a: BigNumberish[]
  pi_b: BigNumberish[][]
  pi_c: BigNumberish[]
  protocol: string
  curve: string
}
