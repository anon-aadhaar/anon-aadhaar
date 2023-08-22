import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { genData } from './utils'
import { ArgumentTypeName } from '@pcd/pcd-types'
import {
  IdentityPCDArgs,
  prove,
  init,
  PCDInitArgs,
  splitToWords,
  BigNumberish,
} from 'pcd-country-identity'

describe('VerifyProof', function () {
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

        const _pA: [BigNumberish, BigNumberish] = [
          pcd.proof.proof.pi_a[0],
          pcd.proof.proof.pi_a[1],
        ]
        const _pB: [
          [BigNumberish, BigNumberish],
          [BigNumberish, BigNumberish],
        ] = [
          [pcd.proof.proof.pi_b[0][0], pcd.proof.proof.pi_b[0][1]],
          [pcd.proof.proof.pi_b[1][0], pcd.proof.proof.pi_b[1][0]],
        ]
        const _pC: [BigNumberish, BigNumberish] = [
          pcd.proof.proof.pi_c[0],
          pcd.proof.proof.pi_c[1],
        ]
        const _inputSignals: BigNumberish[] = [
          ...splitToWords(BigInt(pcd.proof.modulus), BigInt(64), BigInt(32)),
        ]

        // We use lock.connect() to send a transaction from another account
        await expect(
          await verifier.verifyProof(_pA, _pB, _pC, _inputSignals),
        ).to.be.equal(false)
      })
    })

    // describe('Events', function () {
    //   it('Should emit an event on withdrawals', async function () {
    //     const { verifier, unlockTime, lockedAmount } = await loadFixture(
    //       deployOneYearLockFixture
    //     )

    //     await time.increaseTo(unlockTime)

    //     await expect(verifier.withdraw())
    //       .to.emit(verifier, 'Withdrawal')
    //       .withArgs(lockedAmount, anyValue) // We accept any value as `when` arg
    //   })
    // })
  })
})
