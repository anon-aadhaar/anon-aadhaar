import { ArgumentTypeName, SerializedPCD } from '@pcd/pcd-types'
import {
  prove,
  PCDInitArgs,
  init,
  AnonAadhaarPCDArgs,
  serialize,
  AnonAadhaarPCD,
  VK_URL,
  ZKEY_URL,
  WASM_URL,
  extractWitness,
  splitToWords,
} from 'anon-aadhaar-pcd'
import { fetchRawPublicKey } from './util'

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
  pcdArgs: AnonAadhaarPCDArgs,
  isWeb: boolean,
): Promise<{
  pcd: AnonAadhaarPCD
  serialized: SerializedPCD<AnonAadhaarPCD>
}> => {
  const pcdInitArgs: PCDInitArgs = {
    wasmURL: isWeb ? WASM_URL : '/qr_verify.wasm',
    zkeyURL: isWeb ? ZKEY_URL : '/circuit_final.zkey',
    vkeyURL: isWeb ? VK_URL : '/vkey.json',
    isWebEnv: isWeb,
  }

  await init(pcdInitArgs)

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
  testing: boolean,
): Promise<AnonAadhaarPCDArgs> => {
  const certificate = await fetchRawPublicKey(
    `https://www.uidai.gov.in/images/authDoc/${
      testing ? 'uidai_prod_cdup' : 'uidai_offline_publickey_26022021'
    }.cer`,
  )

  if (!certificate) throw Error('Error while fetching public key.')

  const witness = await extractWitness(qrData, certificate)

  if (witness instanceof Error) throw new Error(witness.message)

  const args: AnonAadhaarPCDArgs = {
    padded_message: {
      argumentType: ArgumentTypeName.StringArray,
      value: witness.paddedMessage,
    },
    message_len: {
      argumentType: ArgumentTypeName.Number,
      value: witness.messageLength.toString(),
    },
    signature: {
      argumentType: ArgumentTypeName.StringArray,
      value: splitToWords(witness.signatureBigint, BigInt(64), BigInt(32)),
    },
    modulus: {
      argumentType: ArgumentTypeName.StringArray,
      value: splitToWords(witness.modulusBigint, BigInt(64), BigInt(32)),
    },
  }
  return args
}
