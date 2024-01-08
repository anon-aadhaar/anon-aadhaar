import { describe } from 'mocha'
import { AnonAadhaarPCDArgs, PCDInitArgs } from '../src/types'
import { init, prove, verify } from '../src/pcd'
import { assert } from 'chai'
import { genData } from './utils'
import { ArgumentTypeName } from '@pcd/pcd-types'
import { sha256Pad } from '@zk-email/helpers/dist/shaHash'
import { Uint8ArrayToCharArray } from '@zk-email/helpers/dist/binaryFormat'
import { VK_URL, WASM_URL, ZKEY_URL, splitToWords } from '../src'

describe('PCD tests', function () {
  this.timeout(0)

  let testData: [bigint, bigint, bigint, bigint]
  let paddedMsg: Uint8Array
  let messageLen: number

  this.beforeAll(async () => {
    const signedData = 'Hello-world'

    testData = await genData(signedData, 'SHA-256')
    ;[paddedMsg, messageLen] = sha256Pad(
      Buffer.from(signedData, 'ascii'),
      512 * 3
    )
  })

  it('PCD flow location prover', async function () {
    const dirName = __dirname + '/../../circuits/artifacts'
    const pcdInitArgs: PCDInitArgs = {
      wasmURL: dirName + '/qr_verify.wasm',
      zkeyURL: dirName + '/circuit_final.zkey',
      vkeyURL: dirName + '/vkey.json',
      isWebEnv: false,
    }

    await init(pcdInitArgs)

    const pcdArgs: AnonAadhaarPCDArgs = {
      padded_message: {
        argumentType: ArgumentTypeName.StringArray,
        value: Uint8ArrayToCharArray(paddedMsg),
      },
      message_len: {
        argumentType: ArgumentTypeName.Number,
        value: messageLen.toString(),
      },
      signature: {
        argumentType: ArgumentTypeName.StringArray,
        value: splitToWords(testData[1], BigInt(64), BigInt(32)),
      },
      modulus: {
        argumentType: ArgumentTypeName.StringArray,
        value: splitToWords(testData[2], BigInt(64), BigInt(32)),
      },
    }

    const pcd = await prove(pcdArgs)

    const verified = await verify(pcd)
    assert(verified == true, 'Should verifiable')
  })

  it('PCD flow web prover', async function () {
    const pcdInitArgs: PCDInitArgs = {
      wasmURL: WASM_URL,
      zkeyURL: ZKEY_URL,
      vkeyURL: VK_URL,
      isWebEnv: true,
    }

    await init(pcdInitArgs)

    const pcdArgs: AnonAadhaarPCDArgs = {
      padded_message: {
        argumentType: ArgumentTypeName.StringArray,
        value: Uint8ArrayToCharArray(paddedMsg),
      },
      message_len: {
        argumentType: ArgumentTypeName.Number,
        value: messageLen.toString(),
      },
      signature: {
        argumentType: ArgumentTypeName.StringArray,
        value: splitToWords(testData[1], BigInt(64), BigInt(32)),
      },
      modulus: {
        argumentType: ArgumentTypeName.StringArray,
        value: splitToWords(testData[2], BigInt(64), BigInt(32)),
      },
    }

    const pcd = await prove(pcdArgs)

    const verified = await verify(pcd)

    assert(verified == true, 'Should verifiable')
  })
})
