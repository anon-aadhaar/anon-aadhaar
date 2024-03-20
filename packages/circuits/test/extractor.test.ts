/* eslint-disable @typescript-eslint/no-explicit-any */
import path from 'path'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const circom_tester = require('circom_tester/wasm/tester')

import { sha256Pad } from '@zk-email/helpers/dist/shaHash'
import { Uint8ArrayToCharArray } from '@zk-email/helpers/dist/binaryFormat'

// import { buildPoseidon } from 'circomlibjs'
import pako from 'pako'

import { extractPhoto } from '@anon-aadhaar/core'
import assert from 'assert'
import { testQRData as QRData } from '../assets/dataInput.json'

function convertBigIntToByteArray(bigInt: bigint) {
  const byteLength = Math.max(1, Math.ceil(bigInt.toString(2).length / 8))

  const result = new Uint8Array(byteLength)
  let i = 0
  while (bigInt > 0) {
    result[i] = Number(bigInt % BigInt(256))
    bigInt = bigInt / BigInt(256)
    i += 1
  }
  return result.reverse()
}

function decompressByteArray(byteArray: Uint8Array) {
  const decompressedArray = pako.inflate(byteArray)
  return decompressedArray
}

function bigIntsToByteArray(bigIntChunks: bigint[], bytesPerChunk = 31) {
  const bytes: number[] = []

  // Remove last chunks that are 0n
  const cleanChunks = bigIntChunks
    .reverse()
    .reduce(
      (acc: bigint[], item) =>
        acc.length || item !== 0n ? [...acc, item] : [],
      [],
    )
    .reverse()

  cleanChunks.forEach((bigInt, i) => {
    let byteCount = 0

    while (bigInt > 0n) {
      bytes.unshift(Number(bigInt & 0xffn))
      bigInt >>= 8n
      byteCount++
    }

    // Except for the last chunk, each chunk should be of size bytesPerChunk
    // This will add 0s that were removed during the conversion because they are LSB
    if (i < cleanChunks.length - 1) {
      if (byteCount < bytesPerChunk) {
        for (let j = 0; j < bytesPerChunk - byteCount; j++) {
          bytes.unshift(0)
        }
      }
    }
  })

  return bytes.reverse() // reverse to convert little endian to big endian
}

function bigIntsToString(bigIntChunks: bigint[]) {
  return bigIntsToByteArray(bigIntChunks)
    .map(byte => String.fromCharCode(byte))
    .join('')
}

describe.only('Extractor testcases', function () {
  this.timeout(0)

  let circuit: any
  // let poseidon: any

  this.beforeAll(async () => {
    circuit = await circom_tester(
      path.join(__dirname, './', 'circuits', 'filter-test.circom'),
      {
        recompile: true,
        include: path.join(__dirname, '../node_modules'),
      },
    )
    // poseidon = await buildPoseidon()
  })

  it('Should extract data', async () => {
    const QRDataBytes = convertBigIntToByteArray(BigInt(QRData))
    const QRDataDecode = decompressByteArray(QRDataBytes)

    const signedData = QRDataDecode.slice(0, QRDataDecode.length - 256)

    const [paddedMsg] = sha256Pad(signedData, 512 * 3)

    const delimiterIndices = []
    for (let i = 0; i < paddedMsg.length; i++) {
      if (paddedMsg[i] === 255) {
        delimiterIndices.push(i)
      }
      if (delimiterIndices.length === 18) {
        break
      }
    }

    const witness: any[] = await circuit.calculateWitness({
      data: Uint8ArrayToCharArray(paddedMsg),
      nonPaddedDataLength: QRDataDecode.length - 256,
      delimiterIndices: delimiterIndices,
    })

    // Last 4 Digits
    assert(witness[1] === 2697n)

    // Timestamp
    assert(
      new Date(Number(witness[2]) * 1000).getTime() ===
        new Date('2019-03-08T05:30:00.000Z').getTime(),
    )

    // Name
    // assert(bigIntsToString([witness[3]]) === 'Sumit Kumar')

    // Date of birth
    assert(
      new Date(Number(witness[3]) * 1000).getTime() ===
        new Date('1984-01-01T05:30:00.000Z').getTime(),
    )

    // Gender
    assert(bigIntsToString([witness[4]]) === 'M')

    // Photo
    const photoWitness = bigIntsToByteArray(witness.slice(5, 5 + 35))
    const photo = extractPhoto(Array.from(signedData))

    assert(photoWitness.length === photo.bytes.length)
    for (let i = 0; i < photoWitness.length; i++) {
      assert(photoWitness[i] === photo.bytes[i])
    }
  })
})
