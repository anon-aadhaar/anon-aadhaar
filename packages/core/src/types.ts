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
}

/**
 * @dev proof of a correct claim
 */
export type AnonAadhaarProof = {
  groth16Proof: Groth16Proof // 3 points on curve if we use groth16
  pubkeyHash: string
  nullifier: string
  timestamp: string
  countryCommitment: string
  ageAbove18Commitment: string
  genderCommitment: string
  stateCommitment: string
  pinCodeCommitment: string
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
  secret: StringArgument // public
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

export type FieldsToReveal = {
  revealAgeAbove18: boolean
  revealGender: boolean
  revealState: boolean
  revealPinCode: boolean
}

export const fieldsLabel: { key: keyof FieldsToReveal; label: string }[] = [
  { key: 'revealAgeAbove18', label: 'Age Above 18' },
  { key: 'revealGender', label: 'Gender' },
  { key: 'revealState', label: 'State' },
  { key: 'revealPinCode', label: 'PIN Code' },
]

export type FieldKey =
  | 'revealAgeAbove18'
  | 'revealGender'
  | 'revealState'
  | 'revealPinCode'

export type FieldsToRevealArray = FieldKey[]

export type IdFieldsLabels =
  | 'Email_mobile_present_bit_indicator_value'
  | 'ReferenceId'
  | 'Name'
  | 'DOB'
  | 'Gender'
  | 'CareOf'
  | 'District'
  | 'Landmark'
  | 'House'
  | 'Location'
  | 'PinCode'
  | 'PostOffice'
  | 'State'
  | 'Street'
  | 'SubDistrict'
  | 'VTC'
  | 'PhoneNumberLast4'
