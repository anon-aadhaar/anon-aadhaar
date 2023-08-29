import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { genData, exportCallDataGroth16 } from './utils'
import { ArgumentTypeName } from '@pcd/pcd-types'
import {
  IdentityPCDArgs,
  prove,
  init,
  PCDInitArgs,
  splitToWords,
} from 'anon-aadhaar-pcd'

describe('VerifyProof', function () {
  this.timeout(0)
  async function deployOneYearLockFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners()

    const Verifier = await ethers.getContractFactory('Verifier')
    const verifier = await Verifier.deploy()

    return { verifier, owner, otherAccount }
  }

  describe('Verify', function () {
    describe('Verify a proof', function () {
      it('Should return true for a valid proof', async function () {
        const { verifier } = await loadFixture(deployOneYearLockFixture)

        const pcdInitArgs: PCDInitArgs = {
          wasmURL: 'https://d3dxq5smiosdl4.cloudfront.net/main.wasm',
          zkeyURL: 'https://d3dxq5smiosdl4.cloudfront.net/circuit_final.zkey',
          isWebEnv: true,
        }

        await init(pcdInitArgs)

        const testData: [bigint, bigint, bigint, bigint] = await genData(
          'Hello world',
          'SHA-1',
        )

        const pcdArgs: IdentityPCDArgs = {
          signature: {
            argumentType: ArgumentTypeName.BigInt,
            value: testData[1] + '',
          },
          modulus: {
            argumentType: ArgumentTypeName.BigInt,
            value: testData[2] + '',
          },
          base_message: {
            argumentType: ArgumentTypeName.BigInt,
            value: testData[3] + '',
          },
        }

        const pcd = await prove(pcdArgs)

        const { a, b, c, Input } = await exportCallDataGroth16(
          pcd.proof.proof,
          [...splitToWords(BigInt(pcd.proof.modulus), BigInt(64), BigInt(32))],
        )

        // We use lock.connect() to send a transaction from another account
        expect(await verifier.verifyProof(a, b, c, Input)).to.be.equal(true)
      })
    })
  })
})
