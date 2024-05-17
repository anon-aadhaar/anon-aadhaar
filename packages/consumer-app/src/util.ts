import { Groth16Proof, ZKArtifact, groth16 } from 'snarkjs'

export type FullProof = {
  groth16Proof: Groth16Proof
  afkNullifier: string
  claimCommitments_1: string
  claimCommitments_2: string
  claimCommitments_3: string
  claimCommitments_4: string
  claimCommitments_5: string
  claimKeys_1: string
  claimKeys_2: string
  claimKeys_3: string
  claimKeys_4: string
  claimKeys_5: string
  claimValues_1: string
  claimValues_2: string
  claimValues_3: string
  claimValues_4: string
  claimValues_5: string
  scope: string
  message: string
}

export async function fetchKey(
  keyURL: string,
  maxRetries = 3,
): Promise<ZKArtifact> {
  let attempts = 0
  while (attempts < maxRetries) {
    try {
      const response = await fetch(keyURL)
      if (!response.ok) {
        throw new Error(
          `Error while fetching ${keyURL} artifacts from prover: ${response.statusText}`,
        )
      }

      const data = await response.json()
      return data
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

export const verifyProof = async (fullProof: FullProof) => {
  const proof = fullProof.groth16Proof
  const publicSignals = [
    fullProof.afkNullifier,
    fullProof.claimCommitments_1,
    fullProof.claimCommitments_2,
    fullProof.claimCommitments_3,
    fullProof.claimCommitments_4,
    fullProof.claimCommitments_5,
    fullProof.claimKeys_1,
    fullProof.claimKeys_2,
    fullProof.claimKeys_3,
    fullProof.claimKeys_4,
    fullProof.claimKeys_4,
    fullProof.claimValues_1,
    fullProof.claimValues_2,
    fullProof.claimValues_3,
    fullProof.claimValues_4,
    fullProof.claimValues_5,
    fullProof.scope,
    fullProof.message,
  ]

  const vk = await fetchKey('/afk.vkey.json')

  return await groth16.verify(vk, publicSignals, proof)
}
