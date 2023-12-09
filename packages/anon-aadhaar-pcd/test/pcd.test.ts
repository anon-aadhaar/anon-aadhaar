import { describe } from 'mocha'
import { AnonAadhaarPCDArgs, PCDInitArgs } from '../src/types'
import { init, prove, verify } from '../src/pcd'
import { assert } from 'chai'
import { genData } from './utils'
import { ArgumentTypeName } from '@pcd/pcd-types'
import { WASM_URL, ZKEY_URL, VK_URL } from '../src/constants'

describe('PCD tests', function () {
  this.timeout(0)

  let testData: [bigint, bigint, bigint, bigint]

  this.beforeAll(async () => {
    testData = await genData('Hello world', 'SHA-1')
  })

  it('PCD flow location prover', async function () {
    const dirName = __dirname + '/../artifacts/RSA'
    const pcdInitArgs: PCDInitArgs = {
      wasmURL: dirName + '/main.wasm',
      zkeyURL: dirName + '/circuit_final.zkey',
      vkeyURL: dirName + '/verification_key.json',
      isWebEnv: false,
    }

    await init(pcdInitArgs)

    const pcdArgs: AnonAadhaarPCDArgs = {
      signature: {
        argumentType: ArgumentTypeName.BigInt,
        value: testData[1] + '',
      },
      modulus: {
        argumentType: ArgumentTypeName.BigInt,
        value: testData[2] + '',
      },
      base_message: {
        argumentType: ArgumentTypeName.BigInt,
        value: testData[3] + '',
      },
      app_id: {
        argumentType: ArgumentTypeName.BigInt,
        value: BigInt(1234555).toString(),
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
      signature: {
        argumentType: ArgumentTypeName.BigInt,
        value: testData[1] + '',
      },
      modulus: {
        argumentType: ArgumentTypeName.BigInt,
        value: testData[2] + '',
      },
      base_message: {
        argumentType: ArgumentTypeName.BigInt,
        value: testData[3] + '',
      },
      app_id: {
        argumentType: ArgumentTypeName.BigInt,
        value: BigInt(1234555).toString(),
      },
    }

    const pcd = await prove(pcdArgs)

    const verified = await verify(pcd)

    assert(verified == true, 'Should verifiable')
  })
})
