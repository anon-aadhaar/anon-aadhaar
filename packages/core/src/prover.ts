import { isWebUri } from 'valid-url'
import { AnonAadhaarArgs, AnonAadhaarProof, ArtifactsOrigin } from './types'
import { ZKArtifact, groth16 } from 'snarkjs'
import { storageService as defaultStorageService } from './storage'
import { artifactUrls } from './constants'
import {
  handleError,
  retrieveFileExtension,
  searchZkeyChunks,
  verifyArgNonNull,
} from './utils'

type Witness = AnonAadhaarArgs

// Search for the chunks in localforage and recompose the zkey from it.
export const loadZkeyChunks = async (
  zkeyUrl: string,
  storageService = defaultStorageService
): Promise<Uint8Array> => {
  const isTest = zkeyUrl === artifactUrls.test.chunked
  try {
    await searchZkeyChunks(zkeyUrl, storageService, isTest)
  } catch (e) {
    handleError(e, 'Error while searching for the zkey chunks')
  }

  const buffers: Uint8Array[] = []
  try {
    // Fetch zkey chunks from localForage
    for (let i = 0; i < 10; i++) {
      const fileName = isTest
        ? `circuit_final_test_${i}.zkey`
        : `circuit_final_prod_${i}.zkey`
      const item: Uint8Array | null = await storageService.getItem(fileName)
      if (!item) throw Error(`${fileName} missing in LocalForage!`)
      buffers.push(item)
    }
  } catch (e) {
    handleError(e, 'Error while retrieving zkey chunks from localforage')
  }

  // Rebuild the zkey from chunks
  const totalLength = buffers.reduce((acc, val) => acc + val.length, 0)
  const zkey = new Uint8Array(totalLength)

  let offset = 0
  for (const array of buffers) {
    zkey.set(array, offset)
    offset += array.length
  }

  return zkey
}

