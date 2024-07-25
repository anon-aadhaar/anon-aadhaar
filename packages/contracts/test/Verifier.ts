import {
  loadFixture,
  time,
} from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { expect } from 'chai'
import { ethers } from 'hardhat'
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
import { testPublicKeyHash } from '@anon-aadhaar/core'

describe('VerifyProof', function () {
  this.timeout(0)

  async function deployOneYearLockFixture() {
    const Verifier = await ethers.getContractFactory('Verifier')
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

  describe('AnonAadhaar Verifier Contract', function () {
    let packedGroth16Proof: PackedGroth16Proof
    let anonAadhaarProof: AnonAadhaarProof
    let certificate: string
    let user1addres: string

    const nullifierSeed = 1234

    this.beforeAll(async () => {
      const certificateDirName = __dirname + '/../../circuits/assets'
      certificate = fs
        .readFileSync(certificateDirName + '/testCertificate.pem')
        .toString()

      const anonAadhaarInitArgs: InitArgs = {
        wasmURL: artifactUrls.v2.wasm,
        zkeyURL: artifactUrls.v2.zkey,
        vkeyURL: artifactUrls.v2.vk,
        artifactsOrigin: ArtifactsOrigin.server,
      }

      const [user1] = await ethers.getSigners()
      user1addres = user1.address

      await init(anonAadhaarInitArgs)

      const args = await generateArgs({
        qrData: testQRData,
        certificateFile: certificate,
        nullifierSeed: nullifierSeed,
        signal: user1addres,
        fieldsToRevealArray: [
          'revealAgeAbove18',
          'revealGender',
          'revealPinCode',
          'revealState',
        ],
      })

      const anonAadhaarCore = await prove(args)

      anonAadhaarProof = anonAadhaarCore.proof

      packedGroth16Proof = packGroth16Proof(anonAadhaarProof.groth16Proof)
    })

    describe('verifyAnonAadhaarProof', function () {
      it('Should return true for a valid AnonAadhaar proof', async function () {
        const { anonAadhaarVerifier } = await loadFixture(
          deployOneYearLockFixture,
        )

        expect(
          await anonAadhaarVerifier.verifyAnonAadhaarProof(
            nullifierSeed,
            anonAadhaarProof.nullifier,
            anonAadhaarProof.timestamp,
            user1addres,
            [
              anonAadhaarProof.ageAbove18,
              anonAadhaarProof.gender,
              anonAadhaarProof.pincode,
              anonAadhaarProof.state,
            ],
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
            nullifierSeed,
            anonAadhaarProof.nullifier,
            anonAadhaarProof.timestamp,
            40,
            [
              anonAadhaarProof.ageAbove18,
              anonAadhaarProof.gender,
              anonAadhaarProof.pincode,
              anonAadhaarProof.state,
            ],
            packedGroth16Proof,
          ),
        ).to.be.equal(false)
      })
    })
  })

  describe('AnonAadhaarVote contract', function () {
    let packedGroth16Proof: PackedGroth16Proof
    let anonAadhaarProof: AnonAadhaarProof
    let certificate: string
    let user1addres: string

    const nullifierSeed = 0 // proposal index as nullifierSeed

    this.beforeAll(async () => {
      const certificateDirName = __dirname + '/../../circuits/assets'
      certificate = fs
        .readFileSync(certificateDirName + '/testCertificate.pem')
        .toString()

      const anonAadhaarInitArgs: InitArgs = {
        wasmURL: artifactUrls.v2.wasm,
        zkeyURL: artifactUrls.v2.zkey,
        vkeyURL: artifactUrls.v2.vk,
        artifactsOrigin: ArtifactsOrigin.server,
      }

      const [user1] = await ethers.getSigners()
      user1addres = user1.address

      await init(anonAadhaarInitArgs)

      const args = await generateArgs({
        qrData: testQRData,
        certificateFile: certificate,
        nullifierSeed: nullifierSeed,
        signal: user1addres,
      })

      const anonAadhaarCore = await prove(args)

      anonAadhaarProof = anonAadhaarCore.proof

      packedGroth16Proof = packGroth16Proof(anonAadhaarProof.groth16Proof)
    })

    describe('Vote for a proposal', function () {
      it('Should revert if signal is different from senderss address', async function () {
        const { anonAadhaarVote } = await loadFixture(deployOneYearLockFixture)

        const [, , user2] = await ethers.getSigners()

        await expect(
          (
            anonAadhaarVote.connect(user2) as typeof anonAadhaarVote
          ).voteForProposal(
            0, // proposal index
            0, // proposal index also used as nullifierSeed,
            anonAadhaarProof.nullifier,
            anonAadhaarProof.timestamp,
            user1addres,
            [
              anonAadhaarProof.ageAbove18,
              anonAadhaarProof.gender,
              anonAadhaarProof.pincode,
              anonAadhaarProof.state,
            ],
            packedGroth16Proof,
          ),
        ).to.be.revertedWith('[AnonAadhaarVote]: Wrong user signal sent.')
      })

      it('Should verify a proof with right address in signal', async function () {
        const { anonAadhaarVote } = await loadFixture(deployOneYearLockFixture)

        await expect(
          anonAadhaarVote.voteForProposal(
            0, // proposal index
            0, // proposal index also used as nullifierSeed,
            anonAadhaarProof.nullifier,
            anonAadhaarProof.timestamp,
            user1addres,
            [
              anonAadhaarProof.ageAbove18,
              anonAadhaarProof.gender,
              anonAadhaarProof.pincode,
              anonAadhaarProof.state,
            ],
            packedGroth16Proof,
          ),
        ).to.emit(anonAadhaarVote, 'Voted')
      })

      it('Should revert if timestamp is more than 3hr ago', async function () {
        const { anonAadhaarVote } = await loadFixture(deployOneYearLockFixture)

        // Increase next block time to 5 hours from proof time
        await time.increaseTo(Number(anonAadhaarProof.timestamp) + 5 * 60 * 60)

        await expect(
          anonAadhaarVote.voteForProposal(
            0, // proposal index
            0, // proposal index also used as nullifierSeed,
            anonAadhaarProof.nullifier,
            anonAadhaarProof.timestamp,
            user1addres,
            [
              anonAadhaarProof.ageAbove18,
              anonAadhaarProof.gender,
              anonAadhaarProof.pincode,
              anonAadhaarProof.state,
            ],
            packedGroth16Proof,
          ),
        ).to.be.revertedWith(
          '[AnonAadhaarVote]: Proof must be generated with Aadhaar data signed less than 3 hours ago.',
        )
      })
    })
  })
})
