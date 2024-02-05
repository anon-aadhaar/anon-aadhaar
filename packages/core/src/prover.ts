import { isWebUri } from 'valid-url'
import { AnonAadhaarArgs, AnonAadhaarProof, ArtifactsOrigin } from './types'
import { ZKArtifact, groth16 } from 'snarkjs'
import { downloadCompressedZkeys } from './utils'

type Witness = AnonAadhaarArgs

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
        console.log('Zkey URL=> ', this.keyURL)
        return await downloadCompressedZkeys(this.keyURL)
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
    const wasmBuffer = (await this.wasm.getKey()) as ArrayBuffer
    // const zkeyBuffer = await downloadCompressedZkeys(this.zkey.keyURL)
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
      new Uint8Array(wasmBuffer),
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
