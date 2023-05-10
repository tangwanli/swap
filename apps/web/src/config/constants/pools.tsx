import { BigNumber } from '@ethersproject/bignumber'
import { Pool } from '@pancakeswap/uikit'
import { SerializedWrappedToken } from '@pancakeswap/token-lists'
import Trans from 'components/Trans'
import { VaultKey } from 'state/types'
import { bscTestnetTokens, bscTokens } from '@pancakeswap/tokens'
import { PoolCategory } from './types'

export const MAX_LOCK_DURATION = 31536000
export const UNLOCK_FREE_DURATION = 604800
export const ONE_WEEK_DEFAULT = 604800
export const BOOST_WEIGHT = BigNumber.from('20000000000000')
export const DURATION_FACTOR = BigNumber.from('31536000')

// 这个应该是池子的配置状态；自动池子(自动复投)、手动锁仓池子(需要手动收割复投)、灵活锁仓池子 还有ifo池子(质押对应的Token进行ifo)
export const vaultPoolConfig = {
  [VaultKey.CakeVaultV1]: { // 自动池子(自动复投)
    name: <Trans>Auto CAKE</Trans>,
    description: <Trans>Automatic restaking</Trans>,
    autoCompoundFrequency: 5000,
    gasLimit: 380000,
    tokenImage: {
      primarySrc: `/images/tokens/${bscTokens.cake.address}.svg`,
      secondarySrc: '/images/tokens/autorenew.svg',
    },
  },
  [VaultKey.CakeVault]: { // 手动锁仓池子(需要手动收割复投)
    name: <Trans>Stake CAKE</Trans>,
    description: <Trans>Stake, Earn – And more!</Trans>,
    autoCompoundFrequency: 5000,
    gasLimit: 600000,
    tokenImage: {
      primarySrc: `/images/tokens/${bscTokens.cake.address}.svg`,
      secondarySrc: '/images/tokens/autorenew.svg',
    },
  },
  [VaultKey.CakeFlexibleSideVault]: { // 灵活锁仓池子
    name: <Trans>Flexible CAKE</Trans>,
    description: <Trans>Flexible staking on the side.</Trans>,
    autoCompoundFrequency: 5000,
    gasLimit: 500000,
    tokenImage: {
      primarySrc: `/images/tokens/${bscTokens.cake.address}.svg`,
      secondarySrc: '/images/tokens/autorenew.svg',
    },
  },
  [VaultKey.IfoPool]: { // ifo池子(质押对应的Token进行ifo)
    name: 'IFO CAKE',
    description: <Trans>Stake CAKE to participate in IFOs</Trans>,
    autoCompoundFrequency: 1,
    gasLimit: 500000,
    tokenImage: {
      primarySrc: `/images/tokens/${bscTokens.cake.address}.svg`,
      secondarySrc: `/images/tokens/ifo-pool-icon.svg`,
    },
  },
} as const

// export interface PoolConfigBaseProps {
//   sousId: number; // 这个参数目前不知道是什么
//   contractAddress: Address; // 合约地址，这个合约地址是什么，目前还不清楚，有可能是质押对应的合约地址
//   poolCategory: PoolCategory; // 池子的类型，目前也不知道有什么区别
//   tokenPerBlock: string; // 每个区块产生多少，目前也不知道是怎么看的
//   version?: number; // 版本，v3的池子,现在一般都是v3的池子
//   isFinished?: boolean; // 这个参数 看起来应该是可以不加的
//   enableEmergencyWithdraw?: boolean;
// }

// export interface SerializedPoolConfig<T> extends PoolConfigBaseProps {
//   stakingToken: T & GenericToken; // 质押的Token
//   earningToken: T & GenericToken; // 赚取的Token
// }

