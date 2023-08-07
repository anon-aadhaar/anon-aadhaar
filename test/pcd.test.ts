import { describe } from 'mocha'
import { IdentityPCDArgs, PCDInitArgs } from '../src/types'
import { init, prove, verify } from '../src/pcd'
import { assert } from 'chai'
import { genData } from './utils'
import { ArgumentTypeName } from '@pcd/pcd-types'

describe('PCD tests', function () {
  this.timeout(0)

  let testData: [bigint, bigint, bigint, bigint]

  this.beforeAll(async () => {
    testData = await genData('Hello world', 'SHA-1')
  })

  it('PCD flow location prover', async function () {
    const dirName = __dirname + '/../artifacts'
    const pcdInitArgs: PCDInitArgs = {
      wasmURL: dirName + '/main.wasm',
      zkeyURL: dirName + '/circuit_final.zkey',
      isWebEnv: false,
    }

    await init(pcdInitArgs)

    const pcdArgs: IdentityPCDArgs = {
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
      }
    }

    const pcd = await prove(pcdArgs)

    const verified = await verify(pcd)
    assert(verified == true, 'Should verifiable')
  })

  // TODO: Create utils for test Web Prover
  it.skip('PCD flow web prover', async function () {
    const dirName = __dirname + '/../artifacts'
    const pcdInitArgs: PCDInitArgs = {
      wasmURL: dirName + '/main.wasm',
      zkeyURL: dirName + '/circuit_final.zkey',
      isWebEnv: false,
    }

    await init(pcdInitArgs)

    const pcdArgs: IdentityPCDArgs = {
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
    }

    const pcd = await prove(pcdArgs)

    const verified = await verify(pcd)
    assert(verified == true, 'Should verifiable')
  })
})
