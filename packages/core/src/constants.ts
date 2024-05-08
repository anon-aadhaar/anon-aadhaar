enum BaseUrlArtifacts {
  Prod = 'https://d1re67zv2jtrxt.cloudfront.net/',
  // Test = 'https://d1l6t78iyuhldt.cloudfront.net/v1.0.0',
  Staging = 'https://anon-aadhaar-staging.s3.eu-west-3.amazonaws.com/',
}

enum Version {
  V1 = 'v1.0.0',
  V2 = 'v2.0.0',
  Lite = 'Lite',
}

enum Artifacts {
  WASM_URL = '/aadhaar-verifier.wasm',
  ZKEY_URL = '/circuit_final.zkey',
  VK_URL = '/vkey.json',
  ZKEY_CHUNKS = '/chunked_zkey',
  WASM_URL_LITE = '/aadhaar-verifier.afk.wasm',
  ZKEY_URL_LITE = '/aadhaar-verifier.afk.zkey',
  VK_URL_LITE = '/aadhaar-verifier.afk.vkey.json',
}

export const artifactUrls = {
  V1: {
    wasm: BaseUrlArtifacts.Prod + Version.V1 + Artifacts.WASM_URL,
    zkey: BaseUrlArtifacts.Prod + Version.V1 + Artifacts.ZKEY_URL,
    vk: BaseUrlArtifacts.Prod + Version.V1 + Artifacts.VK_URL,
    chunked: BaseUrlArtifacts.Prod + Version.V1 + Artifacts.ZKEY_CHUNKS,
  },
  v2: {
    wasm: BaseUrlArtifacts.Prod + Version.V2 + Artifacts.WASM_URL,
    zkey: BaseUrlArtifacts.Prod + Version.V2 + Artifacts.ZKEY_URL,
    vk: BaseUrlArtifacts.Prod + Version.V2 + Artifacts.VK_URL,
    chunked: BaseUrlArtifacts.Prod + Version.V2 + Artifacts.ZKEY_CHUNKS,
  },
  Lite: {
    wasm: BaseUrlArtifacts.Staging + Version.Lite + Artifacts.WASM_URL_LITE,
    zkey: BaseUrlArtifacts.Staging + Version.Lite + Artifacts.ZKEY_URL_LITE,
    vk: BaseUrlArtifacts.Staging + Version.Lite + Artifacts.VK_URL_LITE,
    chunked: BaseUrlArtifacts.Staging + Version.Lite + Artifacts.ZKEY_CHUNKS,
  },
  // test: {
  //   wasm: BaseUrlArtifacts.Test + Artifacts.WASM_URL,
  //   zkey: BaseUrlArtifacts.Test + Artifacts.ZKEY_URL,
  //   vk: BaseUrlArtifacts.Test + Artifacts.VK_URL,
  //   chunked: BaseUrlArtifacts.Test + Artifacts.ZKEY_CHUNKS,
  // },
  // staging: {
  //   wasm: BaseUrlArtifacts.Test + Artifacts.WASM_URL,
  //   zkey: BaseUrlArtifacts.Staging + Artifacts.ZKEY_CHUNKS,
  //   vk: BaseUrlArtifacts.Test + Artifacts.VK_URL,
  // },
}

export const testCertificateUrl =
  'https://anon-aadhaar.s3.ap-south-1.amazonaws.com/testCertificate.pem'
