import BigNumber from 'bignumber.js'
import { multicallv2, multicallv3 } from 'utils/multicall'
import cakeAbi from 'config/abi/cake.json'
import cakeVaultAbi from 'config/abi/cakeVaultV2.json'
import { getCakeVaultAddress, getCakeFlexibleSideVaultAddress } from 'utils/addressHelpers'
import { BIG_ZERO } from '@pancakeswap/utils/bigNumber'
import { ChainId } from '@pancakeswap/sdk'
import { CAKE } from '@pancakeswap/tokens'

// const cakeVaultV2 = getCakeVaultAddress()
const cakeFlexibleSideVaultV2 = getCakeFlexibleSideVaultAddress()
export const fetchPublicVaultData = async (chainId = ChainId.BSC) => {
  const cakeVaultAddress = getCakeVaultAddress(chainId)
  const cakeVaultV2 = getCakeVaultAddress()
  try {
    const calls = ['getPricePerFullShare', 'totalShares', 'totalLockedAmount'].map((method) => ({
      abi: cakeVaultAbi,
      address: cakeVaultAddress,
      name: method,
    }))

    const cakeBalanceOfCall = {
      abi: cakeAbi,
      address: CAKE[ChainId.BSC].address,
      name: 'balanceOf',
      params: [cakeVaultV2],
    }

    const [[sharePrice], [shares], totalLockedAmount, [totalCakeInVault]] = await multicallv3({
      calls: [...calls, cakeBalanceOfCall],
      allowFailure: true,
      chainId
    })

    const totalSharesAsBigNumber = shares ? new BigNumber(shares.toString()) : BIG_ZERO
    const totalLockedAmountAsBigNumber = totalLockedAmount ? new BigNumber(totalLockedAmount[0].toString()) : BIG_ZERO
    const sharePriceAsBigNumber = sharePrice ? new BigNumber(sharePrice.toString()) : BIG_ZERO
    return {
      totalShares: totalSharesAsBigNumber.toJSON(),
      totalLockedAmount: totalLockedAmountAsBigNumber.toJSON(),
      pricePerFullShare: sharePriceAsBigNumber.toJSON(),
      totalCakeInVault: new BigNumber(totalCakeInVault.toString()).toJSON(),
    }
  } catch (error) {
    return {
      totalShares: null,
      totalLockedAmount: null,
      pricePerFullShare: null,
      totalCakeInVault: null,
    }
  }
}

export const fetchPublicFlexibleSideVaultData = async (chainId = ChainId.BSC) => {
  const cakeVaultAddress = getCakeFlexibleSideVaultAddress(chainId)
  try {
    const calls = ['getPricePerFullShare', 'totalShares'].map((method) => ({
      abi: cakeVaultAbi,
      address: cakeVaultAddress,
      name: method,
    }))

    const cakeBalanceOfCall = {
      abi: cakeAbi,
      address: CAKE[ChainId.BSC].address,
      name: 'balanceOf',
      params: [cakeVaultAddress],
    }

    const [[sharePrice], [shares], [totalCakeInVault]] = await multicallv3({
      calls: [...calls, cakeBalanceOfCall],
      allowFailure: true,
      chainId
    })

    const totalSharesAsBigNumber = shares ? new BigNumber(shares.toString()) : BIG_ZERO
    const sharePriceAsBigNumber = sharePrice ? new BigNumber(sharePrice.toString()) : BIG_ZERO
    return {
      totalShares: totalSharesAsBigNumber.toJSON(),
      pricePerFullShare: sharePriceAsBigNumber.toJSON(),
      totalCakeInVault: new BigNumber(totalCakeInVault.toString()).toJSON(),
    }
  } catch (error) {
    return {
      totalShares: null,
      pricePerFullShare: null,
      totalCakeInVault: null,
    }
  }
}

export const fetchVaultFees = async (chainId = ChainId.BSC, innerCakeVaultAddress?) => {
  const cakeVaultAddress = innerCakeVaultAddress ?? getCakeVaultAddress(chainId)
  try {
    const calls = ['performanceFee', 'withdrawFee', 'withdrawFeePeriod'].map((method) => ({
      address: cakeVaultAddress,
      name: method,
    }))

    const [[performanceFee], [withdrawalFee], [withdrawalFeePeriod]] = await multicallv2({ abi: cakeVaultAbi, calls,chainId })

    return {
      performanceFee: performanceFee.toNumber(),
      withdrawalFee: withdrawalFee.toNumber(),
      withdrawalFeePeriod: withdrawalFeePeriod.toNumber(),
    }
  } catch (error) {
    return {
      performanceFee: null,
      withdrawalFee: null,
      withdrawalFeePeriod: null,
    }
  }
}

export default fetchPublicVaultData
