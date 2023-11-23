import { BigIntArgument } from '@pcd/pcd-types'
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
export interface AnonAadhaarPCDClaim {
  modulus: BigNumberish
}

/**
 * @dev proof of claim correct
 */
export interface AnonAadhaarPCDProof {
  nullifier: BigNumberish
  modulus: BigNumberish
  proof: Groth16Proof // 3 points on curve if we use groth16
  app_id: BigNumberish
}

/**
 * @dev witness use for create zk proof of AnonAadhaarPCD package.
 */
export interface AnonAadhaarPCDArgs {
  base_message: BigIntArgument // private witness
  signature: BigIntArgument // private witness
  modulus: BigIntArgument // public witness
  app_id: BigIntArgument // public witness
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
  nullifier: BigNumberish
  proof: Proof
}

export interface PCDProof {
  modulus: BigNumberish
  nullifier: BigNumberish
  proof: Groth16Proof
}

export type WitnessPDFInputs = {
  msgBigInt: bigint
  modulusBigInt: bigint
  sigBigInt: bigint
}
