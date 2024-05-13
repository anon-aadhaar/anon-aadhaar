/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  AnonAadhaarArgs,
  AnonAadhaarProof,
  ArtifactsOrigin,
  ProverState,
} from './types'
import { Groth16Proof, PublicSignals, ZKArtifact, groth16 } from 'snarkjs'
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
  proving: (
    witness: Witness,
    updateState?: (state: ProverState) => void
  ) => Promise<AnonAadhaarProof>
}

export class AnonAadhaarProver implements ProverInferace {
  wasm: KeyPath
  zkey: KeyPath
  proverType: ArtifactsOrigin

  constructor(wasmURL: string, zkey: string, proverType: ArtifactsOrigin) {
    this.wasm = new KeyPath(
      wasmURL,
      proverType === ArtifactsOrigin.chunked
        ? ArtifactsOrigin.server
        : proverType
    )
    this.zkey = new KeyPath(zkey, proverType)
    this.proverType = proverType
  }

  async proving(
    witness: Witness,
    updateState?: (state: ProverState) => void
  ): Promise<AnonAadhaarProof> {
    let wasmBuffer: ZKArtifact
    let zkeyBuffer: ZKArtifact
    switch (this.proverType) {
      case ArtifactsOrigin.local:
        if (updateState) updateState(ProverState.FetchingWasm)
        wasmBuffer = await this.wasm.getKey()
        if (updateState) updateState(ProverState.FetchingZkey)
        zkeyBuffer = await this.zkey.getKey()
        break
      case ArtifactsOrigin.server:
        if (updateState) updateState(ProverState.FetchingWasm)
        wasmBuffer = new Uint8Array((await this.wasm.getKey()) as ArrayBuffer)
        if (updateState) updateState(ProverState.FetchingZkey)
        zkeyBuffer = new Uint8Array((await this.zkey.getKey()) as ArrayBuffer)
        break
      case ArtifactsOrigin.chunked:
        if (updateState) updateState(ProverState.FetchingWasm)
        wasmBuffer = new Uint8Array((await this.wasm.getKey()) as ArrayBuffer)
        if (updateState) updateState(ProverState.FetchingZkey)
        zkeyBuffer = await this.zkey.getKey()
        break
    }
    const input = {
      qrDataPadded: witness.qrDataPadded.value!,
      qrDataPaddedLength: witness.qrDataPaddedLength.value!,
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

    if (updateState) updateState(ProverState.Proving)
    let result: {
      proof: Groth16Proof
      publicSignals: PublicSignals
    }
    try {
      result = await groth16.fullProve(input, wasmBuffer, zkeyBuffer)
    } catch (e) {
      console.error(e)
      if (updateState) updateState(ProverState.Error)
      throw new Error('[AnonAAdhaarProver]: Error while generating the proof')
    }

    const proof = result.proof
    const publicSignals = result.publicSignals

    if (updateState) updateState(ProverState.Completed)
    return {
      groth16Proof: proof,
      pubkeyHash: publicSignals[0],
      timestamp: publicSignals[2],
      nullifierSeed: witness.nullifierSeed.value!,
      nullifier: publicSignals[1],
      signalHash: witness.signalHash.value!,
      ageAbove18: publicSignals[3],
      gender: publicSignals[4],
      pincode: publicSignals[5],
      state: publicSignals[6],
    }
  }
}
