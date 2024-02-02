import {
  convertBigIntToByteArray,
  decompressByteArray,
} from '@anon-aadhaar/core'
import { fetchCertificateFile, str2ab } from './util'
import { pki } from 'node-forge'

/**
 * `verifySignature` verifies the digital signature of the provided data.
 * It first converts the string data to a big integer, processes it into a byte array,
 * and then decompresses this byte array. After extracting the signature and signed data,
 * it fetches the public key from a certificate URL, and uses this public key to verify
 * the signature against the signed data.
 *
 * @param {string} qrData - The string representation of the data to be verified.
 * @param {boolean} useTestAadhaar - A flag indicating whether to use the test Aadhaar Data or real Aadhaar data.
 * @returns {Promise<boolean>} A promise that resolves to a boolean indicating if the signature is valid.
 *
 * @remarks
 * The function fetches a public key certificate from UIDAI's server (for India's Aadhaar system),
 * either from the production or testing environment based on the `testing` flag.
 * It then uses this public key to verify the signature.
 */
export const verifySignature = async (
  qrData: string,
  useTestAadhaar: boolean,
): Promise<boolean> => {
  const bigIntData = BigInt(qrData)

  const byteArray = convertBigIntToByteArray(bigIntData)

  const decompressedByteArray = decompressByteArray(byteArray)

  // Read signature data
  const signature = decompressedByteArray.slice(
    decompressedByteArray.length - 256,
    decompressedByteArray.length,
  )

  const signedData = decompressedByteArray.slice(
    0,
    decompressedByteArray.length - 256,
  )

  const certificate = await fetchCertificateFile(
    `https://www.uidai.gov.in/images/authDoc/${
      useTestAadhaar ? 'uidai_prod_cdup' : 'uidai_offline_publickey_26022021'
    }.cer`,
  )

  if (!certificate) throw Error('Error while fetching public key.')

  const publicKey = pki.certificateFromPem(certificate).publicKey
  const publicKeyPem = pki.publicKeyToPem(publicKey)

  // fetch the part of the PEM string between header and footer
  const pemHeader = '-----BEGIN PUBLIC KEY-----'
  const pemFooter = '-----END PUBLIC KEY-----'
  const pemContents = publicKeyPem.substring(
    pemHeader.length,
    publicKeyPem.length - pemFooter.length - 2,
  )

  // base64 decode the string to get the binary data
  const binaryDerString = window.atob(pemContents)
  // convert from a binary string to an ArrayBuffer
  const binaryDer = str2ab(binaryDerString)

  const pk = await window.crypto.subtle.importKey(
    'spki',
    binaryDer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    true,
    ['verify'],
  )

  const isSignatureValid = await window.crypto.subtle.verify(
    { name: 'RSASSA-PKCS1-v1_5' },
    pk,
    signature.buffer,
    signedData.buffer,
  )

  return isSignatureValid
}
