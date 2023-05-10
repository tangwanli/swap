import BigNumber from 'bignumber.js'
import fromPairs from 'lodash/fromPairs'
import { BigNumber as EthersBigNumber } from '@ethersproject/bignumber'
// import poolsConfig from 'config/constants/pools'
import {allPool} from 'config/constants/pools'
import sousChefABI from 'config/abi/sousChef.json'
import erc20ABI from 'config/abi/erc20.json'
import multicall, { multicallv2 } from 'utils/multicall'
import { getAddress } from 'utils/addressHelpers'
import { BIG_ZERO } from '@pancakeswap/utils/bigNumber'
import { ChainId } from '@pancakeswap/sdk'
import chunk from 'lodash/chunk'
import sousChefV2 from '../../config/abi/sousChefV2.json'
import sousChefV3 from '../../config/abi/sousChefV3.json'


// 从合约获取对应代币的开始区块和结束区块。用来给基础的pool加上一些数据，来展示到页面上，在reducer的fetchPoolsPublicDataAsync方法中调用
export const fetchPoolsBlockLimits = async (chainId: number = ChainId.BSC) => {
  const poolsConfig = allPool.pools

  // 进行中的池子
const livePoolsWithEnd = poolsConfig.filter((p) => p.sousId !== 0 && !p.isFinished)

  // 相当于map，把pool里面只留下 name和address参数，然后进行flat，进行铺平
const startEndBlockCalls = livePoolsWithEnd.flatMap((poolConfig) => {
  return [
    {
      address: getAddress(poolConfig.contractAddress, chainId),
      name: 'startBlock', // 这里这个name就是要从合约中读取的字段
    },
    {
      address: getAddress(poolConfig.contractAddress, chainId),
      name: 'bonusEndBlock',
    },
  ]
})

  // 这里合约的操作就是 sousChefABI这个json就是对应的合约的操作json，然后后面的startEndBlockCalls就是需要操作的合约
  // 从合约里面把 startBlock和bonusEndBlock字段读取出来; 这里读出来的值不是直接的number,所以需要下面操作进行转换.具体里面封装的逻辑,先不做处理
  const startEndBlockRaw = await multicall(sousChefABI, startEndBlockCalls, chainId)

  const startEndBlockResult = startEndBlockRaw.reduce((resultArray, item, index) => {
    const chunkIndex = Math.floor(index / 2)

    if (!resultArray[chunkIndex]) {
      // eslint-disable-next-line no-param-reassign
      resultArray[chunkIndex] = [] // start a new chunk
    }

    resultArray[chunkIndex].push(item)

    return resultArray
  }, [])

  return livePoolsWithEnd.map((cakePoolConfig, index) => {
    const [[startBlock], [endBlock]] = startEndBlockResult[index]
    return {
      sousId: cakePoolConfig.sousId,
      startBlock: startBlock.toNumber(),
      endBlock: endBlock.toNumber(),
    }
  })
}



// 获取质押的Token的总数。用来给基础的pool加上一些数据，来展示到页面上，在reducer的fetchPoolsPublicDataAsync方法中调用
export const fetchPoolsTotalStaking = async (chainId: number = ChainId.BSC) => {
  const poolsConfig = allPool.pools
  const poolsBalanceOf = poolsConfig.map((poolConfig) => {
    return {
      address: poolConfig.stakingToken.address,
      name: 'balanceOf',
      params: [getAddress(poolConfig.contractAddress, chainId)],
    }
  })
  const poolsTotalStaked = await multicall(erc20ABI, poolsBalanceOf, chainId)

  return poolsConfig.map((p, index) => ({
    sousId: p.sousId,
    // totalStaked: new BigNumber('6666666666666666666').toJSON(),
    totalStaked: new BigNumber(poolsTotalStaked[index]).toJSON(),
  }))
}

export const fetchPoolsStakingLimits = async (
  poolsWithStakingLimit: number[],
  chainId: number = ChainId.BSC
): Promise<{ [key: string]: { stakingLimit: BigNumber; numberBlocksForUserLimit: number } }> => {
  const poolsConfig = allPool.pools
  const validPools = poolsConfig
    .filter((p) => p.stakingToken.symbol !== 'BNB' && !p.isFinished)
    .filter((p) => !poolsWithStakingLimit.includes(p.sousId))

  // Get the staking limit for each valid pool
  const poolStakingCalls = validPools
    .map((validPool) => {
      const contractAddress = getAddress(validPool.contractAddress, chainId)
      return ['hasUserLimit', 'poolLimitPerUser', 'numberBlocksForUserLimit'].map((method) => ({
        address: contractAddress,
        name: method,
      }))
    })
    .flat()

  const poolStakingResultRaw = await multicallv2({
    abi: sousChefV2,
    calls: poolStakingCalls,
    options: { requireSuccess: false },
    chainId
  })
  const chunkSize = poolStakingCalls.length / validPools.length
  const poolStakingChunkedResultRaw = chunk(poolStakingResultRaw.flat(), chunkSize)
  return fromPairs(
    poolStakingChunkedResultRaw.map((stakingLimitRaw, index) => {
      const hasUserLimit = stakingLimitRaw[0]
      const stakingLimit = hasUserLimit && stakingLimitRaw[1] ? new BigNumber(stakingLimitRaw[1].toString()) : BIG_ZERO
      const numberBlocksForUserLimit = stakingLimitRaw[2] ? (stakingLimitRaw[2] as EthersBigNumber).toNumber() : 0
      return [validPools[index].sousId, { stakingLimit, numberBlocksForUserLimit }]
    }),
  )
}

// 用来给基础的pool加上一些数据，来展示到页面上，在reducer的fetchPoolsPublicDataAsync方法中调用
export const fetchPoolsProfileRequirement = async (chainId: number = ChainId.BSC): Promise<{
  [key: string]: {
    required: boolean
    thresholdPoints: string
  }
}> => {
  const poolsConfig = allPool.pools
  const livePoolsWithV3 = poolsConfig.filter((pool) => pool?.version === 3 && !pool?.isFinished)
  const poolProfileRequireCalls = livePoolsWithV3
  .map((validPool) => {
      const contractAddress = getAddress(validPool.contractAddress, chainId)
      return ['pancakeProfileIsRequested', 'pancakeProfileThresholdPoints'].map((method) => ({
        address: contractAddress,
        name: method,
      }))
    })
    .flat()

  const poolProfileRequireResultRaw = await multicallv2({
    abi: sousChefV3,
    calls: poolProfileRequireCalls,
    options: { requireSuccess: false },
    chainId
  })
  const chunkSize = poolProfileRequireCalls.length / livePoolsWithV3.length
  const poolStakingChunkedResultRaw = chunk(poolProfileRequireResultRaw.flat(), chunkSize)
  return fromPairs(
    poolStakingChunkedResultRaw.map((poolProfileRequireRaw, index) => {
      const hasProfileRequired = poolProfileRequireRaw[0]
      const profileThresholdPoints = poolProfileRequireRaw[1]
        ? new BigNumber(poolProfileRequireRaw[1].toString())
        : BIG_ZERO
      return [
        livePoolsWithV3[index].sousId,
        {
          required: !!hasProfileRequired,
          thresholdPoints: profileThresholdPoints.toJSON(),
        },
      ]
    }),
  )
}
