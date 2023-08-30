import { SerializedPCD } from '@pcd/pcd-types'
import {
  prove,
  PCDInitArgs,
  init,
  AnonAadhaarPCDArgs,
  serialize,
  AnonAadhaarPCD,
  VK_URL,
  ZKEY_URL,
  WASM_URL,
} from 'anon-aadhaar-pcd'

/**
 * proveWithWebProver is a function that generates proofs using the web-based proving system of anon-aadhaar.
 * It takes an IdentityPCDArgs argument and returns a Promise containing the generated IdentityPCD and its
 * serialized form (SerializedPCD).
 *
 * @param pcdArgs - The arguments required to generate the IdentityPCD.
 * @returns A Promise containing the generated IdentityPCD and its serialized form.
 *
 * @see {@link https://github.com/privacy-scaling-explorations/anon-aadhaar}
 *   For more information about the underlying circuit and proving system.
 */
export const proveWithWebProver = async (
  pcdArgs: AnonAadhaarPCDArgs,
): Promise<{
  pcd: AnonAadhaarPCD
  serialized: SerializedPCD<AnonAadhaarPCD>
}> => {
  const pcdInitArgs: PCDInitArgs = {
    wasmURL: WASM_URL,
    zkeyURL: ZKEY_URL,
    vkeyURL: VK_URL,
    isWebEnv: true,
  }

  await init(pcdInitArgs)

  const pcd = await prove(pcdArgs)
  const serialized = await serialize(pcd)

  return { pcd, serialized }
}
