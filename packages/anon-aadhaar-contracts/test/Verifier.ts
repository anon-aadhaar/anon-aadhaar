import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { exportCallDataGroth16 } from './utils'
import { genData, splitToWords } from 'anon-aadhaar-pcd'
import crypto from 'crypto'

describe('VerifyProof', function () {
  this.timeout(0)
  async function deployOneYearLockFixture() {
    const Verifier = await ethers.getContractFactory('Verifier')
    const verifier = await Verifier.deploy()

    const _verifierAddress = await verifier.getAddress()

    const appIdBigInt = BigInt(
      '196700487049306364386084600156231018794323017728',
    ).toString()

    const AnonAadhaarVerifier = await ethers.getContractFactory(
      'AnonAadhaarVerifier',
    )
    const anonAadhaarVerifier = await AnonAadhaarVerifier.deploy(
      _verifierAddress,
      appIdBigInt,
    )

    return { verifier, anonAadhaarVerifier }
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

        // We use lock.connect() to send a transaction from another account
        expect(await verifier.verifyProof(a, b, c, Input)).to.be.equal(true)
      })
    })

    describe('AnonAadhaarVerifier', function () {
      it('Should return true for a valid proof', async function () {
        const { anonAadhaarVerifier } = await loadFixture(
          deployOneYearLockFixture,
        )

        const testData: [bigint, bigint, bigint, bigint] = await genData(
          'Hello world',
          'SHA-1',
        )

        const input = {
          signature: splitToWords(BigInt(testData[1]), BigInt(64), BigInt(32)),
          modulus: splitToWords(BigInt(testData[2]), BigInt(64), BigInt(32)),
          base_message: splitToWords(
            BigInt(testData[3]),
            BigInt(64),
            BigInt(32),
          ),
          app_id: '196700487049306364386084600156231018794323017728',
        }

        const dirName = __dirname + '/../../anon-aadhaar-pcd/artifacts/RSA'

        const { a, b, c, Input } = await exportCallDataGroth16(
          input,
          dirName + '/main.wasm',
          dirName + '/circuit_final.zkey',
        )

        expect(
          await anonAadhaarVerifier.verifyProof(a, b, c, Input),
        ).to.be.equal(true)
      })

      it('Should return false for a valid proof with wrong app_id', async function () {
        const { anonAadhaarVerifier } = await loadFixture(
          deployOneYearLockFixture,
        )

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

        await expect(anonAadhaarVerifier.verifyProof(a, b, c, Input)).to.be
          .reverted
      })
    })
  })
})
