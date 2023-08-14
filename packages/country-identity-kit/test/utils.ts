import { subtle } from 'crypto'
import {
  CountryIdentityState,
  CountryIdentityRequest,
} from '../src/hooks/useCountryIdentity'

function buffToBigInt(buff: string): bigint {
  return BigInt('0x' + Buffer.from(buff, 'base64url').toString('hex'))
}

async function generateRsaKey(hash = 'SHA-256') {
  const publicExponent = new Uint8Array([1, 0, 1])
  const modulusLength = 2048
  const { publicKey, privateKey } = await subtle.generateKey(
    {
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength,
      publicExponent,
      hash,
    },
    true,
    ['sign', 'verify'],
  )

  return { publicKey, privateKey }
}

export async function genData(
  data: string,
  HASH_ALGO: string,
): Promise<[bigint, bigint, bigint, bigint]> {
  const keys = await generateRsaKey(HASH_ALGO)

  const public_key = await subtle.exportKey('jwk', keys.publicKey)

  const enc = new TextEncoder()
  const text = enc.encode(data)
  const hash = BigInt(
    '0x' + Buffer.from(await subtle.digest(HASH_ALGO, text)).toString('hex'),
  )

  const sign_buff = await subtle.sign(
    { name: 'RSASSA-PKCS1-v1_5', hash: HASH_ALGO },
    keys.privateKey,
    text,
  )

  const e = buffToBigInt(public_key.e as string)
  const n = buffToBigInt(public_key.n as string)
  const sign = BigInt('0x' + Buffer.from(sign_buff).toString('hex'))

  return [e, sign, n, hash]
}

// Serialize the context value to a JSON string
export function serializeContextValue(contextValue: {
  state: CountryIdentityState
  startReq: (request: CountryIdentityRequest) => void
}): string {
  return JSON.stringify(contextValue)
}

// Deserialize the JSON string to the context value object
export function deserializeContextValue(serializedContextValue: string): {
  state: CountryIdentityState
  startReq: (request: CountryIdentityRequest) => void
} {
  return JSON.parse(serializedContextValue)
}
