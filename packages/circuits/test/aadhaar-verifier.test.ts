/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const circom_tester = require('circom_tester/wasm/tester')

import path from 'path'
import { sha256Pad } from '@zk-email/helpers/dist/shaHash'
import {
  bigIntToChunkedBytes,
  bufferToHex,
  Uint8ArrayToCharArray,
} from '@zk-email/helpers/dist/binaryFormat'
import {
  convertBigIntToByteArray,
  decompressByteArray,
  extractPhoto,
  splitToWords,
  IdFields,
  readData,
} from '@anon-aadhaar/core'
import { genData } from '../../core/test/utils'
import fs from 'fs'
import crypto from 'crypto'
import assert from 'assert'
import { buildPoseidon } from 'circomlibjs'
import { testQRData } from '../assets/dataInput.json'
import { timestampToUTCUnix } from './util'
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config()

let testAadhaar = true
let QRData: string = testQRData
if (process.env.REAL_DATA === 'true') {
  testAadhaar = false
  if (typeof process.env.AADHAAR_QR_DATA === 'string') {
    QRData = process.env.AADHAAR_QR_DATA
  } else {
    throw Error('You must set .env var AADHAAR_QR_DATA when using real data.')
  }
}

const getCertificate = (_isTest: boolean) => {
  return _isTest
    ? 'testCertificate.pem'
    : 'uidai_offline_publickey_26022021.cer'
}

