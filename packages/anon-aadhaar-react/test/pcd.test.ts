import { describe } from 'mocha'
import { AnonAadhaarPCDArgs, splitToWords, verify } from 'anon-aadhaar-pcd'
import { assert } from 'chai'
import { ArgumentTypeName } from '@pcd/pcd-types'
import { proveAndSerialize } from '../src/prove'
import { genData } from '../../anon-aadhaar-pcd/test/utils'
import { sha256Pad } from '@zk-email/helpers/dist/shaHash'
import { Uint8ArrayToCharArray } from '@zk-email/helpers/dist/binaryFormat'

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
      512 * 3,
    )
  })

  it('PCD flow web prover', async function () {
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

    const result = await proveAndSerialize(pcdArgs, true)

    const verified = await verify(result.pcd)
    assert(verified == true, 'Should verifiable')
  })
})
