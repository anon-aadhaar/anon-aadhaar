enum BaseUrlArtifacts {
  Test = 'https://d1l6t78iyuhldt.cloudfront.net',
  Prod = 'https://d1re67zv2jtrxt.cloudfront.net',
  Staging = 'https://dhzposh38rt8g.cloudfront.net',
}

enum Artifacts {
  WASM_URL = '/aadhaar-verifier.wasm',
  ZKEY_URL = '/circuit_final.zkey',
  VK_URL = '/vkey.json',
}

export const artifactUrls = {
  test: {
    wasm: BaseUrlArtifacts.Test + Artifacts.WASM_URL,
    zkey: BaseUrlArtifacts.Test + Artifacts.ZKEY_URL,
    vk: BaseUrlArtifacts.Test + Artifacts.VK_URL,
  },
  prod: {
    wasm: BaseUrlArtifacts.Prod + Artifacts.WASM_URL,
    zkey: BaseUrlArtifacts.Prod + Artifacts.ZKEY_URL,
    vk: BaseUrlArtifacts.Prod + Artifacts.VK_URL,
  },
  chunked: {
    wasm: BaseUrlArtifacts.Test + Artifacts.WASM_URL,
    zkey: BaseUrlArtifacts.Staging,
    vk: BaseUrlArtifacts.Test + Artifacts.VK_URL,
  },
}