describe('Test QR Verify circuit', function () {
  this.timeout(0)

  let circuit: any

  this.beforeAll(async () => {
    const pathToCircuit = path.join(
      __dirname,
      '../src',
      'aadhaar-verifier.circom',
    )
    circuit = await circom_tester(pathToCircuit, {
      recompile: true,
      include: path.join(__dirname, '../node_modules'),
    })
  })

  it('Test circuit with Sha256RSA signature', async () => {
    const qrDataBytes = convertBigIntToByteArray(BigInt(testQRData))
    const decodedData = decompressByteArray(qrDataBytes)

    const signatureBytes = decodedData.slice(
      decodedData.length - 256,
      decodedData.length,
    )

    const signedData = decodedData.slice(0, decodedData.length - 256)

    const [paddedMsg, messageLen] = sha256Pad(signedData, 512 * 3)

    const delimiterIndices = []
    for (let i = 0; i < paddedMsg.length; i++) {
      if (paddedMsg[i] === 255) {
        delimiterIndices.push(i)
      }
      if (delimiterIndices.length === 18) {
        break
      }
    }

    const signature = BigInt(
      '0x' + bufferToHex(Buffer.from(signatureBytes)).toString(),
    )

    const pkPem = fs.readFileSync(
      path.join(__dirname, '../assets', 'testPublicKey.pem'),
    )
    const pk = crypto.createPublicKey(pkPem)

    const pubKey = BigInt(
      '0x' +
        bufferToHex(
          Buffer.from(pk.export({ format: 'jwk' }).n as string, 'base64url'),
        ),
    )

    await circuit.calculateWitness({
      qrDataPadded: Uint8ArrayToCharArray(paddedMsg),
      qrDataPaddedLength: messageLen,
      nonPaddedDataLength: signedData.length,
      delimiterIndices: delimiterIndices,
      signature: splitToWords(signature, BigInt(64), BigInt(32)),
      pubKey: splitToWords(pubKey, BigInt(64), BigInt(32)),
      appId: 12345678,
      signalHash: 0,
    })
  })

  it('Compute nullifier must correct', async () => {
    // load public key
    const pkData = fs.readFileSync(
      path.join(__dirname, '../assets', getCertificate(testAadhaar)),
    )
    const pk = crypto.createPublicKey(pkData)

    // data on https://uidai.gov.in/en/ecosystem/authentication-devices-documents/qr-code-reader.html
    const QRDataBigInt = BigInt(QRData)

    const QRDataBytes = convertBigIntToByteArray(QRDataBigInt)
    const QRDataDecode = decompressByteArray(QRDataBytes)

    const signatureBytes = QRDataDecode.slice(
      QRDataDecode.length - 256,
      QRDataDecode.length,
    )

    const signedData = QRDataDecode.slice(0, QRDataDecode.length - 256)

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

    const witness = await circuit.calculateWitness({
      aadhaarData: Uint8ArrayToCharArray(paddedMsg),
      aadhaarDataLength: messageLen,
      signature: splitToWords(signature, BigInt(64), BigInt(32)),
      pubKey: splitToWords(pubKey, BigInt(64), BigInt(32)),
      signalHash: 4,
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const poseidon: any = await buildPoseidon()

    const { photo } = extractPhoto(Array.from(signedData))

    let basicData: number[] = []
    const offsetId = testAadhaar ? -1 : 0
    for (const id of [
      IdFields.name + offsetId,
      IdFields.dob + offsetId,
      IdFields.gender + offsetId,
      IdFields.pinCode + offsetId,
    ].sort((x, y) => x - y)) {
      basicData = basicData.concat([
        255,
        ...readData(Array.from(signedData), id),
      ])
    }

    let basicHash = 0
    for (let i = 0; i < basicData.length; ++i) {
      basicHash = poseidon([basicHash, BigInt(basicData[i])])
    }

    let photoHash = 0
    for (let i = 0; i < photo.length; ++i) {
      photoHash = poseidon([photoHash, BigInt(photo[i])])
    }

    const offset = testAadhaar ? -3 : 0
    const four_digit = paddedMsg.slice(5 + offset, 9 + offset)
    const userNullifier = poseidon([...four_digit, photoHash])
    const identityNullifier = poseidon([...four_digit, basicHash])

    assert(witness[1] == BigInt(poseidon.F.toString(identityNullifier)))
    assert(witness[2] == BigInt(poseidon.F.toString(userNullifier)))
  })

  it('should output timestamp of when data is generated', async () => {
    // load public key
    const pkData = fs.readFileSync(
      path.join(__dirname, '../assets', getCertificate(testAadhaar)),
    )
    const pk = crypto.createPublicKey(pkData)

    // data on https://uidai.gov.in/en/ecosystem/authentication-devices-documents/qr-code-reader.html
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

    const witness = await circuit.calculateWitness({
      aadhaarData: Uint8ArrayToCharArray(paddedMsg),
      aadhaarDataLength: messageLen,
      signature: splitToWords(signature, BigInt(64), BigInt(32)),
      pubKey: splitToWords(pubKey, BigInt(64), BigInt(32)),
      signalHash: 0,
    })

    // This is the time in the QR data above is 20190308114407437.
    // 2019-03-08 11:44:07.437 rounded down to nearest hour is 2019-03-08 11:00:00.000
    // Converting this IST to UTC gives 2019-03-08T05:30:00.000Z
    const expectedTimestamp = timestampToUTCUnix(decodedData, testAadhaar)

    assert(witness[3] === BigInt(expectedTimestamp))
  })

  it('should output hash of pubkey', async () => {
    const signedData = 'HelloWor-20240116140412'

    const data = await genData(signedData, 'SHA-256')

    const [paddedMsg, messageLen] = sha256Pad(
      Buffer.from(signedData, 'ascii'),
      512 * 3,
    )

    const witness = await circuit.calculateWitness({
      aadhaarData: Uint8ArrayToCharArray(paddedMsg),
      aadhaarDataLength: messageLen,
      signature: splitToWords(data[1], BigInt(64), BigInt(32)),
      pubKey: splitToWords(data[2], BigInt(64), BigInt(32)),
      signalHash: 0,
    })

    // Calculate the Poseidon hash with pubkey chunked to 9*242 like in circuit
    const poseidon = await buildPoseidon()
    const pubkeyChunked = bigIntToChunkedBytes(data[2], 128, 16)
    const hash = poseidon(pubkeyChunked)

    assert(witness[4] === BigInt(poseidon.F.toObject(hash)))
  })
})
