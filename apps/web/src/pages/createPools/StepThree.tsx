import React from 'react'
import { ethers } from 'ethers'
import { Button, Card, Table, Th, Td, Box, Heading } from '@pancakeswap/uikit'
import useTheme from 'hooks/useTheme'
import TokenABI from '../pools/ABI/TokenABI.json'
// import { Button, Card, Table, Th, Td } from '@pancakeswap/uikit'

const headerHeight = '60px'
const customHeadingColor = '#7645D9'
const gradientStopPoint = `calc(${headerHeight} + 1px)`

const StepThree = (props) => {
  const {
    defaultAccount,
    provider,
    signer,
    contract,
    stakingTokenValue,
    rewardTokenValue,
    startTimeValue,
    endTimeValue,
    rewardPerBlockValue,
    ownerValue,
    setErrorText,
    setGoSteps,
    setIsLoading,
    setIsRejected,
  } = props

  const { theme } = useTheme()
  const gradientBorderColor = `linear-gradient(transparent ${gradientStopPoint}, ${theme.colors.cardBorder} ${gradientStopPoint}), ${theme.colors.gradientCardHeader}`

  const BlockTime = 3

  const checkAllowance = async () => {
    try {
      const rewardContract = new ethers.Contract(rewardTokenValue, TokenABI, signer)

      // 已授權的數量
      const approvedAmount = await rewardContract.allowance(defaultAccount, contract.address)

      // 該授權的數量
      const decimal = await rewardContract.decimals()
      const approvingAmount = ethers.utils.parseUnits(`${requiredAmount()}`, decimal)

      if (+approvedAmount >= +approvingAmount) createPool()
      else approve()
    } catch (err) {
      setErrorText(err.toString())
    }
  }

  const checkAllowanceAgain = async () => {
    const rewardContract = new ethers.Contract(rewardTokenValue, TokenABI, signer)

    // 已授權的數量
    const approvedAmount = await rewardContract.allowance(defaultAccount, contract.address)

    // 該授權的數量
    const decimal = await rewardContract.decimals()
    const approvingAmount = ethers.utils.parseUnits(`${requiredAmount()}`, decimal)

    if (+approvedAmount >= +approvingAmount) createPool()
    else setTimeout(() => checkAllowanceAgain(), 3000)
  }

  const approve = async () => {
    try {
      const rewardContract = new ethers.Contract(rewardTokenValue, TokenABI, signer)

      // 代幣精度
      const decimal = await rewardContract.decimals()

      // 即將授權數量
      const approvingAmount = ethers.utils.parseUnits(`${requiredAmount()}`, decimal)

      // 授權
      const result = await rewardContract.approve(contract.address, approvingAmount)

      checkAllowanceAgain()
    } catch (err) {
      // @ts-ignore
      setErrorText(err.reason)
    }
  }

  const requiredAmount = () => {
    return (rewardPerBlockValue * (endTimeValue - startTimeValue)) / 1000
  }

  const checkAllowanceApproveAndCreatePool = async () => {
    try {
      checkAllowance()
    } catch (err) {
      // @ts-ignore
      setErrorText(err.reason)
    }
  }

  const createPool = async () => {
    const rewardContract = new ethers.Contract(rewardTokenValue, TokenABI, signer)

    // 代幣精度
    const decimal = await rewardContract.decimals()
    const sendingAmount = ethers.utils.parseUnits(`${requiredAmount()}`, decimal)

    //  創建礦池費用
    const createPoolFee = ethers.utils.parseUnits('0.2', 'ether')

    try {
      const result = await contract.deployPool(
        stakingTokenValue,
        rewardTokenValue,
        ethers.utils.parseUnits(`${rewardPerBlockValue * BlockTime}`, decimal), // 每秒的獎勵 x 一區塊幾秒
        getBlockNumber(startTimeValue), // 轉換成區塊時間
        getBlockNumber(endTimeValue),
        0,
        0,
        ownerValue,
        sendingAmount,
        {
          value: createPoolFee,
        },
      )

      setIsLoading(false)
    } catch (err: any) {
      // eslint-disable-next-line eqeqeq
      if (err?.reason != null || err?.reason != undefined) setErrorText(err.reason)
      else setErrorText(err.toString())
      setIsLoading(false)
      setIsRejected(true)
    }
  }

  const getBlockNumber = async (timestamp) => {
    const block = await provider.getBlock('latest', false, true)
    const blockNumber = await provider.getBlockNumber()

    const convertedBlockNumber = blockNumber - Math.floor((block.timestamp - timestamp / 1000) / BlockTime)
    return convertedBlockNumber
  }

  const convertBackTime = (value) => {
    const date = new Date(value)
    const year = date.getFullYear().toString().padStart(4, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const hour = date.getHours().toString().padStart(2, '0')
    const minute = date.getMinutes().toString().padStart(2, '0')
    const datetimeLocalString = `${year}-${month}-${day}T${hour}:${minute}`
    return datetimeLocalString
  }
  const datas = [
    {
      title: 'Staking Token',
      placeHolder: 'The token going to be staked',
      type: 'text',
      value: stakingTokenValue,
    },
    {
      title: 'Reward Token',
      placeHolder: 'The token benefits from staking',
      type: 'text',
      value: rewardTokenValue,
    },
    {
      title: 'Start Time',
      placeHolder: 'The start time of your staking pool',
      type: 'datetime-local',
      value: convertBackTime(startTimeValue),
    },
    {
      title: 'End Time',
      placeHolder: 'The end time of your staking pool',
      type: 'datetime-local',
      value: convertBackTime(endTimeValue),
    },
    {
      title: 'Reward Per Second',
      placeHolder: 'Tokens the rewards in a second',
      type: 'number',
      value: rewardPerBlockValue,
    },
    {
      title: 'Reward Token Needed',
      placeHolder: 'Tokens the rewards in a second',
      type: 'number',
      value: requiredAmount(),
    },
    {
      title: 'Owner',
      placeHolder: 'The owner of the staking contract',
      type: 'text',
      value: ownerValue,
    },
  ]

  const style = {
    paddingLeft: '10vw',
    maxWidth: '60vw',
  }
  return (
    <>
      <style jsx global>
        {`
          .step-two-item {
            display: flex;
            flex-direction: column;
            height: 100%;
          }
          .step-two-item .content {
            display: flex;
            justify-content: center;
            margin: 20px 10px;
          }
          .step-two-item .footer {
            display: flex;
            justify-content: flex-end;
            margin-top: auto;
          }
          .text-label {
            margin-bottom: 5px;
          }
          .card thead tr th {
            font-size: 18px;
          }
          .card tbody tr td {
            word-break: break-all;
          }
        `}
      </style>
      <section className="step-two-item">
        <div className="content" style={{ width: '100%' }}>
          <Card className="card" style={{ width: '100%' }} isWarning>
            <Box background={theme.colors.gradientCardHeader} p="16px" height={headerHeight}>
              <Heading size="xl">Pool Information</Heading>
            </Box>
            <Table>
              <thead>
                <tr>
                  <Th>Parameter</Th>
                  <Th>Value</Th>
                </tr>
              </thead>
              <tbody>
                {datas.map((data, index) => (
                  <tr key={data.title}>
                    <Td>{data.title}</Td>
                    <Td>{data.value}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </div>

        <div className="footer">
          <Button mr="8px" type="button" variant="light" onClick={() => setGoSteps(1)}>
            Prev
          </Button>
          <Button
            type="button"
            variant="success"
            onClick={() => {
              checkAllowanceApproveAndCreatePool()
              setGoSteps(3)
              setIsLoading(true)
            }}
          >
            Next
          </Button>
        </div>
        {/* <div className="text-end toolbar toolbar-bottom p-2">
            <button className="btn btn-secondary sw-btn-prev me-1" onClick={() => setGoSteps(1)}>Prev</button>
            <button className="btn btn-primary sw-btn-next ms-1" onClick={() => {
               checkAllowanceApproveAndCreatePool();
               setGoSteps(3)
               setIsLoading(true)
            }}>Next</button>
         </div> */}
      </section>
    </>
  )
}

export default StepThree
