/* eslint-disable @typescript-eslint/ban-ts-comment */
import { isWebUri } from 'valid-url'
import { AnonAadhaarPCDArgs, AnonAadhaarPCDProof } from './types'
import axios from 'axios'
import { splitToWords } from './utils'

// @ts-ignore
import { groth16 } from 'snarkjs'

type Witness = AnonAadhaarPCDArgs

async function fetchKey(keyURL: string): Promise<string | ArrayBuffer> {
  if (isWebUri(keyURL)) {
    const keyData = await (
      await axios.get(keyURL, {
        responseType: 'arraybuffer',
      })
    ).data
    return keyData
  }
  return keyURL
}

interface KeyPathInterface {
  keyURL: string
  isLocation: boolean
  getKey: () => Promise<ArrayBuffer | string>
}

export class KeyPath implements KeyPathInterface {
  keyURL: string
  isLocation: boolean

  constructor(keyURL: string, isLocation: boolean) {
    this.keyURL = keyURL
    this.isLocation = isLocation
  }
  async getKey(): Promise<ArrayBuffer | string> {
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

    if (!witness.base_message.value) {
      throw new Error('Cannot make proof: missing message')
    }

    const input = {
      signature: splitToWords(
        BigInt(witness.signature.value),
        BigInt(64),
        BigInt(32)
      ),
      modulus: splitToWords(
        BigInt(witness.modulus.value),
        BigInt(64),
        BigInt(32)
      ),
      base_message: splitToWords(
        BigInt(witness.base_message.value),
        BigInt(64),
        BigInt(32)
      ),
    }

    const { proof } = await groth16.fullProve(
      input,
      await this.wasm.getKey(),
      await this.zkey.getKey()
    )

    return {
      modulus: witness.modulus.value,
      proof,
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
      throw new Error('Cannot make proof: missing mod')
    }

    if (!witness.signature.value) {
      throw new Error('Cannot make proof: missing signature')
    }

    if (!witness.base_message.value) {
      throw new Error('Cannot make proof: missing message')
    }

    const input = {
      signature: splitToWords(
        BigInt(witness.signature.value),
        BigInt(64),
        BigInt(32)
      ),
      modulus: splitToWords(
        BigInt(witness.modulus.value),
        BigInt(64),
        BigInt(32)
      ),
      base_message: splitToWords(
        BigInt(witness.base_message.value),
        BigInt(64),
        BigInt(32)
      ),
    }

    const { proof } = await groth16.fullProve(
      input,
      new Uint8Array(wasmBuffer),
      new Uint8Array(zkeyBuffer)
    )
    return {
      modulus: witness.modulus.value,
      proof,
    }
  }
}
