#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("AsjZ3kWAUSQRNt2pZVeJkywhZ6gpLpHZmJjduPmKZDZZ");

#[program]
pub mod vote_sc {
    use super::*;

  pub fn close(_ctx: Context<CloseVoteSc>) -> Result<()> {
    Ok(())
  }

  pub fn decrement(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.vote_sc.count = ctx.accounts.vote_sc.count.checked_sub(1).unwrap();
    Ok(())
  }

  pub fn increment(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.vote_sc.count = ctx.accounts.vote_sc.count.checked_add(1).unwrap();
    Ok(())
  }

  pub fn initialize(_ctx: Context<InitializeVoteSc>) -> Result<()> {
    Ok(())
  }

  pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
    ctx.accounts.vote_sc.count = value.clone();
    Ok(())
  }
}

#[derive(Accounts)]
pub struct InitializeVoteSc<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  init,
  space = 8 + VoteSc::INIT_SPACE,
  payer = payer
  )]
  pub vote_sc: Account<'info, VoteSc>,
  pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct CloseVoteSc<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  mut,
  close = payer, // close account and return lamports to payer
  )]
  pub vote_sc: Account<'info, VoteSc>,
}

#[derive(Accounts)]
pub struct Update<'info> {
  #[account(mut)]
  pub vote_sc: Account<'info, VoteSc>,
}

#[account]
#[derive(InitSpace)]
pub struct VoteSc {
  count: u8,
}
