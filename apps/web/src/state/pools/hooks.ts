import { useEffect, useMemo } from 'react'
import { useAccount } from 'wagmi'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { batch, useSelector } from 'react-redux'
import { useAppDispatch } from 'state'
import { useFastRefreshEffect, useSlowRefreshEffect } from 'hooks/useRefreshEffect'
import { FAST_INTERVAL } from 'config/constants'
import useSWRImmutable from 'swr/immutable'
import { getFarmConfig } from '@pancakeswap/farms/constants'
// import { livePools } from 'config/constants/pools'
import { Pool } from '@pancakeswap/uikit'
import { Token } from '@pancakeswap/sdk'

import { useActiveChainId } from 'hooks/useActiveChainId'
import {allPool} from 'config/constants/pools'
import {
  fetchPoolsPublicDataAsync,
  fetchPoolsUserDataAsync,
  fetchCakeVaultPublicData,
  fetchCakeVaultUserData,
  fetchCakeVaultFees,
  fetchPoolsStakingLimitsAsync,
  fetchUserIfoCreditDataAsync,
  fetchIfoPublicDataAsync,
  fetchCakeFlexibleSideVaultPublicData,
  fetchCakeFlexibleSideVaultUserData,
  fetchCakeFlexibleSideVaultFees,
  fetchCakePoolUserDataAsync,
  fetchCakePoolPublicDataAsync,
} from '.'
import { VaultKey } from '../types'
import { fetchFarmsPublicDataAsync } from '../farms'
import {
  makePoolWithUserDataLoadingSelector,
  makeVaultPoolByKey,
  poolsWithVaultSelector,
  ifoCreditSelector,
  ifoCeilingSelector,
  makeVaultPoolWithKeySelector,
} from './selectors'


// const poolsConfig = allPool.pools

// const lPoolAddresses = poolsConfig.filter(({ sousId, isFinished }) => sousId !== 0 && !isFinished).map(({ earningToken }) => earningToken.address)
// const lPoolAddresses = livePools.filter(({ sousId }) => sousId !== 0).map(({ earningToken }) => earningToken.address)

// Only fetch farms for live pools
const getActiveFarms = async (chainId: number) => {
  const poolsConfig = allPool.pools
const lPoolAddresses = poolsConfig.filter(({ sousId, isFinished }) => sousId !== 0 && !isFinished).map(({ earningToken }) => earningToken.address)
  const farmsConfig = await getFarmConfig(chainId)
  return farmsConfig
    .filter(
      ({ token, pid, quoteToken }) =>
        pid !== 0 &&
        ((token.symbol === 'CAKE' && quoteToken.symbol === 'WBNB') ||
          (token.symbol === 'BUSD' && quoteToken.symbol === 'WBNB') ||
          (token.symbol === 'USDT' && quoteToken.symbol === 'BUSD') ||
          lPoolAddresses.find((poolAddress) => poolAddress === token.address)),
    )
    .map((farm) => farm.pid)
}

const getCakePriceFarms = async (chainId: number) => {
  const farmsConfig = await getFarmConfig(chainId)
  return farmsConfig
    .filter(
      ({ token, pid, quoteToken }) =>
        pid !== 0 &&
        ((token.symbol === 'CAKE' && quoteToken.symbol === 'WBNB') ||
          (token.symbol === 'BUSD' && quoteToken.symbol === 'WBNB')),
    )
    .map((farm) => farm.pid)
}

export const useFetchPublicPoolsData = () => {
  const dispatch = useAppDispatch()
  const { chainId } = useActiveChainId()

  useSlowRefreshEffect(
    (currentBlock) => {
      const fetchPoolsDataWithFarms = async () => {
        const activeFarms = await getActiveFarms(chainId)
        await dispatch(fetchFarmsPublicDataAsync({ pids: activeFarms, chainId }))

        batch(() => {
          dispatch(fetchPoolsPublicDataAsync(currentBlock, chainId))
          dispatch(fetchPoolsStakingLimitsAsync(chainId))
        })
      }

      fetchPoolsDataWithFarms()
    },
    [dispatch, chainId],
  )
}

