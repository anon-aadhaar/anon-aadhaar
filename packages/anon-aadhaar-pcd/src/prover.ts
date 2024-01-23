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
    if (!witness.modulus.value) {
      throw new Error('Cannot make proof: missing modulus')
    }

    if (!witness.signature.value) {
      throw new Error('Cannot make proof: missing signature')
    }

    if (!witness.padded_message.value) {
      throw new Error('Cannot make proof: missing message')
    }

    if (!witness.message_len.value) {
      throw new Error('Cannot make proof: missing message length')
    }

    const input = {
      padded_message: witness.padded_message.value,
      message_len: witness.message_len.value,
      signature: witness.signature.value,
      modulus: witness.modulus.value,
    }

    const { proof } = await groth16.fullProve(
      input,
      await this.wasm.getKey(),
      await this.zkey.getKey()
    )

    return {
      modulus: witness.modulus.value,
      groth16Proof: proof,
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

    if (!witness.modulus.value) {
      throw new Error('Cannot make proof: missing modulus')
    }

    if (!witness.signature.value) {
      throw new Error('Cannot make proof: missing signature')
    }

    if (!witness.padded_message.value) {
      throw new Error('Cannot make proof: missing message')
    }

    if (!witness.message_len.value) {
      throw new Error('Cannot make proof: missing message len')
    }

    const input = {
      padded_message: witness.padded_message.value,
      message_len: witness.message_len.value,
      signature: witness.signature.value,
      modulus: witness.modulus.value,
    }

    const { proof } = await groth16.fullProve(
      input,
      new Uint8Array(wasmBuffer),
      new Uint8Array(zkeyBuffer)
    )

    return {
      modulus: witness.modulus.value,
      groth16Proof: proof,
    }
  }
}
