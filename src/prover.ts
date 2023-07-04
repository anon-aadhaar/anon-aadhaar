/* eslint-disable @typescript-eslint/ban-ts-comment */
import { isWebUri } from 'valid-url'
import { IdentityPCDArgs, IdentityPCDProof } from './types'
import axios from 'axios'
import { splitToWords } from './utils'

// @ts-ignore
import { groth16 } from 'snarkjs'

type Witness = IdentityPCDArgs

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function fetchKey(keyURL: string): Promise<string | ArrayBuffer> {
  if (isWebUri(keyURL)) {
    const keyData = await (await axios.get(keyURL)).data
    const keyBin = Buffer.from(keyData)
    return keyBin
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
  proving: (witness: Witness) => Promise<IdentityPCDProof>
}

export class BackendProver implements ProverInferace {
  wasm: KeyPath
  zkey: KeyPath

  constructor(wasmURL: string, zkey: string) {
    this.wasm = new KeyPath(wasmURL, false)
    this.zkey = new KeyPath(zkey, false)
  }

  async proving(witness: Witness): Promise<IdentityPCDProof> {
    if (!witness.mod.value) {
      throw new Error('Cannot make proof: missing mod')
    }

    if (!witness.exp.value) {
      throw new Error('Cannot make proof: missing exp')
    }

    if (!witness.signature.value) {
      throw new Error('Cannot make proof: missing signature')
    }

    if (!witness.message.value) {
      throw new Error('Cannot make proof: missing message')
    }

    const input = {
      sign: splitToWords(
        BigInt(witness.signature.value),
        BigInt(64),
        BigInt(32)
      ),
      exp: splitToWords(BigInt(65337), BigInt(64), BigInt(32)),
      modulus: splitToWords(BigInt(witness.mod.value), BigInt(64), BigInt(32)),
      hashed: splitToWords(
        BigInt(witness.message.value),
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
      exp: witness.exp.value,
      mod: witness.mod.value,
      proof,
    }
  }
}

export class WebProver implements ProverInferace {
  wasm: KeyPathInterface
  zkey: KeyPathInterface

  constructor(wasmURL: string, zkey: string) {
    this.wasm = new KeyPath(wasmURL, true)
    this.zkey = new KeyPath(zkey, true)
  }

  async proving(witness: Witness): Promise<IdentityPCDProof> {
    const wasmBuffer = (await this.wasm.getKey()) as ArrayBuffer
    const zkeyBuffer = (await this.zkey.getKey()) as ArrayBuffer

    if (!witness.mod.value) {
      throw new Error('Cannot make proof: missing mod')
    }

    if (!witness.exp.value) {
      throw new Error('Cannot make proof: missing exp')
    }

    if (!witness.signature.value) {
      throw new Error('Cannot make proof: missing signature')
    }

    if (!witness.message.value) {
      throw new Error('Cannot make proof: missing message')
    }

    const input = {
      sign: splitToWords(
        BigInt(witness.signature.value),
        BigInt(64),
        BigInt(32)
      ),
      exp: splitToWords(BigInt(65337), BigInt(64), BigInt(32)),
      modulus: splitToWords(BigInt(witness.mod.value), BigInt(64), BigInt(32)),
      hashed: splitToWords(
        BigInt(witness.message.value),
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
      exp: witness.exp.value,
      mod: witness.mod.value,
      proof,
    }
  }
}
