import BigNumber from 'bignumber.js'
import { UNLOCK_FREE_DURATION } from 'config/constants/pools'

export const isStaked = ({ userShares }: { userShares?: BigNumber }): boolean => userShares && userShares.gt(0)

export const isLocked = ({ userShares, locked }: { userShares?: BigNumber; locked?: boolean }): boolean =>
  isStaked({ userShares }) && Boolean(locked) // && !isAfter(new Date(lockEndTime * 1000), new Date())

export const isLockedEnd = ({ userShares, locked, lockEndTime }: VaultPositionParams): boolean =>
  lockEndTime &&
  lockEndTime !== '0' &&
  isLocked({ userShares, locked }) &&
  Date.now() >= parseInt(lockEndTime) * 1000 &&
  Date.now() <= new Date(parseInt(lockEndTime) * 1000).getTime() + UNLOCK_FREE_DURATION * 1000

export const isAfterBurning = ({ userShares, locked, lockEndTime }: VaultPositionParams): boolean =>
  lockEndTime &&
  lockEndTime !== '0' &&
  isLocked({ userShares, locked }) &&
  Date.now() > new Date(parseInt(lockEndTime) * 1000).getTime() + UNLOCK_FREE_DURATION * 1000

  // 池子的锁仓状态
export enum VaultPosition {
  None, // 无状态
  Flexible, // 这个应该是随时可以取出来，灵活模式
  Locked, // 锁仓模式，正在锁仓
  LockedEnd, // 锁仓模式，锁仓时间结束，可以取出
  AfterBurning, // 这个应该是结束锁仓
}

export type VaultPositionParams = { userShares?: BigNumber; locked?: boolean; lockEndTime?: string }

export const getVaultPosition = (params: VaultPositionParams): VaultPosition => {
  if (isAfterBurning(params)) {
    return VaultPosition.AfterBurning
  }
  if (isLockedEnd(params)) {
    return VaultPosition.LockedEnd
  }
  if (isLocked(params)) {
    return VaultPosition.Locked
  }
  if (isStaked(params)) {
    return VaultPosition.Flexible
  }
  return VaultPosition.None
}
