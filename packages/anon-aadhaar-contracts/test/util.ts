import axios from 'axios'
import { ZKArtifact } from 'snarkjs'

export async function fetchKey(keyURL: string): Promise<ZKArtifact> {
  const keyData = await (
    await axios.get(keyURL, {
      responseType: 'arraybuffer',
    })
  ).data
  return keyData
}
