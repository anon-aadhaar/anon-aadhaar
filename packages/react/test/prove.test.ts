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

    const args = await processAadhaarArgs(testQRData, true, 1234, {
      revealAgeAbove18: false,
      revealGender: false,
      revealState: false,
      revealPinCode: false,
    })

    const result = await proveAndSerialize(args)

    const verified = await verify(result.anonAadhaarProof)
    assert(verified == true, 'Should verifiable')
  })
})
