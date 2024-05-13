import { Inter } from 'next/font/google'
import { LogInWithAnonAadhaar } from '@anon-aadhaar/react'
// import { useEffect } from 'react'
import { useAFKIentity } from '@/hooks/useAfkIdentity'
import { createIdentity } from '@/identity/identity'
import { generateAFKProofs } from '@/identity/createAFKProof'
import { useEffect } from 'react'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const { _identity } = useAFKIentity()

  useEffect(() => {
    if (_identity) console.log('coucou: ', _identity.privateKey)
  }, [_identity])

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <h1>Welcome to AFK</h1>

      {_identity === null ? (
        <button
          onClick={async () => {
            await createIdentity()
          }}
        >
          Sign Up
        </button>
      ) : (
        <LogInWithAnonAadhaar
          nullifierSeed={_identity.privateKey}
          fieldsToReveal={[
            'revealAgeAbove18',
            'revealGender',
            'revealPinCode',
            'revealState',
          ]}
        />
      )}

      {_identity && (
        <button onClick={() => generateAFKProofs(_identity.privateKey)}>
          TEST AFK PROVER
        </button>
      )}
    </main>
  )
}
