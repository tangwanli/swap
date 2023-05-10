import BigNumber from 'bignumber.js'
import { BIG_ZERO } from '@pancakeswap/utils/bigNumber'
import { createSelector } from '@reduxjs/toolkit'
import { State, VaultKey } from '../types'
import { transformPool, transformVault } from './helpers'
import { initialPoolVaultState } from './index'
import { getVaultPosition, VaultPosition } from '../../utils/cakePool'

// 所有的池子，结束的池子和未结束的池子
const selectPoolsData = (state: State) => state.pools.data
const selectPoolData = (sousId) => (state: State) => state.pools.data.find((p) => p.sousId === sousId)
// 获取当前用户是否已经登陆钱包
const selectUserDataLoaded = (state: State) => state.pools.userDataLoaded
const selectVault = (key: VaultKey) => (state: State) => key ? state.pools[key] : initialPoolVaultState
const selectIfo = (state: State) => state.pools.ifo
const selectIfoUserCredit = (state: State) => state.pools.ifo.credit ?? BIG_ZERO

export const makePoolWithUserDataLoadingSelector = (sousId) =>
  createSelector([selectPoolData(sousId), selectUserDataLoaded], (pool, userDataLoaded) => {
    return { pool: transformPool(pool), userDataLoaded }
  })

// 所有结束和未结束的池子，加上userDataLoaded(用户钱包是否登陆)状态
export const poolsWithUserDataLoadingSelector = createSelector(
  [selectPoolsData, selectUserDataLoaded],
  (pools, userDataLoaded) => {
    // transformPool处理pools里面的所有数据，比如给pools加上一些字断之类的。不过也不是加太多的参数，大多数的参数还是在reducer的setPoolsPublicData里面添加的
    return { pools: pools.map(transformPool), userDataLoaded }
  },
)

export const makeVaultPoolByKey = (key) => createSelector([selectVault(key)], (vault) => transformVault(key, vault))

// export interface DeserializedCakeVault { // 这个类型就是下面的makeVaultPoolByKey(VaultKey.CakeVault)的返回值类型
//   totalShares?: BigNumber
//   totalLockedAmount?: BigNumber
//   pricePerFullShare?: BigNumber
//   totalCakeInVault?: BigNumber
//   fees?: DeserializedVaultFees
//   userData?: DeserializedVaultUser
// }
// 所有的池子Pool的数据。包含已结束和未结束的。这里的createSelector都是从redux里面取数据
// 第一个数组参数应该是数据源，第二个参数是处理数据的函数，处理函数的每个参数 就是前面数组里面的每个参数
// VaultKey.CakeVault和VaultKey.CakeFlexibleSideVault应该是获取池子的配置状态；自动池子(自动复投)、手动锁仓池子(需要手动收割复投)、灵活锁仓池子 还有ifo池子(质押对应的Token进行ifo)
export const poolsWithVaultSelector = createSelector(
  [
    poolsWithUserDataLoadingSelector, // 所有结束和未结束的池子，加上userDataLoaded(用户钱包是否登陆)状态
    makeVaultPoolByKey(VaultKey.CakeVault), // 获取手动锁仓池子的配置；反序列化CakeVault = 'cakeVault', 还不知道是干嘛的CakeFlexibleSideVault = 'cakeFlexibleSideVault',
    makeVaultPoolByKey(VaultKey.CakeFlexibleSideVault),// 获取灵活锁仓池子的配置；反序列化CakeFlexibleSideVault = 'cakeFlexibleSideVault', 还不知道是干嘛的
  ],
  // (poolsWithUserDataLoading) => {
  (poolsWithUserDataLoading, deserializedLockedCakeVault, deserializedFlexibleSideCakeVault) => {
    const { pools, userDataLoaded } = poolsWithUserDataLoading
    // 初始得cakePool，质押自己挖自己
    const cakePool = pools.find((pool) => !pool.isFinished && pool.sousId === 0)
    const withoutCakePool = pools.filter((pool) => pool.sousId !== 0)

    // 自动的cake池子，就是质押之后，奖励自动复投；还有一种就是手动的池子，质押之后 需要手动提取收益
    const cakeAutoVault = {
      ...cakePool,
      ...deserializedLockedCakeVault,
      vaultKey: VaultKey.CakeVault,
      userData: { ...cakePool?.userData, ...deserializedLockedCakeVault?.userData },
    }

    // 当前池子pool的锁仓状态
    // export enum VaultPosition {
    //   None, // 无状态
    //   Flexible, // 这个应该是随时可以取出来，灵活模式
    //   Locked, // 锁仓模式，正在锁仓
    //   LockedEnd, // 锁仓模式，锁仓时间结束，可以取出
    //   AfterBurning, // 这个应该是结束锁仓
    // }
    const lockedVaultPosition = getVaultPosition(deserializedLockedCakeVault.userData)
    // 是否灵活锁仓(随时可取)
    const hasFlexibleSideSharesStaked = deserializedFlexibleSideCakeVault.userData.userShares.gt(0)

    // 自动的灵活取cake池子。实测 这个值是空的[]
    const cakeAutoFlexibleSideVault =
      lockedVaultPosition > VaultPosition.Flexible || hasFlexibleSideSharesStaked
        ? [
            {
              ...cakePool,
              ...deserializedFlexibleSideCakeVault,
              vaultKey: VaultKey.CakeFlexibleSideVault,
              userData: { ...cakePool?.userData, ...deserializedFlexibleSideCakeVault.userData },
            },
          ]
        : []
        // console.log('pools', [cakeAutoVault, ...cakeAutoFlexibleSideVault, ...withoutCakePool]);
        

    // 这个返回值就是cake池子，和其它的所有池子
    // return { pools: [...withoutCakePool], userDataLoaded }
    return { pools: [cakeAutoVault, ...cakeAutoFlexibleSideVault, ...withoutCakePool], userDataLoaded }
  },
)

export const makeVaultPoolWithKeySelector = (vaultKey) =>
  createSelector(poolsWithVaultSelector, ({ pools }) => pools.find((p) => p.vaultKey === vaultKey))

export const ifoCreditSelector = createSelector([selectIfoUserCredit], (ifoUserCredit) => {
  return new BigNumber(ifoUserCredit)
})

export const ifoCeilingSelector = createSelector([selectIfo], (ifoData) => {
  return new BigNumber(ifoData.ceiling)
})