export const usePool = (sousId: number): { pool: Pool.DeserializedPool<Token>; userDataLoaded: boolean } => {
  const poolWithUserDataLoadingSelector = useMemo(() => makePoolWithUserDataLoadingSelector(sousId), [sousId])
  return useSelector(poolWithUserDataLoadingSelector)
}

// 所有的池子Pool的数据。包含已结束和未结束的
export const usePoolsWithVault = () => {
  // console.log('进入里面的刷新');
  const temp = useSelector(poolsWithVaultSelector)
  return temp
}

export const useDeserializedPoolByVaultKey = (vaultKey) => {
  const vaultPoolWithKeySelector = useMemo(() => makeVaultPoolWithKeySelector(vaultKey), [vaultKey])

  return useSelector(vaultPoolWithKeySelector)
}

export const usePoolsPageFetch = () => {
  const { address: account } = useAccount()
  const dispatch = useAppDispatch()
  useFetchPublicPoolsData()
  const { chainId } = useActiveWeb3React()

  useFastRefreshEffect(() => {
    batch(() => {
      dispatch(fetchCakeVaultPublicData({chainId}))
      dispatch(fetchCakeFlexibleSideVaultPublicData({chainId}))
      dispatch(fetchIfoPublicDataAsync())
      if (account) {
        dispatch(fetchPoolsUserDataAsync({account, chainId}))
        dispatch(fetchCakeVaultUserData({ account,chainId }))
        dispatch(fetchCakeFlexibleSideVaultUserData({ account }))
      }
    })
  }, [account, chainId, dispatch])

  useEffect(() => {
    batch(() => {
      dispatch(fetchCakeVaultFees({chainId}))
      dispatch(fetchCakeFlexibleSideVaultFees({chainId}))
    })
  }, [chainId, dispatch])
}

export const useCakeVaultUserData = () => {
  const { address: account } = useAccount()
  const dispatch = useAppDispatch()
  const { chainId } = useActiveWeb3React()

  useFastRefreshEffect(() => {
    if (account) {
      dispatch(fetchCakeVaultUserData({ account, chainId }))
    }
  }, [account, chainId, dispatch])
}

export const useCakeVaultPublicData = () => {
  const dispatch = useAppDispatch()
  const { chainId } = useActiveWeb3React()
  useFastRefreshEffect(() => {
    dispatch(fetchCakeVaultPublicData({chainId}))
  }, [chainId, dispatch])
}

export const useFetchIfo = () => {
  const { account, chainId } = useActiveWeb3React()
  const dispatch = useAppDispatch()

  useSWRImmutable(
    'fetchIfoPublicData',
    async () => {
      const cakePriceFarms = await getCakePriceFarms(chainId)
      await dispatch(fetchFarmsPublicDataAsync({ pids: cakePriceFarms, chainId }))
      batch(() => {
        dispatch(fetchCakePoolPublicDataAsync())
        dispatch(fetchCakeVaultPublicData({chainId}))
        dispatch(fetchIfoPublicDataAsync())
      })
    },
    {
      refreshInterval: FAST_INTERVAL,
    },
  )

  useSWRImmutable(
    account && ['fetchIfoUserData', account],
    async () => {
      batch(() => {
        dispatch(fetchCakePoolUserDataAsync(account, chainId))
        dispatch(fetchCakeVaultUserData({ account,chainId }))
        dispatch(fetchUserIfoCreditDataAsync(account))
      })
    },
    {
      refreshInterval: FAST_INTERVAL,
    },
  )

  useSWRImmutable('fetchCakeVaultFees', async () => {
    dispatch(fetchCakeVaultFees({chainId}))
  })
}

export const useCakeVault = () => {
  return useVaultPoolByKey(VaultKey.CakeVault)
}

export const useVaultPoolByKey = (key: VaultKey) => {
  const vaultPoolByKey = useMemo(() => makeVaultPoolByKey(key), [key])

  return useSelector(vaultPoolByKey)
}

export const useIfoCredit = () => {
  return useSelector(ifoCreditSelector)
}

export const useIfoCeiling = () => {
  return useSelector(ifoCeilingSelector)
}
