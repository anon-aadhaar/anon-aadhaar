import {
  convertBigIntToByteArray,
  decompressByteArray,
  splitToWords,
} from './utils'
import { AnonAadhaarArgs } from './types'
import {
  bufferToHex,
  Uint8ArrayToCharArray,
} from '@zk-email/helpers/dist/binaryFormat'
import { sha256Pad } from '@zk-email/helpers/dist/shaHash'
import { Buffer } from 'buffer'
import { pki } from 'node-forge'
import { ArgumentTypeName } from '@pcd/pcd-types'
import { hash } from './hash'
import { toUtf8Bytes } from '@ethersproject/strings'

/**
 * Extract all the information needed to generate the witness from the QRCode data.
 * @param qrData QrCode Data
 * @returns {witness}
 */
export const generateArgs = async (
  qrData: string,
  certificateFile: string,
  signal?: string | object
): Promise<AnonAadhaarArgs> => {
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

  const pubKeyBigInt = BigInt('0x' + publicKey)

  const signatureBigint = BigInt(
    '0x' + bufferToHex(Buffer.from(signature)).toString()
  )

  const [paddedMessage, messageLength] = sha256Pad(signedData, 512 * 3)

  // Set signal to 1 by default if no signal setted up
  const signalHash = signal
    ? typeof signal === 'object'
      ? hash(toUtf8Bytes(JSON.stringify(signal)))
      : hash(signal)
    : hash(1)

  const anonAadhaarArgs: AnonAadhaarArgs = {
    aadhaarData: {
      argumentType: ArgumentTypeName.StringArray,
      value: Uint8ArrayToCharArray(paddedMessage),
    },
    aadhaarDataLength: {
      argumentType: ArgumentTypeName.Number,
      value: messageLength.toString(),
    },
    signature: {
      argumentType: ArgumentTypeName.StringArray,
      value: splitToWords(signatureBigint, BigInt(64), BigInt(32)),
    },
    pubKey: {
      argumentType: ArgumentTypeName.StringArray,
      value: splitToWords(pubKeyBigInt, BigInt(64), BigInt(32)),
    },
    signalHash: {
      argumentType: ArgumentTypeName.String,
      value: signalHash,
    },
  }

  return anonAadhaarArgs
}
