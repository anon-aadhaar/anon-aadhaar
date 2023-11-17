import { groth16 } from 'snarkjs'
import { verify, AnonAadhaarPCD } from './pcd'
import { handleError } from './utils'

export async function nullifyProof(
  _proof: AnonAadhaarPCD,
  secretKey: string,
  _pdfData: Buffer
) {
  let isProofValid: boolean
  try {
    isProofValid = await verify(_proof)
  } catch (error) {
    return handleError(error, '[Unable to to verify the Aadhaar proof]')
  }

  if (!isProofValid) throw new Error('The proof is not valid')

  const input = {
    base_message: _pdfData.toString('hex'),
    secret_key: secretKey,
  }

  const dirName = __dirname + '/../artifacts/Nullifier'

  const { proof, publicSignals } = await groth16.fullProve(
    input,
    dirName + '/nullifier.wasm',
    dirName + '/circuit_final.zkey'
  )

  try {
    await groth16.verify(
      dirName + '/verification_key.json',
      publicSignals,
      proof
    )
  } catch (error) {
    return handleError(error, '[Unable to to verify the nullifier proof]')
  }

  return { proof, publicSignals }
}
