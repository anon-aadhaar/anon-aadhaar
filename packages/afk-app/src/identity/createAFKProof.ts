import { keccak256 } from '@ethersproject/keccak256'
import { ZKArtifact, groth16 } from 'snarkjs'

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

export const generateAFKProofs = async (secret: string) => {
  const input = {
    secret: BigInt('0x' + secret),
    issuerIds: [BigInt(37977685).toString(), '0', '0', '0', '0'],
    claimKeys: [
      BigInt(computeClaimKeyFromName('bio.country')).toString(),
      '0',
      '0',
      '0',
      '0',
    ],
    // Here we need to input the real values
    // To do: store the cleared values from the ID card
    claimValues: [
      stringToPackedInts('India')[0].toString(),
      '0',
      '0',
      '0',
      '0',
    ],
    scope: APP_ID,
    message: 1,
  }

  console.log('Inputs for AFK: ', input)

  const wasmBuffer = new Uint8Array(
    (await fetchKey('./afk.wasm')) as ArrayBuffer,
  )
  const zkeyBuffer = new Uint8Array(
    (await fetchKey('./afk.zkey')) as ArrayBuffer,
  )

  console.log('lauching afk prover')
  groth16.fullProve(input, wasmBuffer, zkeyBuffer)
  console.log('proof generated')
}
