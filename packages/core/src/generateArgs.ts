import {
  convertBigIntToByteArray,
  decompressByteArray,
  splitToWords,
} from './utils'
import { AnonAadhaarPCDArgs } from './types'
import { sha256Pad } from '@zk-email/helpers/dist/shaHash'
import { Buffer } from 'buffer'
import {
  bufferToHex,
  Uint8ArrayToCharArray,
} from '@zk-email/helpers/dist/binaryFormat'
import { pki } from 'node-forge'
import { ArgumentTypeName } from '@pcd/pcd-types'

/**
 * Extract all the information needed to generate the witness from the QRCode data.
 * @param qrData QrCode Data
 * @returns {witness}
 */
export const generateArgs = async (
  qrData: string,
  certificateFile: string
): Promise<AnonAadhaarPCDArgs> => {
  const bigIntData = BigInt(qrData)

  const byteArray = convertBigIntToByteArray(bigIntData)

  const decompressedByteArray = decompressByteArray(byteArray)

  // Read signature data
  const signature = decompressedByteArray.slice(
    decompressedByteArray.length - 256,
    decompressedByteArray.length
  )

  const signedData = decompressedByteArray.slice(
    0,
    decompressedByteArray.length - 256
  )

  const RSAPublicKey = pki.certificateFromPem(certificateFile).publicKey
  const publicKey = (RSAPublicKey as pki.rsa.PublicKey).n.toString(16)

  const modulusBigint = BigInt('0x' + publicKey)

  const signatureBigint = BigInt(
    '0x' + bufferToHex(Buffer.from(signature)).toString()
  )

  const [paddedMessage, messageLength] = sha256Pad(signedData, 512 * 3)

  const pcdArgs: AnonAadhaarPCDArgs = {
    padded_message: {
      argumentType: ArgumentTypeName.StringArray,
      value: Uint8ArrayToCharArray(paddedMessage),
    },
    message_len: {
      argumentType: ArgumentTypeName.Number,
      value: messageLength.toString(),
    },
    signature: {
      argumentType: ArgumentTypeName.StringArray,
      value: splitToWords(signatureBigint, BigInt(64), BigInt(32)),
    },
    modulus: {
      argumentType: ArgumentTypeName.StringArray,
      value: splitToWords(modulusBigint, BigInt(64), BigInt(32)),
    },
  }

  return pcdArgs
}
