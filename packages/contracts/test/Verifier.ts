import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { expect } from 'chai'
import { ethers, network } from 'hardhat'
import {
  InitArgs,
  init,
  generateArgs,
  prove,
  artifactUrls,
  AnonAadhaarProof,
  PackedGroth16Proof,
  packGroth16Proof,
  ArtifactsOrigin,
} from '../../core/src'
import { testQRData } from '../../circuits/assets/dataInput.json'
import fs from 'fs'
import { testPublicKeyHash } from './const'

describe('VerifyProof', function () {
  this.timeout(0)

  let packedGroth16Proof: PackedGroth16Proof
  let anonAadhaarProof: AnonAadhaarProof
  let certificate: string
  let user1addres: string

  this.beforeAll(async () => {
    const certificateDirName = __dirname + '/../../circuits/assets'
    certificate = fs
      .readFileSync(certificateDirName + '/uidai_prod_cdup.cer')
      .toString()

    const anonAadhaarInitArgs: InitArgs = {
      wasmURL: artifactUrls.test.wasm,
      zkeyURL: artifactUrls.test.zkey,
      vkeyURL: artifactUrls.test.vk,
      artifactsOrigin: ArtifactsOrigin.server,
    }

    const [user1] = await ethers.getSigners()
    user1addres = user1.address

    await init(anonAadhaarInitArgs)

    const args = await generateArgs(testQRData, certificate, user1addres)

    const anonAadhaarCore = await prove(args)

    anonAadhaarProof = anonAadhaarCore.proof

    packedGroth16Proof = packGroth16Proof(anonAadhaarProof.groth16Proof)
  })

  async function deployOneYearLockFixture() {
    const Verifier = await ethers.getContractFactory('VerifierTest')
    const verifier = await Verifier.deploy()

    const _verifierAddress = await verifier.getAddress()

    const pubkeyHashBigInt = BigInt(testPublicKeyHash).toString()

    const AnonAadhaarContract = await ethers.getContractFactory('AnonAadhaar')
    const anonAadhaarVerifier = await AnonAadhaarContract.deploy(
      _verifierAddress,
      pubkeyHashBigInt,
    )

    const _AnonAadhaarAddress = await anonAadhaarVerifier.getAddress()

    const AnonAadhaarVote = await ethers.getContractFactory('AnonAadhaarVote')
    const anonAadhaarVote = await AnonAadhaarVote.deploy(
      'Do you like this app?',
      ['yes', 'no', 'maybe'],
      _AnonAadhaarAddress,
    )

    return {
      anonAadhaarVerifier,
      anonAadhaarVote,
    }
  }

  describe('AnonAadhaarVote Contract', function () {
    describe('verifyAnonAadhaarProof', function () {
      it('Should return true for a valid PCD proof', async function () {
        const { anonAadhaarVerifier } = await loadFixture(
          deployOneYearLockFixture,
        )

        expect(
          await anonAadhaarVerifier.verifyAnonAadhaarProof(
            anonAadhaarProof.identityNullifier,
            anonAadhaarProof.userNullifier,
            anonAadhaarProof.timestamp,
            user1addres,
            packedGroth16Proof,
          ),
        ).to.be.equal(true)
      })

      it('Should revert for a wrong signal', async function () {
        const { anonAadhaarVerifier } = await loadFixture(
          deployOneYearLockFixture,
        )

        expect(
          await anonAadhaarVerifier.verifyAnonAadhaarProof(
            anonAadhaarProof.identityNullifier,
            anonAadhaarProof.userNullifier,
            anonAadhaarProof.timestamp,
            40,
            packedGroth16Proof,
          ),
        ).to.be.equal(false)
      })
    })
  })

  describe('AnonAadhaar Vote', function () {
    describe('Vote for a proposal', function () {
      it('Should revert if signal is different from senderss address', async function () {
        const { anonAadhaarVote } = await loadFixture(deployOneYearLockFixture)

        const [, , user2] = await ethers.getSigners()

        await expect(
          (
            anonAadhaarVote.connect(user2) as typeof anonAadhaarVote
          ).voteForProposal(
            0,
            anonAadhaarProof.identityNullifier,
            anonAadhaarProof.userNullifier,
            anonAadhaarProof.timestamp,
            user1addres,
            packedGroth16Proof,
          ),
        ).to.be.revertedWith('[AnonAadhaarVote]: wrong user signal sent.')
      })

      it('Should verify a proof with right address in signal', async function () {
        const { anonAadhaarVote } = await loadFixture(deployOneYearLockFixture)

        await expect(
          anonAadhaarVote.voteForProposal(
            0,
            anonAadhaarProof.identityNullifier,
            anonAadhaarProof.userNullifier,
            anonAadhaarProof.timestamp,
            user1addres,
            packedGroth16Proof,
          ),
        ).to.emit(anonAadhaarVote, 'Voted')
      })

      it('Should revert if timestamp is more than 3hr ago', async function () {
        const { anonAadhaarVote } = await loadFixture(deployOneYearLockFixture)

        const testTimestamp =
          new Date('2019-03-08T09:00:00.000Z').getTime() / 1000

        // Set the block timestamp to '2019-03-08T09:00:00.000Z' and mine a new block
        await network.provider.send('evm_setNextBlockTimestamp', [
          testTimestamp,
        ])
        await network.provider.send('evm_mine')

        await expect(
          anonAadhaarVote.voteForProposal(
            0,
            anonAadhaarProof.identityNullifier,
            anonAadhaarProof.userNullifier,
            anonAadhaarProof.timestamp,
            user1addres,
            packedGroth16Proof,
          ),
        ).to.be.revertedWith(
          '[AnonAadhaarVote]: Proof must be generated with Aadhaar data generated less than 3 hours ago.',
        )
      })
    })
  })
})
