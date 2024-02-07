import { isWebUri } from 'valid-url'
import { AnonAadhaarArgs, AnonAadhaarProof, ArtifactsOrigin } from './types'
import { ZKArtifact, groth16 } from 'snarkjs'
import { storageService as defaultStorageService } from './storage'
import { artifactUrls } from './constants'
import { handleError, searchZkeyChunks } from './utils'

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

async function fetchKey(keyURL: string): Promise<ZKArtifact> {
  if (isWebUri(keyURL)) {
    try {
      const response = await fetch(keyURL)
      if (response.ok) {
        const data = await response.arrayBuffer()
        return data as Buffer
      } else {
        throw new Error(`Failed to fetch: ${response.statusText}`)
      }
    } catch (error) {
      // Handle any errors from the fetch request
      console.error('Error fetching key:', error)
      throw error
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
      await this.wasm.getKey(),
      await this.zkey.getKey()
    )

    return {
      identityNullifier: publicSignals[0],
      userNullifier: publicSignals[1],
      timestamp: publicSignals[2],
      pubkeyHash: publicSignals[3],
      signalHash: witness.signalHash.value,
      groth16Proof: proof,
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
      identityNullifier: publicSignals[0],
      userNullifier: publicSignals[1],
      timestamp: publicSignals[2],
      pubkeyHash: publicSignals[3],
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
      identityNullifier: publicSignals[0],
      userNullifier: publicSignals[1],
      timestamp: publicSignals[2],
      pubkeyHash: publicSignals[3],
      signalHash: witness.signalHash.value,
      groth16Proof: proof,
    }
  }
}
