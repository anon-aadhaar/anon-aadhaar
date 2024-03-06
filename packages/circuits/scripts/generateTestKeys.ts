import forge from 'node-forge'
import fs from 'fs'

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
