import { ActionGetResponse, ActionPostRequest, ACTIONS_CORS_HEADERS, createPostResponse } from "@solana/actions"
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { VoteSc } from "@project/anchor";
import { BN, Program } from "@coral-xyz/anchor";

const IDL = require("../../../../anchor/target/idl/vote_sc.json")

export const OPTIONS = GET

export async function GET(request: Request){

    const metadata:ActionGetResponse = {
        icon: "https://i.pinimg.com/550x/cb/33/49/cb3349b86ca661ca61ae9a36d88d70d4.jpg",
        title: "Pokemon",
        description: "Whats your fav pokemon",
        label: "Vote",
        links: {
            actions: [
                {
                    label: "vote for Pikachu",
                    href: '/api/vote?pokemon=pikachu'
                },
                {
                    label: "vote for ratata",
                    href: "/api/vote?pokemon=ratata"
                }
            ],
        }
    }
    return Response.json(metadata, {headers: ACTIONS_CORS_HEADERS});

}

export async function POST(request: Request){
    const url = new URL(request.url);
    const pokemon = url.searchParams.get("pokemon")
    
    if(pokemon != "pikachu" && pokemon != "ratata"){
        return new Response("Invalid pokes dude", {headers: ACTIONS_CORS_HEADERS})
    }
    
    const connection = new Connection("http://127.0.0.1:8899")
    const program : Program<VoteSc> = new Program(IDL, {connection})
    //as anyone click on any vote gives out user pubKey
    const body: ActionPostRequest = await request.json();
    let voter;

    try {
        voter = new PublicKey(body.account)
        
    } catch (error) {
        return new Response("Invalid Wallet account", {headers: ACTIONS_CORS_HEADERS}) 
    }
    //passing the body parameters to our smart contract
    const instruction = await program.methods.vote(pokemon, new BN(1)).accounts({signer: voter}).instruction()
    
    const blockhash = await connection.getLatestBlockhash();

    const trasaction = new Transaction({
        feePayer: voter,
        blockhash: blockhash.blockhash,
        lastValidBlockHeight: blockhash.lastValidBlockHeight
    }).add(instruction)

    const res = await createPostResponse({
        fields:{
            transaction: trasaction
        }
    });

    return Response.json(res, {headers: ACTIONS_CORS_HEADERS})

}
