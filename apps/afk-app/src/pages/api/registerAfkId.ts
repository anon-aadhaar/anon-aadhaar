import type { NextApiRequest, NextApiResponse } from 'next'
import { ethers } from 'ethers'
import path from 'path'
import fs from 'fs/promises'

type Proof = {
  // Define the structure of your proof object
  proof: string
  // Add other fields as necessary
}

type Data = {
  message: string
}

async function getContractAbi() {
  const abiPath = path.join(process.cwd(), 'public', 'contractAbi.json')
  const abiFile = await fs.readFile(abiPath, 'utf-8')
  return JSON.parse(abiFile)
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  if (req.method === 'POST') {
    const { proof }: Proof = req.body

    if (!proof) {
      res.status(400).json({ message: 'Proof is required' })
      return
    }

    try {
      // Load the private key from the environment variable
      const privateKey = process.env.PRIVATE_KEY
      if (!privateKey) {
        throw new Error('Private key not found in environment variables')
      }

      // Set up a provider
      const provider = new ethers.InfuraProvider(
        'sepolia',
        process.env.INFURA_PROJECT_ID,
      )

      // Create a wallet instance
      const wallet = new ethers.Wallet(privateKey, provider)

      // Fetch the contract ABI
      const contractAbi = await getContractAbi()
      const contractAddress = 'your_contract_address'

      // Create a contract instance
      const contract = new ethers.Contract(contractAddress, contractAbi, wallet)

      // Call the function on the smart contract with the proof
      const tx = await contract.addClaims(proof) // Replace `submitProof` with the actual function name

      // Wait for the transaction to be mined
      await tx.wait()

      res.status(200).json({ message: 'Proof submitted successfully' })
    } catch (error: any) {
      res.status(500).json({ message: `Error: ${error.message}` })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).json({ message: `Method ${req.method} Not Allowed` })
  }
}
