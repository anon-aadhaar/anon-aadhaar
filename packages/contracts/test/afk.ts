// import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
// import { expect } from 'chai'
// import { ethers, network } from 'hardhat'
// import {
//   InitArgs,
//   init,
//   generateArgs,
//   prove,
//   artifactUrls,
//   AnonAadhaarProof,
//   PackedGroth16Proof,
//   packGroth16Proof,
//   ArtifactsOrigin,
// } from '../../core/src'
// import { testQRData } from '../../circuits/assets/dataInput.json'
// import fs from 'fs'
// import { testPublicKeyHash } from './const'

// describe('AFK', function () {
//   this.timeout(0)

//   async function deployOneYearLockFixture() {
//     const Verifier = await ethers.getContractFactory('Verifier')
//     const verifier = await Verifier.deploy()

//     const _verifierAddress = await verifier.getAddress()

//     const pubkeyHashBigInt = BigInt(testPublicKeyHash).toString()

//     const AnonAadhaarContract = await ethers.getContractFactory('AnonAadhaar')
//     const anonAadhaarVerifier = await AnonAadhaarContract.deploy(
//       _verifierAddress,
//       pubkeyHashBigInt,
//     )

//     const _AnonAadhaarAddress = await anonAadhaarVerifier.getAddress()

//     const AnonAadhaarVote = await ethers.getContractFactory('AnonAadhaarVote')
//     const anonAadhaarVote = await AnonAadhaarVote.deploy(
//       'Do you like this app?',
//       ['yes', 'no', 'maybe'],
//       _AnonAadhaarAddress,
//     )

//     return {
//       anonAadhaarVerifier,
//       anonAadhaarVote,
//     }
//   }

//   describe('AnonAadhaar Verifier Contract', function () {
//     let packedGroth16Proof: PackedGroth16Proof
//     let anonAadhaarProof: AnonAadhaarProof
//     let certificate: string
//     let user1addres: string

//     const nullifierSeed = 1234

//     this.beforeAll(async () => {
//       const certificateDirName = __dirname + '/../../circuits/assets'
//       certificate = fs
//         .readFileSync(certificateDirName + '/testCertificate.pem')
//         .toString()

//       const anonAadhaarInitArgs: InitArgs = {
//         wasmURL: artifactUrls.v2.wasm,
//         zkeyURL: artifactUrls.v2.zkey,
//         vkeyURL: artifactUrls.v2.vk,
//         artifactsOrigin: ArtifactsOrigin.server,
//       }

//       const [user1] = await ethers.getSigners()
//       user1addres = user1.address

//       await init(anonAadhaarInitArgs)

//     })

//     describe('verifyAnonAadhaarProof', function () {
//       it('Should return true for a valid AnonAadhaar proof', async function () {

//       })

//     })
//   })
// })
