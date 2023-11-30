import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import {
  genData,
  splitToWords,
  exportCallDataGroth16,
  extractWitness,
  WASM_URL,
  ZKEY_URL,
} from 'anon-aadhaar-pcd'
import crypto from 'crypto'
import { fetchKey } from './util'
import fs from 'fs'

describe('VerifyProof', function () {
  this.timeout(0)

  async function deployOneYearLockFixture() {
    const Verifier = await ethers.getContractFactory('Verifier')
    const verifier = await Verifier.deploy()

    const appIdBigInt = BigInt(
      '196700487049306364386084600156231018794323017728',
    ).toString()

    return {
      verifier,
      appIdBigInt,
    }
  }

  describe('Verify', function () {
    describe('Verifier', function () {
      it('Should return true for a valid proof', async function () {
        const { verifier } = await loadFixture(deployOneYearLockFixture)
        const testData: [bigint, bigint, bigint, bigint] = await genData(
          'Hello world',
          'SHA-1',
        )
        const app_id = BigInt(
          parseInt(crypto.randomBytes(20).toString('hex'), 16),
        ) // random value.
        const input = {
          signature: splitToWords(BigInt(testData[1]), BigInt(64), BigInt(32)),
          modulus: splitToWords(BigInt(testData[2]), BigInt(64), BigInt(32)),
          base_message: splitToWords(
            BigInt(testData[3]),
            BigInt(64),
            BigInt(32),
          ),
          app_id: app_id.toString(),
        }
        const dirName = __dirname + '/../../anon-aadhaar-pcd/artifacts/RSA'
        const { a, b, c, Input } = await exportCallDataGroth16(
          input,
          dirName + '/main.wasm',
          dirName + '/circuit_final.zkey',
        )

        expect(await verifier.verifyProof(a, b, c, Input)).to.be.equal(true)
      })

      it.skip('Should return true for a valid proof with webProver', async function () {
        const { verifier, appIdBigInt } = await loadFixture(
          deployOneYearLockFixture,
        )

        const dirName = __dirname + '/../../anon-aadhaar-pcd/build/pdf'

        const testFile = dirName + '/signed.pdf'
        const pdfRaw = fs.readFileSync(testFile)
        const pdfBuffer = Buffer.from(pdfRaw)
        const inputs = await extractWitness(pdfBuffer, 'test123')

        if (inputs instanceof Error) throw new Error(inputs.message)

        const input = {
          signature: splitToWords(inputs.sigBigInt, BigInt(64), BigInt(32)),
          modulus: splitToWords(inputs.modulusBigInt, BigInt(64), BigInt(32)),
          base_message: splitToWords(inputs.msgBigInt, BigInt(64), BigInt(32)),
          app_id: appIdBigInt,
        }

        const { a, b, c, Input } = await exportCallDataGroth16(
          input,
          await fetchKey(WASM_URL),
          await fetchKey(ZKEY_URL),
        )

        expect(await verifier.verifyProof(a, b, c, Input)).to.be.equal(true)
      })
    })
  })
})
