import { SerializedPCD } from '@pcd/pcd-types'
import {
  prove,
  AnonAadhaarArgs,
  serialize,
  AnonAadhaarCore,
  generateArgs,
  ProverState,
  FieldsToRevealArray,
} from '@anon-aadhaar/core'
import { Dispatch, SetStateAction } from 'react'
import { verifySignature } from './verifySignature'
import { testCertificate } from './publicKeys'

/**
 * `proveAndSerialize` is a function that generates proofs using the web-based proving system of Anon Aadhaar.
 * It takes an argument of type `AnonAadhaarArgs` and returns a Promise. This Promise resolves to an object containing
 * the generated `anonAadhaarProof` (`AnonAadhaarCore`) and its serialized form (`SerializedPCD<AnonAadhaarCore>`).
 *
 * @param {AnonAadhaarArgs} anonAadhaarArgs - The arguments required to generate the IdentityPCD.
 * @returns {Promise<{anonAadhaarProof: AnonAadhaarCore, serialized: SerializedPCD<AnonAadhaarCore>}>}
 *   A Promise resolving to an object with the generated anonAadhaarProof and its serialized form.
 *
 * @see {@link https://github.com/anon-aadhaar/anon-aadhaar}
 *   For more information about the Anon Aadhaar's underlying circuit and proving system.
 */
export const proveAndSerialize = async (
  anonAadhaarArgs: AnonAadhaarArgs,
  setProverState?: Dispatch<SetStateAction<ProverState>>,
): Promise<{
  anonAadhaarProof: AnonAadhaarCore
  serialized: SerializedPCD<AnonAadhaarCore>
}> => {
  let anonAadhaarProof
  let serialized
  try {
    anonAadhaarProof = await prove(anonAadhaarArgs, setProverState)
    serialized = await serialize(anonAadhaarProof)
  } catch (e) {
    console.error(e)
    throw new Error('Error while generating the proof')
  }

  return { anonAadhaarProof, serialized }
}

/**
 * `processAadhaarArgs` is a function that processes QR data to generate arguments required by the prover.
 * It converts the QR data scanned into a format suitable for generating proofs in the Anon Aadhaar system.
 *
 * @param {string} qrData - The QR data scanned by the user. This data contains the information necessary
 *                          to generate the arguments for the IdentityPCD.
 * @param {boolean} useTestAadhaar - A flag indicating whether to use test Aadhaar data. This helps in
 *                                   differentiating between a production and a test environment.
 * @returns {Promise<AnonAadhaarArgs>} A Promise that resolves to the `AnonAadhaarArgs` object.
 *                                     This object contains the parameters needed to generate a proof.
 *
 */
export const processAadhaarArgs = async (
  qrData: string,
  useTestAadhaar: boolean,
  nullifierSeed: number | bigint,
  fieldsToRevealArray?: FieldsToRevealArray,
  signal?: string,
): Promise<AnonAadhaarArgs> => {
  let certificateFile: string | null = null
  try {
    if (useTestAadhaar) {
      return generateArgs({
        qrData,
        certificateFile: testCertificate,
        nullifierSeed,
        fieldsToRevealArray,
        signal,
      })
    } else {
      const { isSignatureValid, certificate } = await verifySignature(
        qrData,
        useTestAadhaar,
      )

      if (!certificate)
        throw new Error(
          '[processAadhaarArgs]: Error while processing the arguments, no certificate retrieved',
        )

      if (isSignatureValid) certificateFile = certificate

      if (!certificateFile) throw Error('Error while fetching public key.')

      return generateArgs({
        qrData,
        certificateFile,
        nullifierSeed,
        fieldsToRevealArray,
        signal,
      })
    }
  } catch (error) {
    if (error instanceof Error) throw new Error(error.message)
    throw new Error(JSON.stringify(error))
  }
}
