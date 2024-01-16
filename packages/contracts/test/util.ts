import { ZKArtifact } from 'snarkjs'

export async function fetchKey(keyURL: string): Promise<ZKArtifact> {
  const keyData = await fetch(keyURL)

  if (!keyData) throw Error('Error while fetching the key')

  return new Uint8Array(await keyData.arrayBuffer())
}
