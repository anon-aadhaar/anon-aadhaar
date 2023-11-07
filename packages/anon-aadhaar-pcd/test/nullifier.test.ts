import { describe } from 'mocha'
import { assert } from 'chai'
import { genData } from '../src/utils'
import { groth16 } from 'snarkjs'

describe('PCD tests', function () {
  this.timeout(0)

  let testData: [bigint, bigint, bigint, bigint]

  this.beforeAll(async () => {
    testData = await genData('Hello world', 'SHA-1')
  })

  it('Nullifier flow location prover', async function () {
    const dirName = __dirname + '/../artifacts/Nullifier'

    const input = {
      private_key: testData[2] + '',
      pdf_hash: testData[3] + '',
    }

    const { proof, publicSignals } = await groth16.fullProve(
      input,
      dirName + '/nullifier.wasm',
      dirName + '/circuit_final.zkey'
    )

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const vk = require(dirName + '/verification_key.json')

    const verified = await groth16.verify(vk, publicSignals, proof)

    assert(verified == true, 'Should verifiable')
  })
})
