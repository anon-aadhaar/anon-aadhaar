import { describe } from 'mocha'
import {
  ArtifactsOrigin,
  InitArgs,
  artifactUrls,
  init,
  verify,
} from '@anon-aadhaar/core'
import { assert } from 'chai'
import { processAadhaarArgs, proveAndSerialize } from '../src/prove'
import { testQRData } from '../../circuits/assets/dataInput.json'

describe('AnonAadhaar prover react tests', function () {
  this.timeout(0)

  it('Generate and verify a proof from react', async function () {
    const anonAadhaarInitArgs: InitArgs = {
      wasmURL: artifactUrls.v2.wasm,
      zkeyURL: artifactUrls.v2.zkey,
      vkeyURL: artifactUrls.v2.vk,
      artifactsOrigin: ArtifactsOrigin.server,
    }

    await init(anonAadhaarInitArgs)

    const args = await processAadhaarArgs(testQRData, true, 1234, [
      'revealPinCode',
      'revealGender',
    ])

    const result = await proveAndSerialize(args)

    const verified = await verify(result.anonAadhaarProof, true)

    assert(verified == true, 'Should verifiable')
    assert(result.anonAadhaarProof.proof.ageAbove18 === '0')
    assert(result.anonAadhaarProof.proof.gender === '77')
    assert(result.anonAadhaarProof.proof.pincode === '110051')
    assert(result.anonAadhaarProof.proof.state === '0')
  })
})
