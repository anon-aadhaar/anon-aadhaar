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
  identityNullifier: string
  userNullifier: string
  timestamp: string
  pubkeyHash: string
  signalHash: string
}

/**
 * @dev Arguments needed to compute the witness.
 */
export type AnonAadhaarArgs = {
  aadhaarData: StringArrayArgument // private
  aadhaarDataLength: NumberArgument // private
  signature: StringArrayArgument // private
  pubKey: StringArrayArgument // public
  signalHash: StringArgument // public
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

export enum ProverState {
  Initializing = 'initializing',
  FetchingWasm = 'fetching-wasm',
  FetchingZkey = 'fetching-zkey',
  Proving = 'proving',
  Completed = 'completed',
  Error = 'error',
}
