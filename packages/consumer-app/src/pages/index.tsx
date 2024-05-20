import { bigIntsToString, verifyProof } from '@/util'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

const LoggedOut = () => {
  return (
    <span className="inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium text-gray-900 ring-1 ring-inset ring-gray-200">
      <svg
        className="h-1.5 w-1.5 fill-red-500"
        viewBox="0 0 6 6"
        aria-hidden="true"
      >
        <circle cx={3} cy={3} r={3} />
      </svg>
      Logged-out
    </span>
  )
}

const LoggedIn = () => {
  return (
    <span className="inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium text-gray-900 ring-1 ring-inset ring-gray-200">
      <svg
        className="h-1.5 w-1.5 fill-green-500"
        viewBox="0 0 6 6"
        aria-hidden="true"
      >
        <circle cx={3} cy={3} r={3} />
      </svg>
      Logged-in
    </span>
  )
}

const Badge = ({ label }: { label: string }) => {
  return (
    <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
      {label}
    </span>
  )
}

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const { payload } = router.query

  const loginRequest = () => {
    const encodedUri = encodeURIComponent(
      JSON.stringify({
        bio: 'India',
        fieldsToReveal: ['revealAgeAbove18', 'revealPinCode'],
        returnUrl: 'http://localhost:3001',
      }),
    )

    window.location.href = `http://localhost:3000/requests/${encodedUri}`
  }

  useEffect(() => {
    if (payload) {
      const result = JSON.parse(decodeURIComponent(payload as string))
      // Further processing of proof
      const proof = result.proof

      console.log(bigIntsToString([BigInt(proof.claimValues_1)]))
      console.log(bigIntsToString([BigInt(proof.claimValues_2)]))
      console.log(bigIntsToString([BigInt(proof.claimValues_3)]))
      console.log(bigIntsToString([BigInt(proof.claimValues_4)]))
      console.log(bigIntsToString([BigInt(proof.claimValues_5)]))

      verifyProof(proof)
        .then(r => {
          if (r) setUser(proof)
        })
        .catch(e => console.log(e))
    }
  }, [payload])

  return (
    <main className="flex flex-col min-h-[75vh] mx-auto justify-center items-center w-full p-4">
      <div className="max-w-xl w-full">
        <h6 className="text-[36px] font-rajdhani font-medium leading-none">
          THE WATHEVER APP
        </h6>
        <div className="text-md mt-4 mb-8 text-[#717686]">
          This app is emulating whatever application that wants to consume the
          AFK login flow.
        </div>

        {user ? (
          <div className="flex flex-col gap-4">
            <div>Hello Anon</div>
            <div>You are now logged-in</div>
            <div>
              <LoggedIn />
            </div>
            <div className="flex gap-2">
              <Badge label="> 18" />
              <Badge label="110051" />
            </div>
          </div>
        ) : (
          <>
            <div className="text-md text-[#717686]">Your status:</div>
            <LoggedOut />
            <div className="text-md mt-4 mb-4 text-[#717686]">
              Try to login ⬇️
            </div>
            <button
              type="button"
              className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              onClick={loginRequest}
            >
              LOGIN
            </button>
          </>
        )}
      </div>
    </main>
  )
}
