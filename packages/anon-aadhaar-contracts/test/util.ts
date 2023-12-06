import { ZKArtifact } from 'snarkjs'
import axios from 'axios'

export async function fetchKey(keyURL: string): Promise<ZKArtifact> {
  const keyData = await (
    await axios.get(keyURL, {
      responseType: 'arraybuffer',
    })
  ).data
  return keyData
}
