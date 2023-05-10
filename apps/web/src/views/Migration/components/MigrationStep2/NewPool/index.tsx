import React, { useEffect, useMemo } from 'react'
import { useAccount } from 'wagmi'
import { useCakeVault, usePoolsWithVault } from 'state/pools/hooks'
import { useFastRefreshEffect } from 'hooks/useRefreshEffect'
import { useAppDispatch } from 'state'
import {
  fetchCakePoolUserDataAsync,
  fetchCakeVaultFees,
  fetchCakeVaultPublicData,
  fetchCakeVaultUserData,
  fetchCakePoolPublicDataAsync,
  fetchCakeFlexibleSideVaultPublicData,
  fetchCakeFlexibleSideVaultUserData,
  fetchCakeFlexibleSideVaultFees,
} from 'state/pools'
import { batch } from 'react-redux'
import { Pool } from '@pancakeswap/uikit'
import { Token } from '@pancakeswap/sdk'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import PoolsTable from './PoolTable'

const NewPool: React.FC<React.PropsWithChildren> = () => {
  const { address: account } = useAccount()
  const { pools } = usePoolsWithVault()
  const cakeVault = useCakeVault()
  const { chainId } = useActiveWeb3React()

  const stakedOnlyOpenPools = useMemo(
    () => pools.filter((pool) => pool.userData && pool.sousId === 0 && !pool.isFinished),
    [pools],
  ) as Pool.DeserializedPool<Token>[]

  const userDataReady: boolean = !account || (!!account && !cakeVault.userData?.isLoading)

  const dispatch = useAppDispatch()

  useFastRefreshEffect(() => {
    batch(() => {
      dispatch(fetchCakeVaultPublicData({chainId}))
      dispatch(fetchCakeFlexibleSideVaultPublicData({chainId}))
      dispatch(fetchCakePoolPublicDataAsync())
      if (account) {
        dispatch(fetchCakeVaultUserData({ account,chainId }))
        dispatch(fetchCakeFlexibleSideVaultUserData({ account }))
        dispatch(fetchCakePoolUserDataAsync(account, chainId))
      }
    })
  }, [account, chainId, dispatch])

  useEffect(() => {
    batch(() => {
      dispatch(fetchCakeVaultFees({chainId}))
      dispatch(fetchCakeFlexibleSideVaultFees({chainId}))
    })
  }, [chainId, dispatch])

  return <PoolsTable pools={stakedOnlyOpenPools} account={account} userDataReady={userDataReady} />
}

export default NewPool
