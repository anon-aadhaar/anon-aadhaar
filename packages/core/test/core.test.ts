import { describe } from 'mocha'
import { InitArgs } from '../src/types'
import { init, prove, verify } from '../src/core'
import { assert } from 'chai'
import { VK_URL, WASM_URL, ZKEY_URL, generateArgs } from '../src'
import fs from 'fs'
import { testQRData as QRData } from '../../circuits/assets/dataInput.json'

describe('PCD tests', function () {
  this.timeout(0)

  let certificate: string
  this.beforeAll(() => {
    const certificateDirName = __dirname + '/../../circuits/assets'
    certificate = fs
      .readFileSync(certificateDirName + '/uidai_prod_cdup.cer')
      .toString()
  })

  it('PCD flow location prover', async function () {
    const artifactsDirName = __dirname + '/../../circuits/artifacts'
    const anonAadhaarInitArgs: InitArgs = {
      wasmURL: artifactsDirName + '/aadhaar-verifier.wasm',
      zkeyURL: artifactsDirName + '/circuit_final.zkey',
      vkeyURL: artifactsDirName + '/vkey.json',
      isWebEnv: false,
    }

    await init(anonAadhaarInitArgs)

    const args = await generateArgs(QRData, certificate)

    const anonAadhaarProof = await prove(args)

    const verified = await verify(anonAadhaarProof)
    assert(verified == true, 'Should be verified')
  })

  it('PCD flow web prover', async function () {
    const anonAadhaarInitArgs: InitArgs = {
      wasmURL: WASM_URL,
      zkeyURL: ZKEY_URL,
      vkeyURL: VK_URL,
      isWebEnv: true,
    }

    await init(anonAadhaarInitArgs)

    const args = await generateArgs(QRData, certificate)

    const anonAadhaarProof = await prove(args)

    const verified = await verify(anonAadhaarProof)

    assert(verified == true, 'Should be verified')
  })
})
