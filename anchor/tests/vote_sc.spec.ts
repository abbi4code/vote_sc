import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair} from '@solana/web3.js'
import {VoteSc} from '../target/types/vote_sc'

describe('vote_sc', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.VoteSc as Program<VoteSc>

  const vote_scKeypair = Keypair.generate()

  it('Initialize VoteSc', async () => {
    await program.methods
      .initialize()
      .accounts({
        vote_sc: vote_scKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([vote_scKeypair])
      .rpc()

    const currentCount = await program.account.vote_sc.fetch(vote_scKeypair.publicKey)

    expect(currentCount.count).toEqual(0)
  })

  it('Increment VoteSc', async () => {
    await program.methods.increment().accounts({ vote_sc: vote_scKeypair.publicKey }).rpc()

    const currentCount = await program.account.vote_sc.fetch(vote_scKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Increment VoteSc Again', async () => {
    await program.methods.increment().accounts({ vote_sc: vote_scKeypair.publicKey }).rpc()

    const currentCount = await program.account.vote_sc.fetch(vote_scKeypair.publicKey)

    expect(currentCount.count).toEqual(2)
  })

  it('Decrement VoteSc', async () => {
    await program.methods.decrement().accounts({ vote_sc: vote_scKeypair.publicKey }).rpc()

    const currentCount = await program.account.vote_sc.fetch(vote_scKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Set vote_sc value', async () => {
    await program.methods.set(42).accounts({ vote_sc: vote_scKeypair.publicKey }).rpc()

    const currentCount = await program.account.vote_sc.fetch(vote_scKeypair.publicKey)

    expect(currentCount.count).toEqual(42)
  })

  it('Set close the vote_sc account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        vote_sc: vote_scKeypair.publicKey,
      })
      .rpc()

    // The account should no longer exist, returning null.
    const userAccount = await program.account.vote_sc.fetchNullable(vote_scKeypair.publicKey)
    expect(userAccount).toBeNull()
  })
})
