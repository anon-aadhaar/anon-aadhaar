import { describe } from 'mocha'
import { ArtifactsOrigin, InitArgs } from '../src/types'
import { init, prove, verify } from '../src/core'
import { assert } from 'chai'
import { artifactUrls, generateArgs } from '../src'
import fs from 'fs'
import { testQRData as QRData } from '../../circuits/assets/dataInput.json'
import { MockLocalForage } from './__mocks__/localforage'
import * as proverModule from '../src/prover'
import sinon from 'sinon'

const mockedStorageService = new MockLocalForage()
const originalLoadZkeyChunks = proverModule.loadZkeyChunks

describe('Core tests', function () {
  this.timeout(0)

  let certificate: string
  this.beforeAll(() => {
    const certificateDirName = __dirname + '/../../circuits/assets'
    certificate = fs
      .readFileSync(certificateDirName + '/testCertificate.pem')
      .toString()

    sinon.stub(proverModule, 'loadZkeyChunks').callsFake(async () => {
      return originalLoadZkeyChunks(
        artifactUrls.Lite.chunked,
        mockedStorageService
      )
    })
  })

  this.afterAll(() => {
    mockedStorageService.clear()
    sinon.restore()
  })

  it('Proving flow with artifacts fetched locally', async function () {
    const artifactsDirName = __dirname + '/../../circuits/build'
    const anonAadhaarInitArgs: InitArgs = {
      wasmURL:
        artifactsDirName + '/aadhaar-verifier.afk_js/aadhaar-verifier.afk.wasm',
      zkeyURL: artifactsDirName + '/aadhaar-verifier.afk.zkey',
      vkeyURL: artifactsDirName + '/aadhaar-verifier.afk.vkey.json',
      artifactsOrigin: ArtifactsOrigin.local,
    }

    await init(anonAadhaarInitArgs)

    const args = await generateArgs({
      qrData: QRData,
      certificateFile: certificate,
      secret: '123456',
    })

    const anonAadhaarProof = await prove(args)

    const verified = await verify(anonAadhaarProof)
    assert(verified == true, 'Should be verified')
  })

  it('Proving flow with artifacts fetched from server', async function () {
    const anonAadhaarInitArgs: InitArgs = {
      wasmURL: artifactUrls.Lite.wasm,
      zkeyURL: artifactUrls.Lite.zkey,
      vkeyURL: artifactUrls.Lite.vk,
      artifactsOrigin: ArtifactsOrigin.server,
    }

    await init(anonAadhaarInitArgs)

    const args = await generateArgs({
      qrData: QRData,
      certificateFile: certificate,
      secret: '123456',
    })

    const anonAadhaarProof = await prove(args)

    const verified = await verify(anonAadhaarProof)

    assert(verified == true, 'Should be verified')
  })

  it('Proving flow with chunked artifacts fetched from server', async function () {
    const anonAadhaarInitArgs: InitArgs = {
      wasmURL: artifactUrls.Lite.wasm,
      zkeyURL: artifactUrls.Lite.chunked,
      vkeyURL: artifactUrls.Lite.vk,
      artifactsOrigin: ArtifactsOrigin.chunked,
    }

    await init(anonAadhaarInitArgs)

    const args = await generateArgs({
      qrData: QRData,
      certificateFile: certificate,
      secret: '123456',
    })

    const anonAadhaarProof = await prove(args)

    const verified = await verify(anonAadhaarProof)

    assert(verified == true, 'Should be verified')
  })
})
