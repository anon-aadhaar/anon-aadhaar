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
} from '@zk-email/helpers/dist/binaryFormat'
import { sha256Pad } from '@zk-email/helpers/dist/shaHash'

const main = () => {
  // We are using produciton public key here (v2)
  // Change to uidai_prod_cdup.cer to use the test data provided by UIDAI (v1)
  const pkData = readFileSync(
    path.join(__dirname, '../assets', 'uidai_offline_publickey_26022021.cer'),
  )
  const pk = crypto.createPublicKey(pkData)

  // Add QR data here (bigInt)
  const QRData = BigInt('')

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

  const input = {
    aadhaarData: Uint8ArrayToCharArray(paddedMsg),
    aadhaarDataLength: messageLen,
    signature: splitToWords(signature, BigInt(64), BigInt(32)),
    pubKey: splitToWords(pubKey, BigInt(64), BigInt(32)),
    signalHash: hash(1),
  }
  writeFileSync('build/input.json', JSON.stringify(input))
}

main()
