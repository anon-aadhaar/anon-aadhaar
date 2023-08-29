import { describe } from 'mocha'
import { IdentityPCDArgs, verify } from 'anon-aadhaar-pcd'
import { assert } from 'chai'
import { genData } from './utils'
import { ArgumentTypeName } from '@pcd/pcd-types'
import { proveWithWebProver } from '../src/prove'

describe('PCD tests', function () {
  this.timeout(0)

  let testData: [bigint, bigint, bigint, bigint]

  this.beforeAll(async () => {
    testData = await genData('Hello world', 'SHA-1')
  })

  it('PCD flow web prover', async function () {
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

    const result = await proveWithWebProver(pcdArgs)
    const verifyKeyURL =
      'https://d3dxq5smiosdl4.cloudfront.net/verification_key.json'
    const verified = await verify(result.pcd, verifyKeyURL)
    assert(verified == true, 'Should verifiable')
  })
})
