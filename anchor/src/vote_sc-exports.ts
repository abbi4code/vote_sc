// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import VoteScIDL from '../target/idl/vote_sc.json'
import type { VoteSc } from '../target/types/vote_sc'

// Re-export the generated IDL and type
export { VoteSc, VoteScIDL }

// The programId is imported from the program IDL.
export const VOTE_SC_PROGRAM_ID = new PublicKey(VoteScIDL.address)

// This is a helper function to get the VoteSc Anchor program.
export function getVoteScProgram(provider: AnchorProvider) {
  return new Program(VoteScIDL as VoteSc, provider)
}

// This is a helper function to get the program ID for the VoteSc program depending on the cluster.
export function getVoteScProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the VoteSc program on devnet and testnet.
      return new PublicKey('CounNZdmsQmWh7uVngV9FXW2dZ6zAgbJyYsvBpqbykg')
    case 'mainnet-beta':
    default:
      return VOTE_SC_PROGRAM_ID
  }
}
