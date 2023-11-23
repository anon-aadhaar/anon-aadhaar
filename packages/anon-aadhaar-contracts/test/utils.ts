import { BigNumberish } from 'anon-aadhaar-pcd'
import { groth16 } from 'snarkjs'

/**
 * Turn a groth16 proof into a call data format to use it as a transaction input.
 * @param input Inputs needed to generate the witness.
 * @param wasmPath Path to the wasm file.
 * @param zkeyPath Path to the zkey file.
 * @returns {a, b, c, Input} which are the input needed to verify a proof in the Verifier smart contract.
 */
export async function exportCallDataGroth16(
  input: {
    signature: string[]
    modulus: string[]
    base_message: string[]
    app_id: string
  },
  wasmPath: string,
  zkeyPath: string,
): Promise<{
  a: [BigNumberish, BigNumberish]
  b: [[BigNumberish, BigNumberish], [BigNumberish, BigNumberish]]
  c: [BigNumberish, BigNumberish]
  Input: BigNumberish[]
}> {
  const { proof: _proof, publicSignals: _publicSignals } =
    await groth16.fullProve(input, wasmPath, zkeyPath)
  const calldata = await groth16.exportSolidityCallData(_proof, _publicSignals)

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
