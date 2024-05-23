import { Inter } from 'next/font/google'
import { LogInWithAnonAadhaar } from '@anon-aadhaar/react'
import { useAFKIentity } from '@/hooks/useAfkIdentity'
import { createIdentity } from '@/identity/identity'
import { useEffect } from 'react'
import { generateAFKProofs } from '@/identity/createAFKProof'

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
        <div className="flex flex-col items-center justify-center gap-8">
          <LogInWithAnonAadhaar
            nullifierSeed={_identity.privateKey}
            fieldsToReveal={[
              'revealAgeAbove18',
              'revealGender',
              'revealPinCode',
              'revealState',
            ]}
          />
        </div>
      )}

      {_identity && (
        <button
          onClick={() =>
            generateAFKProofs(_identity.privateKey, [
              'revealAgeAbove18',
              'revealGender',
              'revealPinCode',
              'revealState',
            ])
          }
        >
          TEST AFK PROVER
        </button>
      )}
    </main>
  )
}
