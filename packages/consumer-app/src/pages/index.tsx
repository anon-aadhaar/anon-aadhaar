import { verifyProof } from '@/util'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const { payload } = router.query

  const loginRequest = () => {
    const encodedUri = encodeURIComponent(
      JSON.stringify({
        bio: 'India',
        fieldsToReveal: ['ageAbove18', 'gender'],
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

      verifyProof(proof)
        .then(r => {
          if (r) setUser(proof)
        })
        .catch(e => console.log(e))
    }
  }, [payload])

  return (
    <main className="flex flex-col min-h-[75vh] mx-auto justify-center items-center w-full p-4">
      <div className="max-w-4xl w-full">
        <h6 className="text-[36px] font-rajdhani font-medium leading-none">
          THE WATHEVER APP
        </h6>
        <div className="text-md mt-4 mb-8 text-[#717686]">
          This app is emulating whatever application that wants to consumer AFK
          login flow.
        </div>

        {user ? (
          <>
            <div>Hello Anon</div>
            <div>You are now logged-in</div>
          </>
        ) : (
          <>
            <div className="text-md mt-4 mb-8 text-[#717686]">
              Try to login ⬇️
            </div>
            <button onClick={loginRequest}>LOGIN</button>
          </>
        )}
      </div>
    </main>
  )
}
