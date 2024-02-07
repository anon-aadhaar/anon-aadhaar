import { describe } from 'mocha'
import { ArtifactsOrigin, InitArgs } from '../src/types'
import { init, prove, verify } from '../src/core'
import { assert } from 'chai'
import { artifactUrls, generateArgs, searchZkeyChunks } from '../src'
import fs from 'fs'
import { testQRData as QRData } from '../../circuits/assets/dataInput.json'
import { MockLocalForage } from './__mocks__/localforage'
import * as proverModule from '../src/prover'
import sinon from 'sinon'

const storageService = new MockLocalForage()
const originalLoadZkeyChunks = proverModule.loadZkeyChunks

describe('PCD tests', function () {
  this.timeout(0)

  let certificate: string
  this.beforeAll(() => {
    const certificateDirName = __dirname + '/../../circuits/assets'
    certificate = fs
      .readFileSync(certificateDirName + '/uidai_prod_cdup.cer')
      .toString()

    sinon.stub(proverModule, 'loadZkeyChunks').callsFake(async () => {
      return originalLoadZkeyChunks(storageService)
    })
  })

  this.afterAll(() => {
    sinon.restore()
  })

  it('Proving flow with artifacts fetched locally', async function () {
    const artifactsDirName = __dirname + '/../../circuits/artifacts'
    const anonAadhaarInitArgs: InitArgs = {
      wasmURL: artifactsDirName + '/aadhaar-verifier.wasm',
      zkeyURL: artifactsDirName + '/circuit_final.zkey',
      vkeyURL: artifactsDirName + '/vkey.json',
      artifactsOrigin: ArtifactsOrigin.local,
    }

    await init(anonAadhaarInitArgs)

    const args = await generateArgs(QRData, certificate)

    const anonAadhaarProof = await prove(args)

    const verified = await verify(anonAadhaarProof)
    assert(verified == true, 'Should be verified')
  })

  it('Proving flow with artifacts fetched from server', async function () {
    const anonAadhaarInitArgs: InitArgs = {
      wasmURL: artifactUrls.test.wasm,
      zkeyURL: artifactUrls.test.zkey,
      vkeyURL: artifactUrls.test.vk,
      artifactsOrigin: ArtifactsOrigin.server,
    }

    await init(anonAadhaarInitArgs)

    const args = await generateArgs(QRData, certificate)

    const anonAadhaarProof = await prove(args)

    const verified = await verify(anonAadhaarProof)

    assert(verified == true, 'Should be verified')
  })

  it('Proving flow with chunked artifacts fetched from server', async function () {
    const anonAadhaarInitArgs: InitArgs = {
      wasmURL: artifactUrls.test.wasm,
      zkeyURL: artifactUrls.test.chunked,
      vkeyURL: artifactUrls.test.vk,
      artifactsOrigin: ArtifactsOrigin.chunked,
    }

    await searchZkeyChunks(artifactUrls.test.chunked, storageService)

    await init(anonAadhaarInitArgs)

    const args = await generateArgs(QRData, certificate)

    const anonAadhaarProof = await prove(args)

    const verified = await verify(anonAadhaarProof)

    assert(verified == true, 'Should be verified')
  })
})
