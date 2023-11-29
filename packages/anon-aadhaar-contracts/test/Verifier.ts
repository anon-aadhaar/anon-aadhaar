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
import fs from 'fs'
import { fetchKey } from './util'

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

    return {
      verifier,
      anonAadhaarVerifier,
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
        // We use lock.connect() to send a transaction from another account
        expect(await verifier.verifyProof(a, b, c, Input)).to.be.equal(true)
      })
    })

    describe('AnonAadhaarVerifier', function () {
      it('Should not create an appId greater than the snark scalar field', async () => {
        const { verifier } = await loadFixture(deployOneYearLockFixture)

        const _verifierAddress = await verifier.getAddress()
        const AnonAadhaarVerifier = await ethers.getContractFactory(
          'AnonAadhaarVerifier',
        )

        const wrongAppId = BigInt(
          '21888242871839275222246405745257275088548364400416034343698204186575808495618',
        ).toString()

        const wrongAnonAadhaarVerifier = AnonAadhaarVerifier.deploy(
          _verifierAddress,
          wrongAppId,
        )

        await expect(wrongAnonAadhaarVerifier).to.be.revertedWith(
          'AnonAadhaarVerifier: group id must be < SNARK_SCALAR_FIELD',
        )
      })

      it('Should revert for a valid proof with the wrong public key', async function () {
        const { anonAadhaarVerifier, appIdBigInt } = await loadFixture(
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
          app_id: appIdBigInt,
        }

        const dirName = __dirname + '/../../anon-aadhaar-pcd/artifacts/RSA'

        const { a, b, c, Input } = await exportCallDataGroth16(
          input,
          dirName + '/main.wasm',
          dirName + '/circuit_final.zkey',
        )

        expect(
          anonAadhaarVerifier.verifyProof(a, b, c, Input),
        ).to.be.revertedWith('AnonAadhaarVerifier: wrong issuer public key')
      })

      it('Should revert for a valid proof with wrong app_id', async function () {
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

        await expect(
          anonAadhaarVerifier.verifyProof(a, b, c, Input),
        ).to.be.revertedWith('AnonAadhaarVerifier: wrong app ID')
      })

      it('Should return true for a valid proof with webProver', async function () {
        const { anonAadhaarVerifier, appIdBigInt } = await loadFixture(
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

        expect(
          await anonAadhaarVerifier.verifyProof(a, b, c, Input),
        ).to.be.equal(true)
      })
    })
  })
})
