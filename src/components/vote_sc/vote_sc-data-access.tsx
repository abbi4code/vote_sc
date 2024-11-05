'use client'

import {getVoteScProgram, getVoteScProgramId} from '@project/anchor'
import {useConnection} from '@solana/wallet-adapter-react'
import {Cluster, Keypair, PublicKey} from '@solana/web3.js'
import {useMutation, useQuery} from '@tanstack/react-query'
import {useMemo} from 'react'
import toast from 'react-hot-toast'
import {useCluster} from '../cluster/cluster-data-access'
import {useAnchorProvider} from '../solana/solana-provider'
import {useTransactionToast} from '../ui/ui-layout'

export function useVoteScProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getVoteScProgramId(cluster.network as Cluster), [cluster])
  const program = getVoteScProgram(provider)

  const accounts = useQuery({
    queryKey: ['vote_sc', 'all', { cluster }],
    queryFn: () => program.account.vote_sc.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initialize = useMutation({
    mutationKey: ['vote_sc', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods.initialize().accounts({ vote_sc: keypair.publicKey }).signers([keypair]).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature)
      return accounts.refetch()
    },
    onError: () => toast.error('Failed to initialize account'),
  })

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize,
  }
}

export function useVoteScProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useVoteScProgram()

  const accountQuery = useQuery({
    queryKey: ['vote_sc', 'fetch', { cluster, account }],
    queryFn: () => program.account.vote_sc.fetch(account),
  })

  const closeMutation = useMutation({
    mutationKey: ['vote_sc', 'close', { cluster, account }],
    mutationFn: () => program.methods.close().accounts({ vote_sc: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accounts.refetch()
    },
  })

  const decrementMutation = useMutation({
    mutationKey: ['vote_sc', 'decrement', { cluster, account }],
    mutationFn: () => program.methods.decrement().accounts({ vote_sc: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const incrementMutation = useMutation({
    mutationKey: ['vote_sc', 'increment', { cluster, account }],
    mutationFn: () => program.methods.increment().accounts({ vote_sc: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const setMutation = useMutation({
    mutationKey: ['vote_sc', 'set', { cluster, account }],
    mutationFn: (value: number) => program.methods.set(value).accounts({ vote_sc: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  return {
    accountQuery,
    closeMutation,
    decrementMutation,
    incrementMutation,
    setMutation,
  }
}
