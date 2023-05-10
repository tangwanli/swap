import React, { Fragment, useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { ChainId, ERC20Token } from '@pancakeswap/sdk'
import { allPool } from 'config/constants/pools'
import { PoolCategory } from '@pancakeswap/uikit/src/widgets/Pool'
import { bscTokens } from '@pancakeswap/tokens'
import { batch, useSelector } from 'react-redux'
import { useAppDispatch } from 'state'
import { setInitPoolsData } from 'state/pools'
import { useActiveChainId } from 'hooks/useActiveChainId'
import TokenABI from './pools/ABI/TokenABI.json'
import CreatePoolABI from './pools/ABI/CreatePool.json'

const CreatePoolContract = '0x06Fac7297B44821331cB54869Db0aE20340950BD'

const useInitPoolHook = () => {
  const dispatch = useAppDispatch()

  const chainId = useActiveChainId()

  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [contract, setContract] = useState(null)

  const [poolData, setPoolData] = useState([])
  const [runningPool, setRunningPool] = useState([])
  const [endPool, setEndPool] = useState([])

  const [blockNumber, setBlockNumber] = useState(0)
  const [isInit, setIsInit] = useState(false)

  const filterData = async (poolsData, _provider, _tempSigner) => {
    const tempChainId = typeof chainId === 'number' ? chainId : chainId.chainId
    try {
      const block = await _provider.getBlock('latest', false, true)
      const tempRunningPool = []
      const tempEndPool = []
      for (let i = 0; i < poolsData.length; i++) {
        const [id, tempStakingToken, tempEarningToken, ...rest] = poolsData[i]
        //  結束區塊。
        // eslint-disable-next-line camelcase
        const i_endBlock = ethers.utils.formatUnits(poolsData[i][6], '0')
        // eslint-disable-next-line camelcase
        const i_startBlock = ethers.utils.formatUnits(poolsData[i][8], '0')
        // 第三个参数，传provider和sign的区别是；provider不用交易，但是signer是必须要进行交易的.0xC75Cc71022Bf0EC150dfC03d954737ce027Ea12e
        const tempTokenContract = new ethers.Contract(tempStakingToken, TokenABI, _tempSigner)
        // eslint-disable-next-line no-await-in-loop
        const name = await tempTokenContract.name()
        // eslint-disable-next-line no-await-in-loop
        const symbol = await tempTokenContract.symbol()
        // eslint-disable-next-line no-await-in-loop
        const decimals = await tempTokenContract.decimals()
        // const a = new ERC20Token(
        //   ChainId.BSC_TESTNET,
        //   '0x3304dd20f6Fe094Cb0134a6c8ae07EcE26c7b6A7',
        //   18,
        //   'BUSD',
        //   'Binance USD',
        // )
        const a = new ERC20Token(tempChainId, tempStakingToken, decimals, name, symbol, '')
        // 第三个参数，传provider和sign的区别是；provider不用交易，但是signer是必须要进行交易的
        const tempTokenContract2 = new ethers.Contract(tempEarningToken, TokenABI, _tempSigner)
        // eslint-disable-next-line no-await-in-loop
        const name2 = await tempTokenContract2.name()
        // eslint-disable-next-line no-await-in-loop
        const symbol2 = await tempTokenContract2.symbol()
        // eslint-disable-next-line no-await-in-loop
        const decimals2 = await tempTokenContract2.decimals()
        // const b = new ERC20Token(
        //   tempChainId,
        //   '0xE02dF9e3e622DeBdD69fb838bB799E3F168902c5',
        //   18,
        //   'BAKE',
        //   'Bakeryswap Token',
        //   'https://www.bakeryswap.org/',
        // )
        const b = new ERC20Token(tempChainId, tempEarningToken, decimals2, name2, symbol2, '')
        let foreverTime = 0
        // 开始区块大于现在区块，说明还未开始
        // eslint-disable-next-line camelcase
        if (+i_startBlock > block.number) {
          // eslint-disable-next-line camelcase
          foreverTime = new Date().getTime() + (+i_startBlock - block.number) * 3000
        }
        //  結束區塊 < 現在區塊 => 已結束
        // eslint-disable-next-line camelcase
        // eslint-disable-next-line camelcase
        if (i_endBlock < block.number) {
          tempEndPool.push([id, a, b, ...rest])
        } else {
          tempRunningPool.push([id, a, b, ...rest])
          if (foreverTime) {
            tempRunningPool[tempRunningPool.length - 1].push({ foreverTime })
          }
        }
      }
      const tempData = [
        ...tempRunningPool.map((item) => {
          return {
            // 最后面的0是表示要在当前值后面乘以10的多少次方；默认是18，即要在当前值乘以10的18次方 。这个方法是用来把wei转换为wei的
            sousId: +ethers.utils.formatUnits(item?.[0], '0') + 1,
            stakingToken: item?.[1]?.serialize,
            earningToken: item?.[2]?.serialize,
            contractAddress: {
              97: item?.[3],
              56: item?.[3],
            },
            poolCategory: item?.[4],
            tokenPerBlock: ethers.utils.formatUnits(item?.[5], +ethers.utils.formatUnits(item?.[7], '0')),
            foreverTime: item?.[item?.length - 1]?.foreverTime ? item?.[item?.length - 1]?.foreverTime : undefined,
          }
        }),
        ...tempEndPool.map((item) => {
          return {
            sousId: +ethers.utils.formatUnits(item?.[0], '0') + 1,
            stakingToken: item?.[1]?.serialize,
            earningToken: item?.[2]?.serialize,
            contractAddress: {
              97: item?.[3],
              56: item?.[3],
            },
            poolCategory: item?.[4],
            // TODO: 此处的精度可能是需要进行修改的
            tokenPerBlock: ethers.utils.formatUnits(item?.[5], +ethers.utils.formatUnits(item?.[7], '0')),
            isFinished: true, // 表示结束状态的字断
          }
        }),
      ]
      // tempData.unshift({
      //   sousId: 0, // 这个0，代表cake池子，即第一个池子
      //   stakingToken: bscTokens.cake.serialize,
      //   earningToken: bscTokens.cake?.serialize,
      //   contractAddress: {
      //     97: '0xB4A466911556e39210a6bB2FaECBB59E4eB7E43d',
      //     56: '0xa5f8C5Dbd5F286960b9d90548680aE5ebFf07652',
      //   },
      //   poolCategory: PoolCategory.CORE,
      //   tokenPerBlock: '10',
      // },);
      // @ts-ignore
      allPool.pools = tempData.filter(({ foreverTime, ...rest }) => {
        return {
          ...rest,
        }
      })
      batch(() => {
        dispatch(
          setInitPoolsData(
            // @ts-ignore
            tempData.filter(({ foreverTime, ...rest }) => {
              return {
                ...rest,
              }
            }),
          ),
        )
      })
      sessionStorage.setItem('pool', JSON.stringify(tempData))
      setIsInit(true)
      // @ts-ignore
      window.isLoadingPool = false
      // @ts-ignore
      window.isInitPool = true
    } catch (err) {
      // @ts-ignore
      window.isLoadingPool = false
    }
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
    // setIsFiltered(true)
  }

  const updateEthers = async () => {
    console.log('Updating Ethers')
    try {
      // @ts-ignore
      const tempProvider = new ethers.providers.Web3Provider(window.ethereum)
      setProvider(tempProvider)

      const tempSigner = tempProvider.getSigner()
      setSigner(tempSigner)

      const tempContract = new ethers.Contract(CreatePoolContract, CreatePoolABI, tempSigner)
      setContract(tempContract)

      const poolsData = await tempContract.viewSmartChef()
      console.log(poolsData)

      //  當緩存中的poolData的長度 與 獲取到的PoolData長度相同時
      //  表示原有的PoolData沒有增加，故不用繼續進行更新
      if (poolsData.length === allPool.pools.length) return

      if (poolsData !== null) {
        filterData(poolsData, tempProvider, tempSigner)
        return
      }
      // @ts-ignore
      window.isLoadingPool = false
    } catch (err) {
      // @ts-ignore
      window.isLoadingPool = false
    }
  }

  const initPool = () => {
    // 如果已经初始化过了，就直接return
    // @ts-ignore
    if (window.isInitPool) {
      return
    }
    const data = sessionStorage.getItem('pool')
    // 如果值存到了session里面，就从session里面读值，来初始化 state；并且把初始化状态改为true
    if (data) {
      allPool.pools = JSON.parse(data)
      console.log(allPool.pools)
      console.log(allPool.pools.length)
      batch(() => {
        dispatch(setInitPoolsData(JSON.parse(data)))
      })
      // @ts-ignore
      window.isInitPool = true
      //  把這個return 去掉 每次進入礦池還是先讀取
      //  詳見updateEthers中的 line: 172
      // return
    }
    // @ts-ignore
    if (!window.isLoadingPool) {
      // @ts-ignore
      window.isLoadingPool = true
      updateEthers()
    }
  }

  // 对于这里的使用，如果session里面没值，就先调用initPool，然后取poolData；如果session有值，就直接取session得到值
  return {
    initPool,
    isInit,
  }
}

export default useInitPoolHook
