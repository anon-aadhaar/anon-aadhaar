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
 * proveAndSerialize is a function that generates proofs using the web-based proving system of anon-aadhaar.
 * It takes an IdentityPCDArgs argument and returns a Promise containing the generated IdentityPCD and its
 * serialized form (SerializedPCD).
 *
 * @param pcdArgs - The arguments required to generate the IdentityPCD.
 * @returns A Promise containing the generated IdentityPCD and its serialized form.
 *
 * @see {@link https://github.com/privacy-scaling-explorations/anon-aadhaar}
 *   For more information about the underlying circuit and proving system.
 */
export const proveAndSerialize = async (
  pcdArgs: AnonAadhaarArgs,
): Promise<{
  pcd: AnonAadhaarCore
  serialized: SerializedPCD<AnonAadhaarCore>
}> => {
  const pcd = await prove(pcdArgs)
  const serialized = await serialize(pcd)

  return { pcd, serialized }
}

/**
 * processArgs is a function that generates the arguments to pass to the prover from the QR Data scanned.
 *
 * @param {string} qrData - The arguments required to generate the IdentityPCD.
 * @returns A Promise containing the generated args object containing the parameters needed to generate a proof.
 *
 * @see {@link https://github.com/privacy-scaling-explorations/anon-aadhaar}
 *   For more information about the underlying circuit and proving system.
 */
export const processArgs = async (
  qrData: string,
  useTestAadhaar: boolean,
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

  const args = await generateArgs(qrData, certificate)

  return args
}
