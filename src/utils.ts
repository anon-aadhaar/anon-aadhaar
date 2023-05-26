import { SnarkJSProof, Proof } from './types'

export function extractSignatureFromPDF() {
  throw new Error('Not implement yet')
}

export function splitToWordsWithName(
  x: bigint,
  w: bigint,
  n: bigint,
) {
  let t = x;
  const words = [];
  for (let i = BigInt(0); i < n; ++i) {
    const baseTwo = 2n
  
    words.push(`${t % baseTwo ** w}`);
    t = BigInt(t / 2n ** w)
  }
  if (!(t == BigInt(0))) {
    throw `Number ${x} does not fit in ${(w * n).toString()} bits`
  }
  return words
}

/**
 * Packs a proof into a format compatible with Semaphore.
 * @param originalProof The proof generated with SnarkJS.
 * @returns The proof compatible with Semaphore.
 */
export function packProof(originalProof: SnarkJSProof): Proof {
  return [
    originalProof.pi_a[0],
    originalProof.pi_a[1],
    originalProof.pi_b[0][1],
    originalProof.pi_b[0][0],
    originalProof.pi_b[1][1],
    originalProof.pi_b[1][0],
    originalProof.pi_c[0],
    originalProof.pi_c[1],
  ]
}

/**
 * Unpacks a proof into its original form.
 * @param proof The proof compatible with Semaphore.
 * @returns The proof compatible with SnarkJS.
 */
export function unpackProof(proof: Proof): SnarkJSProof {
  return {
    pi_a: [proof[0], proof[1]],
    pi_b: [
      [proof[3], proof[2]],
      [proof[5], proof[4]],
    ],
    pi_c: [proof[6], proof[7]],
    protocol: 'groth16',
    curve: 'bn128',
  }
}
