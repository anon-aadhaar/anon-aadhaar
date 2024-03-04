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
  splitToWords,
  IdFields,
} from '@anon-aadhaar/core'
import fs from 'fs'
import crypto from 'crypto'
import assert from 'assert'
import { buildPoseidon } from 'circomlibjs'
import { testQRData } from '../assets/dataInput.json'
import {
  bytesToInts,
  dateToUnixTimestamp,
  extractFieldByIndex,
  returnFullId,
  timestampToUTCUnix,
} from './util'
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
    const appId = 12345678
    // load public key
    const pkData = fs.readFileSync(
      path.join(__dirname, '../assets', getCertificate(testAadhaar)),
    )
    const pk = crypto.createPublicKey(pkData)

    const QRDataBytes = convertBigIntToByteArray(BigInt(QRData))
    const QRDataDecode = decompressByteArray(QRDataBytes)

    const signatureBytes = QRDataDecode.slice(
      QRDataDecode.length - 256,
      QRDataDecode.length,
    )

    const signedData = QRDataDecode.slice(0, QRDataDecode.length - 256)

    returnFullId(signedData)

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

    const last4Digits = extractFieldByIndex(
      paddedMsg,
      IdFields['ReferenceId'] - 1,
    )?.slice(1, 5)
    if (last4Digits === undefined) throw Error('last4Digits not found')
    const name = extractFieldByIndex(paddedMsg, IdFields['Name'] - 1)
    if (name === null) throw Error('Name not found')
    const nameAsNumber = bytesToInts(name.slice(1), 31)
    const dob = extractFieldByIndex(paddedMsg, IdFields['DOB'] - 1)
    if (dob === null) throw Error('DOB not found')
    const dobStr = String.fromCharCode(...dob.slice(1))
    const gender = extractFieldByIndex(paddedMsg, IdFields['Gender'] - 1)
    if (gender === null) throw Error('Gender not found')

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
      qrDataPadded: Uint8ArrayToCharArray(paddedMsg),
      qrDataPaddedLength: messageLen,
      nonPaddedDataLength: signedData.length,
      delimiterIndices: delimiterIndices,
      signature: splitToWords(signature, BigInt(64), BigInt(32)),
      pubKey: splitToWords(pubKey, BigInt(64), BigInt(32)),
      appId: appId,
      signalHash: 0,
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const poseidon: any = await buildPoseidon()

    // const { photo } = extractPhoto(Array.from(signedData))

    const identityNullifier = poseidon([
      appId,
      String.fromCharCode(...last4Digits),
      nameAsNumber,
      dateToUnixTimestamp(dobStr),
      gender[1],
    ])

    // basicHash = poseidon([basicHash, BigInt(basicData[i])])

    // let photoHash = 0
    // for (let i = 0; i < photo.length; ++i) {
    //   photoHash = poseidon([photoHash, BigInt(photo[i])])
    // }

    // const offset = testAadhaar ? -3 : 0
    // const four_digit = paddedMsg.slice(5 + offset, 9 + offset)
    // const userNullifier = poseidon([...four_digit, photoHash])
    // const identityNullifier = poseidon([...four_digit, basicHash])
    assert(witness[1] == BigInt(poseidon.F.toString(identityNullifier)))

    // assert(witness[2] == BigInt(poseidon.F.toString(userNullifier)))
  })

  it('should output timestamp of when data is generated', async () => {
    // load public key
    const pkData = fs.readFileSync(
      path.join(__dirname, '../assets', 'testPublicKey.pem'),
    )
    const pk = crypto.createPublicKey(pkData)

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

    const delimiterIndices = []
    for (let i = 0; i < paddedMsg.length; i++) {
      if (paddedMsg[i] === 255) {
        delimiterIndices.push(i)
      }
      if (delimiterIndices.length === 18) {
        break
      }
    }

    const witness = await circuit.calculateWitness({
      qrDataPadded: Uint8ArrayToCharArray(paddedMsg),
      qrDataPaddedLength: messageLen,
      nonPaddedDataLength: signedData.length,
      delimiterIndices: delimiterIndices,
      signature: splitToWords(signature, BigInt(64), BigInt(32)),
      pubKey: splitToWords(pubKey, BigInt(64), BigInt(32)),
      appId: 12345678,
      signalHash: 0,
    })

    // This is the time in the QR data above is 20190308114407437.
    // 2019-03-08 11:44:07.437 rounded down to nearest hour is 2019-03-08 11:00:00.000
    // Converting this IST to UTC gives 2019-03-08T05:30:00.000Z
    const expectedTimestamp = timestampToUTCUnix(decodedData)

    assert(witness[3] === BigInt(expectedTimestamp))
  })

  it('should output hash of pubkey', async () => {
    // load public key
    const pkData = fs.readFileSync(
      path.join(__dirname, '../assets', 'testPublicKey.pem'),
    )
    const pk = crypto.createPublicKey(pkData)

    const QRDataBytes = convertBigIntToByteArray(BigInt(QRData))
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

    const delimiterIndices = []
    for (let i = 0; i < paddedMsg.length; i++) {
      if (paddedMsg[i] === 255) {
        delimiterIndices.push(i)
      }
      if (delimiterIndices.length === 18) {
        break
      }
    }

    const witness = await circuit.calculateWitness({
      qrDataPadded: Uint8ArrayToCharArray(paddedMsg),
      qrDataPaddedLength: messageLen,
      nonPaddedDataLength: signedData.length,
      delimiterIndices: delimiterIndices,
      signature: splitToWords(signature, BigInt(64), BigInt(32)),
      pubKey: splitToWords(pubKey, BigInt(64), BigInt(32)),
      appId: 12345678,
      signalHash: 0,
    })

    // Calculate the Poseidon hash with pubkey chunked to 9*242 like in circuit
    const poseidon = await buildPoseidon()
    const pubkeyChunked = bigIntToChunkedBytes(pubKey, 128, 16)
    const hash = poseidon(pubkeyChunked)

    assert(witness[4] === BigInt(poseidon.F.toObject(hash)))
  })
})
