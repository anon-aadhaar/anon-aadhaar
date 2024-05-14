import { FieldsToRevealArray } from '@anon-aadhaar/core'
import { keccak256 } from '@ethersproject/keccak256'
import { ZKArtifact, groth16 } from 'snarkjs'
import { retrieveValuesInDB } from '@anon-aadhaar/react'

const APP_ID = 1346066938123

function computeClaimKeyFromName(name: string) {
  return BigInt(keccak256(Buffer.from(name)))
    .toString()
    .slice(0, 8)
}

function stringToPackedInts(str: string) {
  // Convert the string in to integers of 31 bytes
  const packedInts = []

  let currentInt = BigInt(0)
  for (let i = 0; i < str.length; i++) {
    const charCode = BigInt(str.charCodeAt(i))
    currentInt += charCode << BigInt((i % 31) * 8)

    if (i % 31 === 30) {
      packedInts.push(currentInt)
      currentInt = BigInt(0)
    }

    if (i === str.length - 1) {
      packedInts.push(currentInt)
    }
  }

  return packedInts
}

async function fetchKey(keyURL: string, maxRetries = 3): Promise<ZKArtifact> {
  let attempts = 0
  while (attempts < maxRetries) {
    try {
      const response = await fetch(keyURL)
      if (!response.ok) {
        throw new Error(
          `Error while fetching ${keyURL} artifacts from prover: ${response.statusText}`,
        )
      }

      const data = await response.arrayBuffer()
      return data as Buffer
    } catch (error) {
      attempts++
      if (attempts >= maxRetries) {
        throw error
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * attempts))
    }
  }
  return keyURL
}

export const generateAFKProofs = async (
  secret: string,
  fieldsToRevealArray: FieldsToRevealArray,
) => {
  const fieldsToReveal = {
    revealGender: fieldsToRevealArray.includes('revealGender'),
    revealAgeAbove18: fieldsToRevealArray.includes('revealAgeAbove18'),
    revealState: fieldsToRevealArray.includes('revealState'),
    revealPinCode: fieldsToRevealArray.includes('revealPinCode'),
  }

  // Assume retrieveValuesInDB now properly returns a string
  const clearValues = await Promise.all([
    retrieveValuesInDB('ageAbove18'),
    retrieveValuesInDB('gender'),
    retrieveValuesInDB('state'),
    retrieveValuesInDB('pinCode'),
  ])

  console.log(clearValues)

  const input = {
    secret: BigInt('0x' + secret),
    issuerIds: [
      BigInt(37977685).toString(),
      fieldsToReveal.revealAgeAbove18 ? BigInt(37977685).toString() : '0',
      fieldsToReveal.revealGender ? BigInt(37977685).toString() : '0',
      fieldsToReveal.revealState ? BigInt(37977685).toString() : '0',
      fieldsToReveal.revealPinCode ? BigInt(37977685).toString() : '0',
    ],
    claimKeys: [
      BigInt(computeClaimKeyFromName('bio.country')).toString(),
      fieldsToReveal.revealAgeAbove18
        ? BigInt(computeClaimKeyFromName('bio.ageAbove18')).toString()
        : '0',
      fieldsToReveal.revealGender
        ? BigInt(computeClaimKeyFromName('bio.gender')).toString()
        : '0',
      fieldsToReveal.revealState
        ? BigInt(computeClaimKeyFromName('bio.state')).toString()
        : '0',
      fieldsToReveal.revealPinCode
        ? BigInt(computeClaimKeyFromName('bio.pincode')).toString()
        : '0',
    ],
    claimValues: [
      stringToPackedInts('India')[0].toString(),
      fieldsToReveal.revealAgeAbove18
        ? stringToPackedInts(clearValues[0].toString())[0].toString()
        : '0',
      fieldsToReveal.revealGender
        ? stringToPackedInts(clearValues[1])[0].toString()
        : '0',
      fieldsToReveal.revealState
        ? stringToPackedInts(clearValues[2])[0].toString()
        : '0',
      fieldsToReveal.revealPinCode
        ? stringToPackedInts(clearValues[3])[0].toString()
        : '0',
    ],
    scope: APP_ID,
    message: 1,
  }

  const wasmBuffer = new Uint8Array(
    (await fetchKey('/afk.wasm')) as ArrayBuffer,
  )
  const zkeyBuffer = new Uint8Array(
    (await fetchKey('/afk.zkey')) as ArrayBuffer,
  )

  console.log('lauching afk prover')
  const { proof, publicSignals } = await groth16.fullProve(
    input,
    wasmBuffer,
    zkeyBuffer,
  )

  return {
    groth16Proof: proof,
    afkNullifier: publicSignals[0],
    claimCommitments_1: publicSignals[0],
    claimCommitments_2: publicSignals[1],
    claimCommitments_3: publicSignals[2],
    claimCommitments_4: publicSignals[3],
    claimCommitments_5: publicSignals[4],
    claimKeys_1: publicSignals[5],
    claimKeys_2: publicSignals[7],
    claimKeys_3: publicSignals[8],
    claimKeys_4: publicSignals[9],
    claimKeys_5: publicSignals[10],
    claimValues_1: publicSignals[11],
    claimValues_2: publicSignals[12],
    claimValues_3: publicSignals[13],
    claimValues_4: publicSignals[14],
    claimValues_5: publicSignals[15],
    scope: publicSignals[16],
    message: publicSignals[17],
  }
}
