/* eslint-disable @typescript-eslint/no-explicit-any */
import path from 'path'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const circom_tester = require('circom_tester/wasm/tester')

import { sha256Pad } from '@zk-email/helpers/dist/shaHash'
import { Uint8ArrayToCharArray } from '@zk-email/helpers/dist/binaryFormat'

import { buildPoseidon } from 'circomlibjs'
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

describe('Extractor testcases', function () {
  this.timeout(0)

  let circuit: any
  let poseidon: any

  this.beforeAll(async () => {
    circuit = await circom_tester(
      path.join(__dirname, './', 'circuits', 'filter-test.circom'),
      {
        recompile: true,
        include: path.join(__dirname, '../node_modules'),
      },
    )
    poseidon = await buildPoseidon()
  })

  it('Should extract data', async () => {
    const QRDataBigInt = BigInt(QRData)

    const QRDataBytes = convertBigIntToByteArray(QRDataBigInt)
    const QRDataDecode = decompressByteArray(QRDataBytes)

    const signedData = QRDataDecode.slice(0, QRDataDecode.length - 256)

    const [paddedMsg, dataLen] = sha256Pad(signedData, 512 * 3)

    const witness: any[] = await circuit.calculateWitness({
      data: Uint8ArrayToCharArray(paddedMsg),
      dataLen,
    })

    const { begin, end } = extractPhoto(Array.from(signedData))

    let hash = 0
    for (let i = begin; i <= end; ++i) {
      hash = poseidon([hash, BigInt(paddedMsg[i])])
    }

    assert(witness[1] == BigInt(poseidon.F.toString(hash)))
  })
})
