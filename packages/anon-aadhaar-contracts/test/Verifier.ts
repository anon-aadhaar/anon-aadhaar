// import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
// import { expect } from 'chai'
// import { ethers } from 'hardhat'
// import { ArgumentTypeName } from '@pcd/pcd-types'
// import {
//   AnonAadhaarPCDArgs,
//   prove,
//   init,
//   PCDInitArgs,
//   WASM_URL,
//   ZKEY_URL,
//   VK_URL,
//   genData,
//   exportCallDataGroth16,
// } from 'anon-aadhaar-pcd'

// describe('VerifyProof', function () {
//   this.timeout(0)
//   async function deployOneYearLockFixture() {
//     const Verifier = await ethers.getContractFactory('Verifier')
//     const verifier = await Verifier.deploy()

//     return { verifier }
//   }

//   describe('Verify', function () {
//     describe('Verify a proof', function () {
//       it('Should return true for a valid proof', async function () {
//         const { verifier } = await loadFixture(deployOneYearLockFixture)

//         const pcdInitArgs: PCDInitArgs = {
//           wasmURL: WASM_URL,
//           zkeyURL: ZKEY_URL,
//           vkeyURL: VK_URL,
//           isWebEnv: true,
//         }

//         await init(pcdInitArgs)

//         const testData: [bigint, bigint, bigint, bigint] = await genData(
//           'Hello world',
//           'SHA-1',
//         )

//         const pcdArgs: AnonAadhaarPCDArgs = {
//           signature: {
//             argumentType: ArgumentTypeName.BigInt,
//             value: testData[1] + '',
//           },
//           modulus: {
//             argumentType: ArgumentTypeName.BigInt,
//             value: testData[2] + '',
//           },
//           base_message: {
//             argumentType: ArgumentTypeName.BigInt,
//             value: testData[3] + '',
//           },
//         }

//         const pcd = await prove(pcdArgs)

//         const { a, b, c, Input } = await exportCallDataGroth16(
//           pcd.proof.proof,
//           pcd.proof.modulus,
//         )

//         // We use lock.connect() to send a transaction from another account
//         expect(await verifier.verifyProof(a, b, c, Input)).to.be.equal(true)
//       })
//     })
//   })
// })
