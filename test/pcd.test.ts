import { describe } from 'mocha'
import { IdentityPCDArgs, PCDInitArgs } from '../src/types'
import { init, prove, verify } from '../src/pcd'
import { assert } from 'chai'
import { genData } from './utils'
import { ArgumentTypeName } from '@pcd/pcd-types'
import dotenv from 'dotenv'
dotenv.config()

describe('PCD tests', function () {
  this.timeout(0)

  let testData: [bigint, bigint, bigint, bigint]

  this.beforeAll(async () => {
    testData = await genData('Hello world', 'SHA-1')
  })

  it('PCD flow location prover', async function () {
    const dirName = __dirname + '/../artifacts'
    const pcdInitArgs: PCDInitArgs = {
      wasmURL: dirName + '/rsa_verify_sha1_pkcs1v15.wasm',
      zkeyURL: dirName + '/circuit_final.zkey',
      isWebEnv: false,
    }

    await init(pcdInitArgs)

    const pcdArgs: IdentityPCDArgs = {
      exp: {
        argumentType: ArgumentTypeName.BigInt,
        value: BigInt(65337) + '',
      },
      signature: {
        argumentType: ArgumentTypeName.BigInt,
        value: testData[1] + '',
      },
      mod: {
        argumentType: ArgumentTypeName.BigInt,
        value: testData[2] + '',
      },
      message: {
        argumentType: ArgumentTypeName.BigInt,
        value: testData[3] + '',
      },
    }

    const pcd = await prove(pcdArgs)

    const verified = await verify(pcd)
    assert(verified == true, 'Should verifiable')
  })

  // TODO: Create utils for test Web Prover
  it('PCD flow web prover', async function () {
    const pcdInitArgs: PCDInitArgs = {
      wasmURL: process.env.WASM_URL as string,
      zkeyURL: process.env.ZKEY_URL as string,
      isWebEnv: true,
    }

    await init(pcdInitArgs)

    const pcdArgs: IdentityPCDArgs = {
      exp: {
        argumentType: ArgumentTypeName.BigInt,
        value: BigInt(65337) + '',
      },
      signature: {
        argumentType: ArgumentTypeName.BigInt,
        value: testData[1] + '',
      },
      mod: {
        argumentType: ArgumentTypeName.BigInt,
        value: testData[2] + '',
      },
      message: {
        argumentType: ArgumentTypeName.BigInt,
        value: testData[3] + '',
      },
    }

    const pcd = await prove(pcdArgs)

    const verified = await verify(pcd)
    assert(verified == true, 'Should verifiable')
  })
})
