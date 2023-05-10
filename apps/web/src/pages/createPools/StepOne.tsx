import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { Button, Input, Text, Row } from '@pancakeswap/uikit'
import TokenABI from '../pools/ABI/TokenABI.json'
import ErrorMessage from '../nfts/ErrorMessage'

const StepOne = ({
  defaultAccount,
  provider,
  stakingTokenValue,
  rewardTokenValue,
  startTimeValue,
  endTimeValue,
  rewardPerBlockValue,
  setErrorText,
  onSubmit,
}) => {
  const [stakingToken, setStakingToken] = useState(stakingTokenValue)
  const [rewardToken, setRewardToken] = useState(rewardTokenValue)
  const [startTime, setStartTime] = useState(startTimeValue)
  const [endTime, setEndTime] = useState(endTimeValue)
  const [rewardPerBlock, setRewardPerBlock] = useState(rewardPerBlockValue)

  const [stakingName, setStakingName] = useState(null)
  const [rewardName, setRewardName] = useState(null)
  const [rewardTokenBalance, setRewardTokenBalance] = useState(0)

  useEffect(() => {
    const loadToken = async () => {
      if (stakingTokenValue !== null) {
        const { success, nameSymbol } = await getName(stakingToken)
        if (!success) return
        setStakingName(nameSymbol)
      }

      if (rewardTokenValue !== null) {
        const { success, nameSymbol } = await getName(rewardToken)
        if (!success) return
        setRewardName(nameSymbol)
        getBalance(rewardToken)
      }
    }
    loadToken()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stakingTokenValue, rewardTokenValue])

  const getName = async (value) => {
    // eslint-disable-next-line eqeqeq
    if (value.length == 42) {
      const tempTokenContract = new ethers.Contract(value, TokenABI, provider)
      const name = await tempTokenContract.name()
      const symbol = await tempTokenContract.symbol()
      return { success: true, nameSymbol: `${name}/${symbol}` }
    }
    return { success: false }
  }

  const getBalance = async (value) => {
    // eslint-disable-next-line eqeqeq
    if (value.length == 42) {
      const tempTokenContract = new ethers.Contract(value, TokenABI, provider)
      const balance = await tempTokenContract.balanceOf(defaultAccount)
      const decimals = await tempTokenContract.decimals()
      const realBalance = convertBalance(balance, decimals)
      // @ts-ignore
      setRewardTokenBalance(realBalance)
    }
  }

  const convertTime = (value) => {
    const datetime = new Date(value)
    const timestamp = datetime.getTime()
    return timestamp
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

  const isAddress = async (string, address) => {
    if (ethers.utils.isAddress(address)) {
      return true
    }
    // eslint-disable-next-line no-alert
    alert(`${string} : ${address} is not an address`)
    return false
  }

  function convertBalance(balance, decimals) {
    return ethers.utils.formatUnits(balance.toString(), decimals)
  }

  const datas = [
    {
      title: 'Staking Token',
      placeHolder: 'The token going to be staked',
      type: 'text',
      function: async (e) => {
        setStakingToken(e.target.value)
        const { success, nameSymbol } = await getName(e.target.value)
        if (!success) return
        setStakingName(nameSymbol)
      },
      value: stakingToken,
      name: stakingName,
    },
    {
      title: 'Reward Token',
      placeHolder: 'The token benefits from staking',
      type: 'text',
      function: async (e) => {
        setRewardToken(e.target.value)
        const { success, nameSymbol } = await getName(e.target.value)
        if (!success) return
        setRewardName(nameSymbol)
        getBalance(e.target.value)
      },
      value: rewardToken,
      name: rewardName,
    },
    {
      title: 'Start Time',
      placeHolder: 'The start time of your staking pool',
      type: 'datetime-local',
      function: (e) => setStartTime(convertTime(e.target.value)),
      value: convertBackTime(startTime),
    },
    {
      title: 'End Time',
      placeHolder: 'The end time of your staking pool',
      type: 'datetime-local',
      function: (e) => setEndTime(convertTime(e.target.value)),
      value: convertBackTime(endTime),
    },
    {
      title: 'Reward Per Second',
      placeHolder: 'Tokens the rewards in a second',
      type: 'number',
      function: (e) => setRewardPerBlock(e.target.value),
      value: rewardPerBlock,
      balance: rewardTokenBalance,
    },
  ]

  const handleStepOneSubmit = async (_stakingToken, _rewardToken, _startTime, _endTime, _rewardPerBlock) => {
    //  檢查是否都有值
    const fields = [
      { value: _stakingToken, name: 'staking token' },
      { value: _rewardToken, name: 'reward token' },
      { value: _startTime, name: 'start time' },
      { value: _endTime, name: 'end time' },
      { value: _rewardPerBlock, name: 'reward per second' },
    ]

    for (const field of fields) {
      if (!field.value) {
        setErrorText(`The ${field.name} is missing, please fill it in.`)
        return
      }
    }

    //  檢查合約是否都為地址
    const stakingString = 'Staking Token '
    const rewardString = 'Reward Token '

    const result1 = await isAddress(stakingString, _stakingToken)
    // eslint-disable-next-line eqeqeq
    if (result1 == false) return

    const result2 = await isAddress(rewardString, _rewardToken)
    // eslint-disable-next-line eqeqeq
    if (result2 == false) return

    //  不可質押自己 獎勵自己
    // eslint-disable-next-line eqeqeq
    if (_rewardToken == _stakingToken) {
      setErrorText('Reward Token Cannot Be The Same As Staking Token')
      return
    }

    //  時間規則：
    //  1.  結束時間需在開始時間後
    //  2.  結束時間需在現在時間後
    if (_endTime <= _startTime) {
      setErrorText('Time Error, The End Time should be set after the Start Time')
      return
    }
    const now = new Date().getTime()
    if (_endTime <= now) {
      setErrorText('Time Error, The End Time should be set after now')
      return
    }

    onSubmit(_stakingToken, _rewardToken, _startTime, _endTime, _rewardPerBlock)
  }

  return (
    <>
      <style jsx global>
        {`
          .step-one-item {
            display: flex;
            flex-direction: column;
            height: 100%;
          }
          .step-one-item .footer {
            display: flex;
            justify-content: flex-end;
            margin-top: 8px;
          }
          .row {
            display: grid;
            grid-template-columns: repeat(1, 1fr);
            gap: 20px 20px;
          }
        `}
      </style>
      <section className="step-one-item">
        <div className="row">
          {datas.map((data, index) => {
            return (
              <div key={data.title} className="col-lg-6 mb-2">
                <div className="form-group mb-3">
                  <Text bold style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    {data.title}
                    {data.name !== null && data.name !== undefined && (
                      <span style={{ paddingRight: '10px' }}>{` ${data.name}`}</span>
                    )}
                  </Text>
                  <Input
                    type={data.type}
                    name="firstName"
                    placeholder={data.placeHolder}
                    defaultValue={data.value}
                    autoComplete="off"
                    onChange={data.function}
                  />
                  {data.balance !== 0 && data.balance !== undefined && (
                    <div>
                      <Text bold> Reward Token Balance : {data.balance}</Text>
                      <br />
                    </div>
                  )}
                  {data.balance !== 0 &&
                    data.balance !== undefined &&
                    startTime !== null &&
                    endTime !== null &&
                    endTime > startTime && (
                      <Text bold>
                        {(rewardPerBlock * (endTime - startTime)) / 1000 > data.balance
                          ? 'Not Enough Token'
                          : `Required Amount : ${(rewardPerBlock * (endTime - startTime)) / 1000}`}
                      </Text>
                    )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="footer">
          <Button
            type="button"
            variant="success"
            onClick={() => handleStepOneSubmit(stakingToken, rewardToken, startTime, endTime, rewardPerBlock)}
          >
            Next
          </Button>
          {/* <button className="btn btn-primary sw-btn-next">111</button> */}
        </div>
        {/* <div className="text-end toolbar toolbar-bottom p-2">

            </div> */}
        {/* <Button width="100%" mt="24px" variant="bubblegum" style={{border: '1px solid grey',}} onClick={handleMint}>Mint</Button> */}
      </section>
    </>
  )
}

export default StepOne
