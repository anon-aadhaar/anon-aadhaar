import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function Home() {
  const router = useRouter()
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
      const proof = JSON.parse(decodeURIComponent(payload))
      console.log(proof)
      // Further processing of proof
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

        <div className="text-md mt-4 mb-8 text-[#717686]">Try to login ⬇️</div>
        <button onClick={loginRequest}>LOGIN</button>
      </div>
    </main>
  )
}
