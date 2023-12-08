import { describe } from 'mocha'
import { AnonAadhaarPCDArgs, verify, genData } from 'anon-aadhaar-pcd'
import { assert } from 'chai'
import { ArgumentTypeName } from '@pcd/pcd-types'
import { proveAndSerialize } from '../src/prove'

describe('PCD tests', function () {
  this.timeout(0)

  let testData: [bigint, bigint, bigint, bigint]

  this.beforeAll(async () => {
    testData = await genData('Hello world', 'SHA-1')
  })

  it('PCD flow web prover', async function () {
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

    const result = await proveAndSerialize(pcdArgs, true)

    const verified = await verify(result.pcd)
    assert(verified == true, 'Should verifiable')
  })
})
