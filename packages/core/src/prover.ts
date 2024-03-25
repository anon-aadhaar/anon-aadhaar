/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { isWebUri } from 'valid-url'
import { AnonAadhaarArgs, AnonAadhaarProof, ArtifactsOrigin } from './types'
import { ZKArtifact, groth16 } from 'snarkjs'
import { storageService as defaultStorageService } from './storage'
import { handleError, retrieveFileExtension, searchZkeyChunks } from './utils'

type Witness = AnonAadhaarArgs

// Search for the chunks in localforage and recompose the zkey from it.
export const loadZkeyChunks = async (
  zkeyUrl: string,
  storageService = defaultStorageService
): Promise<Uint8Array> => {
  try {
    await searchZkeyChunks(zkeyUrl, storageService)
  } catch (e) {
    handleError(e, 'Error while searching for the zkey chunks')
  }

  const buffers: Uint8Array[] = []
  try {
    // Fetch zkey chunks from localForage
    for (let i = 0; i < 10; i++) {
      const fileName = `circuit_final_${i}.zkey`
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
    const input = {
      qrDataPadded: witness.qrDataPadded.value!,
      qrDataPaddedLength: witness.qrDataPaddedLength.value!,
      nonPaddedDataLength: witness.qrDataPaddedLength.value!,
      delimiterIndices: witness.delimiterIndices.value!,
      signature: witness.signature.value!,
      pubKey: witness.pubKey.value!,
      nullifierSeed: witness.nullifierSeed.value!,
      signalHash: witness.signalHash.value!,
      revealAgeAbove18: witness.revealAgeAbove18.value!,
      revealGender: witness.revealGender.value!,
      revealPinCode: witness.revealPinCode.value!,
      revealState: witness.revealState.value!,
    }

    const { proof, publicSignals } = await groth16.fullProve(
      input,
      await this.wasm.getKey(),
      await this.zkey.getKey()
    )

    return {
      groth16Proof: proof,
      pubkeyHash: publicSignals[0],
      timestamp: publicSignals[2],
      nullifierSeed: witness.nullifierSeed.value!,
      nullifier: publicSignals[1],
      signalHash: witness.signalHash.value!,
      ageAbove18: publicSignals[3],
      gender: publicSignals[4],
      state: publicSignals[5],
      pincode: publicSignals[6],
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

    const input = {
      qrDataPadded: witness.qrDataPadded.value!,
      qrDataPaddedLength: witness.qrDataPaddedLength.value!,
      nonPaddedDataLength: witness.qrDataPaddedLength.value!,
      delimiterIndices: witness.delimiterIndices.value!,
      signature: witness.signature.value!,
      pubKey: witness.pubKey.value!,
      nullifierSeed: witness.nullifierSeed.value!,
      signalHash: witness.signalHash.value!,
      revealAgeAbove18: witness.revealAgeAbove18.value!,
      revealGender: witness.revealGender.value!,
      revealPinCode: witness.revealPinCode.value!,
      revealState: witness.revealState.value!,
    }

    const { proof, publicSignals } = await groth16.fullProve(
      input,
      new Uint8Array(wasmBuffer),
      new Uint8Array(zkeyBuffer)
    )

    return {
      groth16Proof: proof,
      pubkeyHash: publicSignals[0],
      timestamp: publicSignals[2],
      nullifierSeed: witness.nullifierSeed.value!,
      nullifier: publicSignals[1],
      signalHash: witness.signalHash.value!,
      ageAbove18: publicSignals[3],
      gender: publicSignals[4],
      state: publicSignals[5],
      pincode: publicSignals[6],
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

    const input = {
      qrDataPadded: witness.qrDataPadded.value!,
      qrDataPaddedLength: witness.qrDataPaddedLength.value!,
      nonPaddedDataLength: witness.qrDataPaddedLength.value!,
      delimiterIndices: witness.delimiterIndices.value!,
      signature: witness.signature.value!,
      pubKey: witness.pubKey.value!,
      nullifierSeed: witness.nullifierSeed.value!,
      signalHash: witness.signalHash.value!,
      revealAgeAbove18: witness.revealAgeAbove18.value!,
      revealGender: witness.revealGender.value!,
      revealPinCode: witness.revealPinCode.value!,
      revealState: witness.revealState.value!,
    }

    const { proof, publicSignals } = await groth16.fullProve(
      input,
      new Uint8Array(wasmBuffer as ArrayBuffer),
      zkeyBuffer
    )

    return {
      groth16Proof: proof,
      pubkeyHash: publicSignals[0],
      timestamp: publicSignals[2],
      nullifierSeed: witness.nullifierSeed.value!,
      nullifier: publicSignals[1],
      signalHash: witness.signalHash.value!,
      ageAbove18: publicSignals[3],
      gender: publicSignals[4],
      state: publicSignals[5],
      pincode: publicSignals[6],
    }
  }
}
