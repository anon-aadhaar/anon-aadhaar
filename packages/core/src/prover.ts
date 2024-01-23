import { isWebUri } from 'valid-url'
import { AnonAadhaarPCDArgs, AnonAadhaarPCDProof } from './types'
import { ZKArtifact, groth16 } from 'snarkjs'

type Witness = AnonAadhaarPCDArgs

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
  isLocation: boolean
  getKey: () => Promise<ZKArtifact>
}

export class KeyPath implements KeyPathInterface {
  keyURL: string
  isLocation: boolean

  constructor(keyURL: string, isLocation: boolean) {
    this.keyURL = keyURL
    this.isLocation = isLocation
  }
  async getKey(): Promise<ZKArtifact> {
    if (this.isLocation) return this.keyURL
    return await fetchKey(this.keyURL)
  }
}

export interface ProverInferace {
  wasm: KeyPath
  zkey: KeyPath
  proving: (witness: Witness) => Promise<AnonAadhaarPCDProof>
}

export class BackendProver implements ProverInferace {
  wasm: KeyPath
  zkey: KeyPath

  constructor(wasmURL: string, zkey: string) {
    this.wasm = new KeyPath(wasmURL, false)
    this.zkey = new KeyPath(zkey, false)
  }

  async proving(witness: Witness): Promise<AnonAadhaarPCDProof> {
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
      groth16Proof: proof,
      signalHash: witness.signalHash.value,
    }
  }
}

export class WebProver implements ProverInferace {
  wasm: KeyPathInterface
  zkey: KeyPathInterface

  constructor(wasmURL: string, zkey: string) {
    this.wasm = new KeyPath(wasmURL, false)
    this.zkey = new KeyPath(zkey, false)
  }

  async proving(witness: Witness): Promise<AnonAadhaarPCDProof> {
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
      groth16Proof: proof,
      signalHash: witness.signalHash.value,
    }
  }
}
