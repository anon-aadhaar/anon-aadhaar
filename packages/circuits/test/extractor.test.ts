/* eslint-disable @typescript-eslint/no-explicit-any */
import path from 'path'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const circom_tester = require('circom_tester/wasm/tester')
import { sha256Pad } from '@zk-email/helpers/dist/sha-utils'
import { Uint8ArrayToCharArray } from '@zk-email/helpers/dist/binary-format'
import {
  convertBigIntToByteArray,
  decompressByteArray,
  extractPhoto,
} from '@anon-aadhaar/core'
import assert from 'assert'
import { testQRData as QRData } from '../assets/dataInput.json'
import { bigIntsToString, bigIntChunksToByteArray } from './util'

describe('Extractor', function () {
  this.timeout(0)

  let circuit: any

  this.beforeAll(async () => {
    circuit = await circom_tester(
      path.join(__dirname, './', 'circuits', 'extractor-test.circom'),
      {
        recompile: true,
        include: [
          path.join(__dirname, '../node_modules'),
          path.join(__dirname, '../../../node_modules'),
        ],
      },
    )
  })

  it('should extract data', async () => {
    const QRDataBytes = convertBigIntToByteArray(
      BigInt(
        QRData, // replace with v1 data for testing
      ),
    )
    const QRDataDecode = decompressByteArray(QRDataBytes)

    const signedData = QRDataDecode.slice(0, QRDataDecode.length - 256)

    const [qrDataPadded, qrDataPaddedLen] = sha256Pad(signedData, 512 * 3)

    const delimiterIndices: number[] = []
    for (let i = 0; i < qrDataPadded.length; i++) {
      if (qrDataPadded[i] === 255) {
        delimiterIndices.push(i)
      }
      if (delimiterIndices.length === 18) {
        break
      }
    }

    const witness: any[] = await circuit.calculateWitness({
      data: Uint8ArrayToCharArray(qrDataPadded),
      qrDataPaddedLength: qrDataPaddedLen,
      delimiterIndices: delimiterIndices,
    })

    // Timestamp
    assert(
      new Date(Number(witness[1]) * 1000).getTime() ===
        new Date('2019-03-08T05:30:00.000Z').getTime(),
    )

    // Age above 18
    assert(Number(witness[2]) === 1)

    // Gender
    assert(bigIntsToString([witness[3]]) === 'M')

    // Pin code
    assert(Number(witness[5]) === 110051)

    // State
    assert(bigIntsToString([witness[4]]) === 'Delhi')

    // Photo
    // Reconstruction of the photo bytes from packed ints and compare each byte
    const photo = extractPhoto(Array.from(qrDataPadded), qrDataPaddedLen)
    const photoWitness = bigIntChunksToByteArray(witness.slice(6, 6 + 32), 31)

    assert(photoWitness.length === photo.bytes.length)
    for (let i = 0; i < photoWitness.length; i++) {
      assert(photoWitness[i] === photo.bytes[i], `Photo mismatch at index ${i}`)
    }
  })
})
