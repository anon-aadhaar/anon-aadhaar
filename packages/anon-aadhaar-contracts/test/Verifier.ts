import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import {
  init,
  PCDInitArgs,
  WASM_URL,
  ZKEY_URL,
  VK_URL,
  genData,
  exportCallDataGroth16,
  splitToWords,
} from 'anon-aadhaar-pcd'
import crypto from 'crypto'

describe('VerifyProof', function () {
  this.timeout(0)
  async function deployOneYearLockFixture() {
    const Verifier = await ethers.getContractFactory('Verifier')
    const verifier = await Verifier.deploy()

    return { verifier }
  }

  describe('Verify', function () {
    describe('Verify a proof', function () {
      it('Should return true for a valid proof', async function () {
        const { verifier } = await loadFixture(deployOneYearLockFixture)

        const pcdInitArgs: PCDInitArgs = {
          wasmURL: WASM_URL,
          zkeyURL: ZKEY_URL,
          vkeyURL: VK_URL,
          isWebEnv: true,
        }

        await init(pcdInitArgs)

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

        // We use lock.connect() to send a transaction from another account
        expect(await verifier.verifyProof(a, b, c, Input)).to.be.equal(true)
      })
    })
  })
})
