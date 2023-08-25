import { subtle } from 'crypto'
import { IdentityPCD, BigNumberish } from 'anon-aadhaar-pcd'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { groth16 } from 'snarkjs'

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

export async function exportCallDataGroth16(
  proof: IdentityPCD['proof']['proof'],
  _publicSignals: BigNumberish[],
): Promise<{
  a: [BigNumberish, BigNumberish]
  b: [[BigNumberish, BigNumberish], [BigNumberish, BigNumberish]]
  c: [BigNumberish, BigNumberish]
  Input: BigNumberish[]
}> {
  const calldata = await groth16.exportSolidityCallData(proof, _publicSignals)

  const argv = calldata
    .replace(/["[\]\s]/g, '')
    .split(',')
    .map((x: string) => BigInt(x).toString())

  const a: [BigNumberish, BigNumberish] = [argv[0], argv[1]]
  const b: [[BigNumberish, BigNumberish], [BigNumberish, BigNumberish]] = [
    [argv[2], argv[3]],
    [argv[4], argv[5]],
  ]
  const c: [BigNumberish, BigNumberish] = [argv[6], argv[7]]
  const Input = []

  for (let i = 8; i < argv.length; i++) {
    Input.push(argv[i])
  }
  return { a, b, c, Input }
}
