import {
  convertBigIntToByteArray,
  decompressByteArray,
  handleError,
} from './utils'
import { WitnessQRInputs } from './types'
import { sha256Pad } from '@zk-email/helpers/dist/shaHash'
import { Buffer } from 'buffer'
import {
  bufferToHex,
  Uint8ArrayToCharArray,
} from '@zk-email/helpers/dist/binaryFormat'
import { pki } from 'node-forge'

/**
 * Extract all the information needed to generate the witness from the QRCode data.
 * @param qrData QrCode Data
 * @returns {witness}
 */
export const extractWitness = async (
  qrData: string,
  certificateFile: string
): Promise<WitnessQRInputs | Error> => {
  try {
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

    console.log('public key in extract: ', publicKey)

    const modulusBigint = BigInt('0x' + publicKey)

    const signatureBigint = BigInt(
      '0x' + bufferToHex(Buffer.from(signature)).toString()
    )

    const [paddedMessage, messageLength] = sha256Pad(signedData, 512 * 3)

    return {
      paddedMessage: Uint8ArrayToCharArray(paddedMessage),
      messageLength,
      signatureBigint,
      modulusBigint,
    }
  } catch (error) {
    return handleError(
      error,
      '[Unable to extract the witness from the QR code]'
    )
  }
}
