import { readFileSync, writeFileSync } from 'fs'
import crypto from 'crypto'
import path from 'path'
import {
  hash,
  splitToWords,
  convertBigIntToByteArray,
  decompressByteArray,
} from '@anon-aadhaar/core'
import {
  Uint8ArrayToCharArray,
  bufferToHex,
} from '@zk-email/helpers/dist/binary-format'
import { sha256Pad } from '@zk-email/helpers/dist/sha-utils'
import { testQRData } from '../assets/test.json'

let qrData = testQRData
let certificateName = 'testCertificate.pem'
if (process.env.REAL_DATA === 'true') {
  qrData = process.env.QR_DATA as string
  certificateName = 'uidai_offline_publickey_26022021.cer'
  if (!qrData) {
    throw new Error('QR_DATA env is not set')
  }
}

const main = () => {
  const nullifierSeed = 12345678

  // We are using production public key here (v2)
  // Change to uidai_prod_cdup.cer to use the test data provided by UIDAI (v1)
  const pkData = readFileSync(
    path.join(__dirname, '../assets', certificateName),
  )
  const pk = crypto.createPublicKey(pkData)

  // Add QR data here (bigInt)
  const QRData = BigInt(qrData)

  const qrDataBytes = convertBigIntToByteArray(BigInt(QRData))
  const decodedData = decompressByteArray(qrDataBytes)

  const signatureBytes = decodedData.slice(
    decodedData.length - 256,
    decodedData.length,
  )

  const signedData = decodedData.slice(0, decodedData.length - 256)
  const [paddedMsg, messageLen] = sha256Pad(signedData, 512 * 3)

  const pubKey = BigInt(
    '0x' +
      bufferToHex(
        Buffer.from(pk.export({ format: 'jwk' }).n as string, 'base64url'),
      ),
  )

  const signature = BigInt(
    '0x' + bufferToHex(Buffer.from(signatureBytes)).toString(),
  )

  const delimiterIndices: number[] = []
  for (let i = 0; i < paddedMsg.length; i++) {
    if (paddedMsg[i] === 255) {
      delimiterIndices.push(i)
    }
    if (delimiterIndices.length === 18) {
      break
    }
  }

  const input = {
    qrDataPadded: Uint8ArrayToCharArray(paddedMsg),
    qrDataPaddedLength: messageLen,
    delimiterIndices: delimiterIndices,
    signature: splitToWords(signature, BigInt(121), BigInt(17)),
    pubKey: splitToWords(pubKey, BigInt(121), BigInt(17)),
    nullifierSeed: nullifierSeed,
    signalHash: hash(1),
    revealGender: '0',
    revealAgeAbove18: '0',
    revealPinCode: '0',
    revealState: '0',
  }

  writeFileSync(
    path.join(__dirname, '../build/input.json'),
    JSON.stringify(input),
  )
}

main()