async function fetchKey(keyURL: string, maxRetries = 3): Promise<ZKArtifact> {
  if (isWebUri(keyURL)) {
    let attempts = 0
    while (attempts < maxRetries) {
      try {
        const response = await fetch(keyURL)
        if (!response.ok) {
          throw new Error(
            `Error while fetching ${retrieveFileExtension(
              keyURL
            )} artifacts from prover: ${response.statusText}`
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
  }
  return keyURL
}

interface KeyPathInterface {
  keyURL: string
  artifactsOrigin: ArtifactsOrigin
  getKey: () => Promise<ZKArtifact>
}

export class KeyPath implements KeyPathInterface {
  keyURL: string
  artifactsOrigin: ArtifactsOrigin

  constructor(keyURL: string, ArtifactsOrigin: ArtifactsOrigin) {
    this.keyURL = keyURL
    this.artifactsOrigin = ArtifactsOrigin
  }
  async getKey(): Promise<ZKArtifact> {
    switch (this.artifactsOrigin) {
      case ArtifactsOrigin.local:
        return this.keyURL
      case ArtifactsOrigin.server:
        return await fetchKey(this.keyURL)
      case ArtifactsOrigin.chunked:
        return await loadZkeyChunks(this.keyURL)
    }
  }
}

export interface ProverInferace {
  wasm: KeyPath
  zkey: KeyPath
  proving: (witness: Witness) => Promise<AnonAadhaarProof>
}

export class BackendProver implements ProverInferace {
  wasm: KeyPath
  zkey: KeyPath

  constructor(wasmURL: string, zkey: string) {
    this.wasm = new KeyPath(wasmURL, ArtifactsOrigin.local)
    this.zkey = new KeyPath(zkey, ArtifactsOrigin.local)
  }

  async proving(witness: Witness): Promise<AnonAadhaarProof> {
    if (!witness.qrDataPadded.value) {
      throw new Error('Cannot make proof: missing message')
    }

    if (!witness.qrDataPaddedLength.value) {
      throw new Error('Cannot make proof: missing aadhaarDataLength')
    }

    if (!witness.nonPaddedDataLength.value) {
      throw new Error('Cannot make proof: missing nonPaddedDataLength')
    }

    if (!witness.delimiterIndices.value) {
      throw new Error('Cannot make proof: missing delimiterIndices')
    }

    if (!witness.signature.value) {
      throw new Error('Cannot make proof: missing signature')
    }

    if (!witness.pubKey.value) {
      throw new Error('Cannot make proof: missing pubKey')
    }

    if (!witness.nullifierSeed.value) {
      throw new Error('Cannot make proof: missing nullifierSeed')
    }

    if (!witness.signalHash.value) {
      throw new Error('Cannot make proof: missing signalHash')
    }

    if (!witness.revealAgeAbove18.value) {
      throw new Error('Cannot make proof: missing revealAgeAbove18')
    }

    if (!witness.revealGender.value) {
      throw new Error('Cannot make proof: missing revealGender')
    }

    if (!witness.revealPinCode.value) {
      throw new Error('Cannot make proof: missing revealPinCode')
    }

    if (!witness.revealState.value) {
      throw new Error('Cannot make proof: missing revealState')
    }

    const input = {
      qrDataPadded: witness.qrDataPadded.value,
      qrDataPaddedLength: witness.qrDataPaddedLength.value,
      nonPaddedDataLength: witness.qrDataPaddedLength.value,
      delimiterIndices: witness.delimiterIndices.value,
      signature: witness.signature.value,
      pubKey: witness.pubKey.value,
      nullifierSeed: witness.nullifierSeed.value,
      signalHash: witness.signalHash.value,
      revealAgeAbove18: witness.revealAgeAbove18.value,
      revealGender: witness.revealGender.value,
      revealPinCode: witness.revealPinCode.value,
      revealState: witness.revealState.value,
    }

    const { proof, publicSignals } = await groth16.fullProve(
      input,
      await this.wasm.getKey(),
      await this.zkey.getKey()
    )

    return {
      groth16Proof: proof,
      pubkeyHash: publicSignals[1],
      timestamp: publicSignals[3],
      nullifierSeed: publicSignals[0],
      nullifier: publicSignals[2],
      signalHash: witness.signalHash.value,
      ageAbove18: publicSignals[4],
      gender: publicSignals[5],
      state: publicSignals[6],
      pincode: publicSignals[7],
    }
  }
}

export class WebProver implements ProverInferace {
  wasm: KeyPathInterface
  zkey: KeyPathInterface

  constructor(wasmURL: string, zkey: string) {
    this.wasm = new KeyPath(wasmURL, ArtifactsOrigin.server)
    this.zkey = new KeyPath(zkey, ArtifactsOrigin.server)
  }

  async proving(witness: Witness): Promise<AnonAadhaarProof> {
    const wasmBuffer = (await this.wasm.getKey()) as ArrayBuffer
    const zkeyBuffer = (await this.zkey.getKey()) as ArrayBuffer

    if (!witness.pubKey.value) {
      throw new Error('Cannot make proof: missing pubKey')
    }

    if (!witness.signature.value) {
      throw new Error('Cannot make proof: missing signature')
    }

    if (!witness.aadhaarData.value) {
      throw new Error('Cannot make proof: missing message')
    }

    if (!witness.aadhaarDataLength.value) {
      throw new Error('Cannot make proof: missing aadhaarDataLength')
    }

    if (!witness.signalHash.value) {
      throw new Error('Cannot make proof: missing signalHash')
    }

    const input = {
      aadhaarData: witness.aadhaarData.value,
      aadhaarDataLength: witness.aadhaarDataLength.value,
      signature: witness.signature.value,
      pubKey: witness.pubKey.value,
      signalHash: witness.signalHash.value,
    }

    const { proof, publicSignals } = await groth16.fullProve(
      input,
      new Uint8Array(wasmBuffer),
      new Uint8Array(zkeyBuffer)
    )

    return {
      pubkeyHash: publicSignals[0],
      nullifier: publicSignals[1],
      timestamp: publicSignals[2],
      signalHash: witness.signalHash.value,
      groth16Proof: proof,
    }
  }
}

export class ChunkedProver implements ProverInferace {
  wasm: KeyPathInterface
  zkey: KeyPathInterface

  constructor(wasmURL: string, zkey: string) {
    this.wasm = new KeyPath(wasmURL, ArtifactsOrigin.server)
    this.zkey = new KeyPath(zkey, ArtifactsOrigin.chunked)
  }

  async proving(witness: Witness): Promise<AnonAadhaarProof> {
    const wasmBuffer = await this.wasm.getKey()
    const zkeyBuffer = await this.zkey.getKey()

    if (!witness.pubKey.value) {
      throw new Error('Cannot make proof: missing pubKey')
    }

    if (!witness.signature.value) {
      throw new Error('Cannot make proof: missing signature')
    }

    if (!witness.aadhaarData.value) {
      throw new Error('Cannot make proof: missing message')
    }

    if (!witness.aadhaarDataLength.value) {
      throw new Error('Cannot make proof: missing aadhaarDataLength')
    }

    if (!witness.signalHash.value) {
      throw new Error('Cannot make proof: missing signalHash')
    }

    const input = {
      aadhaarData: witness.aadhaarData.value,
      aadhaarDataLength: witness.aadhaarDataLength.value,
      signature: witness.signature.value,
      pubKey: witness.pubKey.value,
      signalHash: witness.signalHash.value,
    }

    const { proof, publicSignals } = await groth16.fullProve(
      input,
      new Uint8Array(wasmBuffer as ArrayBuffer),
      zkeyBuffer
    )

    return {
      pubkeyHash: publicSignals[0],
      nullifier: publicSignals[1],
      timestamp: publicSignals[2],
      signalHash: witness.signalHash.value,
      groth16Proof: proof,
    }
  }
}
