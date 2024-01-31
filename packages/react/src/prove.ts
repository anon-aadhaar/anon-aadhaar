import { SerializedPCD } from '@pcd/pcd-types'
import {
  prove,
  AnonAadhaarArgs,
  serialize,
  AnonAadhaarCore,
  generateArgs,
  handleError,
} from '@anon-aadhaar/core'
import { fetchCertificateFile } from './util'

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
): Promise<{
  anonAadhaarProof: AnonAadhaarCore
  serialized: SerializedPCD<AnonAadhaarCore>
}> => {
  const anonAadhaarProof = await prove(anonAadhaarArgs)
  const serialized = await serialize(anonAadhaarProof)

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
  signal?: string,
): Promise<AnonAadhaarArgs> => {
  let certificate: string | null = null
  try {
    certificate = await fetchCertificateFile(
      `https://www.uidai.gov.in/images/authDoc/${
        useTestAadhaar ? 'uidai_prod_cdup' : 'uidai_offline_publickey_26022021'
      }.cer`,
    )
  } catch (e) {
    handleError(e, 'Error while fetching public key.')
  }

  if (!certificate) throw Error('Error while fetching public key.')

  const args = await generateArgs(qrData, certificate, signal)

  return args
}
