import { SerializedPCD } from '@pcd/pcd-types'
import {
  prove,
  PCDInitArgs,
  init,
  IdentityPCDArgs,
  serialize,
  IdentityPCD,
} from 'anon-aadhaar-pcd'
import { VK_URL, ZKEY_URL, WASM_URL } from '../../common/constants'

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
  pcdArgs: IdentityPCDArgs,
): Promise<{ pcd: IdentityPCD; serialized: SerializedPCD<IdentityPCD> }> => {
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