// 进行中的池子
export const livePools: Pool.SerializedPoolConfig<SerializedWrappedToken>[] = [
  // {
  //   sousId: 0, // 这个0，代表cake池子，即第一个池子
  //   stakingToken: bscTokens.cake,
  //   earningToken: bscTokens.cake,
  //   contractAddress: {
  //     97: '0xB4A466911556e39210a6bB2FaECBB59E4eB7E43d',
  //     56: '0xa5f8C5Dbd5F286960b9d90548680aE5ebFf07652',
  //   },
  //   poolCategory: PoolCategory.CORE,
  //   tokenPerBlock: '10',
  //   isFinished: false,
  // },
  // {
  //   sousId: 999,
  //   stakingToken: bscTokens.StakingToken, // 质押的Token
  //   earningToken: bscTokens.RewardToken, // 赚取的Token
  //   contractAddress: { // 合约地址，这个合约地址是什么，目前还不清楚，有可能是质押对应的合约地址
  //     56: '',
  //     97: '0x9261256eAeB8A4CcB72070E32E4075788D61E21e',
  //   },
  //   poolCategory: PoolCategory.CORE, // 池子的类型，目前也不知道有什么区别
  //   tokenPerBlock: '0.01022', // 每个区块产生多少，目前也不知道是怎么看的
  //   version: 3, // 版本，也不知道有什么用处
  // },
  // {
  //   sousId: 323,
  //   stakingToken: bscTokens.cake, // 质押的Token
  //   earningToken: bscTokens.sd, // 赚取的Token
  //   contractAddress: { // 合约地址，这个合约地址是什么，目前还不清楚，有可能是质押对应的合约地址
  //     56: '0xaEC63F134a7853C6DaC9BA428d7962cD7C6c5e30',
  //     97: '',
  //   },
  //   poolCategory: PoolCategory.CORE, // 池子的类型，目前也不知道有什么区别
  //   tokenPerBlock: '0.01022', // 每个区块产生多少，目前也不知道是怎么看的
  //   version: 3, // 版本，也不知道有什么用处
  // },
  // {
  //   sousId: 322,
  //   stakingToken: bscTokens.cake,
  //   earningToken: bscTokens.pstake,
  //   contractAddress: {
  //     56: '0x98AC153577d65f2eEF2256f3AeF8ba9D7E4B756B',
  //     97: '',
  //   },
  //   poolCategory: PoolCategory.CORE,
  //   tokenPerBlock: '0.1186',
  //   version: 3,
  // },
  // {
  //   sousId: 321,
  //   stakingToken: bscTokens.cake,
  //   earningToken: bscTokens.csix,
  //   contractAddress: {
  //     56: '0x8BD7b0d392D2dE8F682704A3186A48467FcDC7AC',
  //     97: '',
  //   },
  //   poolCategory: PoolCategory.CORE,
  //   tokenPerBlock: '8.68',
  //   version: 3,
  // },
  // {
  //   sousId: 320,
  //   stakingToken: bscTokens.cake,
  //   earningToken: bscTokens.axlusdc,
  //   contractAddress: {
  //     56: '0x08287F4942A7B68DDb87D20Becd4fdadF4aE206e',
  //     97: '',
  //   },
  //   poolCategory: PoolCategory.CORE,
  //   tokenPerBlock: '0.0135',
  //   version: 3,
  // },
  // {
  //   sousId: 306,
  //   stakingToken: bscTokens.cake,
  //   earningToken: bscTokens.squad,
  //   contractAddress: {
  //     56: '0x08C9d626a2F0CC1ed9BD07eBEdeF8929F45B83d3',
  //     97: '',
  //   },
  //   poolCategory: PoolCategory.CORE,
  //   tokenPerBlock: '2.459',
  //   version: 3,
  // },
].map((p) => ({
  ...p,
  stakingToken: p.stakingToken.serialize,
  earningToken: p.earningToken.serialize,
}))

// known finished pools
// 结束的池子
const finishedPools = [].map((p) => ({
  ...p,
  isFinished: true, // 表示结束状态的字断
  stakingToken: p.stakingToken.serialize,
  earningToken: p.earningToken.serialize,
}))

// let a = 2;
// setInterval(() => {
//   a++;
// }, 500);

// import dynamic from 'next/dynamic'

const allPool = {
  pools: [...livePools, ...finishedPools] as Pool.SerializedPoolConfig<SerializedWrappedToken>[]
};
// @ts-ignore
// const c = dynamic(() => import('./pools-dynamic'), { ssr: false })
// window.addEventListener('storage', () => {
//   console.log("CHANGED!!!");
// });
export {allPool};
export default [] as Pool.SerializedPoolConfig<SerializedWrappedToken>[]

// export default (data ? JSON.parse(data) : [...livePools, ...finishedPools]) as Pool.SerializedPoolConfig<SerializedWrappedToken>[]
