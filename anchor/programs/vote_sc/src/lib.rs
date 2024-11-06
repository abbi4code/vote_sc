#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("AsjZ3kWAUSQRNt2pZVeJkywhZ6gpLpHZmJjduPmKZDZZ");

#[program]
pub mod vote_sc {
    use super::*;

    pub fn initializepoll(ctx: Context<InitializePoll>,poll_id: u64, poll_description: String, start_time: u64, end_time:u64)-> Result<()>{

      let pollbase = &mut ctx.accounts.poll;
      pollbase.poll_id = poll_id;
      pollbase.poll_desc = poll_description;
      pollbase.start_time = start_time;
      pollbase.end_time = end_time;
      pollbase.poll_votecount = 0;
      Ok(())
    }
//_poll_id -> starting underscore means _ that your arent gonna use those
    pub fn initializecandidate(ctx: Context<InitializeCandidate>, candidate_name: String, _poll_id: u64) -> Result<()> {
      let candidate_acc = &mut ctx.accounts.candidate;
      let poll_acc = &mut ctx.accounts.poll;
      poll_acc.poll_votecount += 1;
      candidate_acc.candidate_name = candidate_name;
      candidate_acc.candidate_votes = 0;
      // let poll_acc = &mut ctx.accounts.poll;
      // poll_acc.poll_votecount += 1;
      Ok(())
    }
    pub fn vote(ctx: Context<Vote>, _candidate_name: String, _poll_id: u64)-> Result<()>{
      let candidate = &mut ctx.accounts.candidate;
      candidate.candidate_votes += 1;
      msg!("Voted for candidate: {}", candidate.candidate_name);
      msg!("Votes count: {}", candidate.candidate_votes);
      Ok(())
    }
}

#[derive(Accounts)]
#[instruction(poll_id: u64)]
pub struct InitializePoll<'info>{
  #[account(mut)]
  pub signer: Signer<'info>,

  #[account(
    init,
    payer = signer,
    space = 8 + Poll::INIT_SPACE,
    seeds = [poll_id.to_le_bytes().as_ref()],
    bump
  )]
  pub poll: Account<'info,Poll>,

  pub system_program: Program<'info, System>

}

#[derive(Accounts)]
#[instruction(candidate_name: String, poll_id: u64)]
pub struct InitializeCandidate<'info>{
  #[account(mut)]
  pub payer: Signer<'info>,

  //here we dont need init, payer or whatver as we already initialized in the initializePoll
  //we need here this poll bcox to inc its poll_count_candidate
  //like how many candidates are within the pole
  #[account(
    mut,
    seeds = [poll_id.to_le_bytes().as_ref()],
    bump
  )]
  pub poll: Account<'info, Poll>,

  #[account(
    init,
    payer = payer,
    space = 8 + Candidate::INIT_SPACE,
    seeds = [poll_id.to_le_bytes().as_ref(),candidate_name.as_bytes()],
    bump
  )]
  pub candidate: Account<'info, Candidate>,

  pub system_program: Program<'info, System>

}

#[derive(Accounts)]
#[instruction( candidate_name: String ,poll_id: u64)]
pub struct Vote<'info>{

  pub payer: Signer<'info>,

  #[account(
    seeds = [poll_id.to_le_bytes().as_ref()],
    bump
  )]
  pub poll: Account<'info, Poll>,

  #[account(
    mut,
    seeds = [poll_id.to_le_bytes().as_ref(),candidate_name.as_bytes()],
    bump
  )]
  pub candidate: Account<'info, Candidate>


}

#[account]
#[derive(InitSpace)]
pub struct Poll {
  pub poll_id: u64,
  #[max_len(32)]
  pub poll_desc: String,
  pub start_time: u64,
  pub end_time: u64,
  pub poll_votecount: u64
}

#[account]
#[derive(InitSpace)]
pub struct Candidate{
  #[max_len(32)]
  pub candidate_name: String,
  pub candidate_votes: u64
}

#[error_code]
pub enum ErrorCode {
  #[msg("Voting has not started yet")]
  VotingNotStarted,
  #[msg("Sorry broo voting ended kal aana")]
  VotingEnded
}