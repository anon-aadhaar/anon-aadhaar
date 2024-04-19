/* eslint-disable @typescript-eslint/no-unused-vars */
import forge from 'node-forge'
import fs from 'fs'
import { bigIntToChunkedBytes } from '@zk-email/helpers/dist/binary-format'
import { buildPoseidon } from 'circomlibjs'

// Function to convert a hexadecimal string to BigInt
const hexToBigInt = (hex: string): bigint => BigInt(`0x${hex}`)

function generateKeyPair() {
  // Generate an RSA key pair
  const keys = forge.pki.rsa.generateKeyPair(2048)
  return keys
}

function createSelfSignedCertificate(keys: forge.pki.rsa.KeyPair) {
  const cert = forge.pki.createCertificate()
  cert.publicKey = keys.publicKey
  cert.serialNumber = '01'
  cert.validity.notBefore = new Date()
  cert.validity.notAfter = new Date()
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1) // 1 year validity

  const attrs = [
    {
      name: 'commonName',
      value: 'example.org',
    },
    {
      name: 'countryName',
      value: 'US',
    },
    {
      shortName: 'ST',
      value: 'Virginia',
    },
    {
      name: 'localityName',
      value: 'Blacksburg',
    },
    {
      name: 'organizationName',
      value: 'Test',
    },
    {
      shortName: 'OU',
      value: 'Test',
    },
  ]

  cert.setSubject(attrs)
  cert.setIssuer(attrs) // Self-signed, so issuer is the same

  // Apply extensions
  cert.setExtensions([
    {
      name: 'basicConstraints',
      cA: true,
    },
    {
      name: 'keyUsage',
      keyCertSign: true,
      digitalSignature: true,
      nonRepudiation: true,
      keyEncipherment: true,
      dataEncipherment: true,
    },
    {
      name: 'extKeyUsage',
      serverAuth: true,
      clientAuth: true,
      codeSigning: true,
      emailProtection: true,
      timeStamping: true,
    },
    {
      name: 'nsCertType',
      client: true,
      server: true,
      email: true,
      objsign: true,
      sslCA: true,
      emailCA: true,
      objCA: true,
    },
    {
      name: 'subjectAltName',
      altNames: [
        {
          type: 6, // URI
          value: 'http://example.org/webid#me',
        },
        {
          type: 7, // IP
          ip: '127.0.0.1',
        },
      ],
    },
  ])

  // Self-sign certificate
  cert.sign(keys.privateKey, forge.md.sha256.create())

  return cert
}

function main() {
  // Generate RSA key pair
  const keys = generateKeyPair()

  // Create a self-signed certificate
  const cert = createSelfSignedCertificate(keys)

  // PEM-format keys and certificate
  const pem = {
    privateKey: forge.pki.privateKeyToPem(keys.privateKey),
    publicKey: forge.pki.publicKeyToPem(keys.publicKey),
    certificate: forge.pki.certificateToPem(cert),
  }

  // Save to files
  fs.writeFileSync('../assets/testPrivateKey.pem', pem.privateKey)
  fs.writeFileSync('../assets/testPublicKey.pem', pem.publicKey)
  fs.writeFileSync('../assets/testCertificate.pem', pem.certificate)

  console.log('Generated and saved a pair of RSA signing keys.')
}

// This function is useful when calculating the hash is needed
// to update the AnonAadhaar.sol verifier stored publicKeyHash
async function publicKeyHashFromPem() {
  const publicKeyPem = fs.readFileSync('../assets/testPublicKey.pem', 'utf8')

  // Convert the PEM file to a forge public key object
  const forgePublicKey = forge.pki.publicKeyFromPem(publicKeyPem)

  // Assuming the key is an RSA key, extract the modulus (n) and exponent (e)
  const { n } = forgePublicKey as forge.pki.rsa.PublicKey

  // Convert the modulus (public key) to BigInt
  const modulusBigInt = hexToBigInt(n.toString(16))

  // Calculate the Poseidon hash with pubkey chunked to 9*242 like in circuit
  const poseidon = await buildPoseidon()
  const pubkeyChunked = bigIntToChunkedBytes(modulusBigInt, 242, 9)
  const hash = poseidon(pubkeyChunked)
  console.log(BigInt(poseidon.F.toObject(hash)).toString())
}

main()
// publicKeyHashFromPem()
