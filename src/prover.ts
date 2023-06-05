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
    const input = {
      sign: splitToWords(witness.signature as bigint, 64n, 32n),
      exp: splitToWords(BigInt(65337), 64n, 32n),
      modulus: splitToWords(BigInt(witness.mod), 64n, 32n),
      hashed: splitToWords(witness.message as bigint, 64n, 3n),
    }

    const { proof } = await groth16.fullProve(
      input,
      await this.wasm.getKey(),
      await this.zkey.getKey()
    )

    return {
      exp: witness.exp,
      mod: witness.mod,
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

    const input = {
      sign: splitToWords(witness.signature as bigint, 64n, 32n),
      exp: splitToWords(BigInt(65337), 64n, 32n),
      modulus: splitToWords(BigInt(witness.mod), 64n, 32n),
      hashed: splitToWords(witness.message as bigint, 64n, 3n),
    }

    const { proof } = await groth16.fullProve(
      input,
      new Uint8Array(wasmBuffer),
      new Uint8Array(zkeyBuffer)
    )
    return {
      exp: witness.exp,
      mod: witness.mod,
      proof,
    }
  }
}
