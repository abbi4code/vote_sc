import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair, PublicKey} from '@solana/web3.js'
import {VoteSc} from '../target/types/vote_sc'

import { BankrunProvider, startAnchor } from "anchor-bankrun";
const IDL = require("../target/idl/vote_sc.json")

const votingaddress = new PublicKey("AsjZ3kWAUSQRNt2pZVeJkywhZ6gpLpHZmJjduPmKZDZZ")

describe('Votingg', () => {
  // Configure the client to use the local cluster.
  //writing test for our smart-contract lfgg

  let context;
  let provider;
  anchor.setProvider(anchor.AnchorProvider.env())
  let votingProgram = anchor.workspace.VoteSc as Program<VoteSc>;

  beforeAll(async()=>{
    //this name should match with the name in anchor.toml
    // context = await startAnchor("", [{name: "vote_sc", programId:votingaddress}], []);

    // provider = new BankrunProvider(context);
  
    // votingProgram = new Program<VoteSc>(
    //   IDL,
    //   provider,
    // );

  })

  it('Initialize Poll', async () => {
    

    //now here we access out created methods
    //new anchor.BN(1) => this is how we create object
    await votingProgram.methods.initializepoll(
      new anchor.BN(1),
      "what is your favourite Pokemon?",
      new anchor.BN(0),
      new anchor.BN(1730566285)
    ).rpc()
    //this .rpc() will call this method to execute the given program with these instrctions

    //we can see that pollacccount that just created with the poll_id
    const [pollAddress] = PublicKey.findProgramAddressSync([new anchor.BN(1).toArrayLike(Buffer, 'le', 8)],votingaddress)

    console.log("pollAddress", pollAddress)

    const poll = await votingProgram.account.poll.fetch(pollAddress);
    console.log("poll", poll)
    expect(poll.pollId.toNumber()).toEqual(1)
    expect(poll.pollDesc).toEqual("what is your favourite Pokemon?")
    expect(poll.startTime.toNumber()).toBeLessThan(poll.endTime.toNumber())
  })

  it("initialize candidate", async()=>{

    // const [pollAddress] = PublicKey.findProgramAddressSync(
    //   [new anchor.BN(1).toArrayLike(Buffer, 'le', 8),Buffer.from("Pikachu")],votingaddress
    // )
    // const poll = await votingProgram.account.poll.fetch(pollAddress)
    // if (!poll) {
    //   throw new Error("Poll account is not initialized!");
    // }          
    await votingProgram.methods.initializecandidate(
      "Pikachu",
      new anchor.BN(1)
    ).rpc()
    await votingProgram.methods.initializecandidate(
      "Ratata",
      new anchor.BN(1)
    ).rpc()

    const [PikachuAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8),Buffer.from("Pikachu")],votingaddress
    )

    const pikachu = await votingProgram.account.candidate.fetch(PikachuAddress)
    console.log("pikachu",pikachu)

  }) 
  it("vote", async()=>{

    await votingProgram.methods.vote("Pikachu", new anchor.BN(1)).rpc()

    const [PikachuAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8),Buffer.from("Pikachu")],votingaddress
    )

    const pikachu = await votingProgram.account.candidate.fetch(PikachuAddress)
    console.log("Pickahcuuuu",pikachu)

  })
})
