import Image from "next/image";
import { Inter } from "next/font/google";
import { LogInWithAnonAadhaar } from "@anon-aadhaar/react";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <h1>Welcome to AFK</h1>

      <LogInWithAnonAadhaar nullifierSeed={1234} fieldsToReveal={['revealAgeAbove18', 'revealGender', 'revealPinCode', 'revealState']}/>
    </main>
  );
}
