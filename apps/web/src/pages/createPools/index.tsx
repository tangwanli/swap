import { useAccount } from 'wagmi'
import React, { Fragment, useState, useEffect } from 'react'
// import 'bootstrap/dist/css/bootstrap.min.css'
// eslint-disable-next-line import/extensions
// import 'bootstrap/dist/js/bootstrap.min.js'
import { ethers } from 'ethers'
// import pools from 'config/constants/pools'
import { allPool } from 'config/constants/pools'
import useTheme from 'hooks/useTheme'

import {
  Box,
  Step,
  Stepper,
  Card,
  CardBody,
  CardFooter,
  Heading,
  IconButton,
  PageSection,
  Slider,
  Row,
  AddIcon,
  MinusIcon,
  Button,
  PageHeader,
  Image,
  Flex,
} from '@pancakeswap/uikit'
import StepOne from './StepOne'
import StepTwo from './StepTwo'
import StepThree from './StepThree'
import StepFour from './StepFour'
// import PageTitle from "./PageTitle";
import ErrorMessage from '../nfts/ErrorMessage'
// import './Wizard.css'

import CreatePoolABI from '../pools/ABI/CreatePool.json'

// const pools = allPool.pools

const CreatePoolContract = '0x06Fac7297B44821331cB54869Db0aE20340950BD'
const headerHeight = '60px'
const customHeadingColor = '#7645D9'
const gradientStopPoint = `calc(${headerHeight} + 1px)`

const CreatePools = () => {
  const { pools } = allPool
  const { theme } = useTheme()

  const { address: account } = useAccount()
  // const { account } = props
  const gradientBorderColor = `linear-gradient(transparent ${gradientStopPoint}, ${theme.colors.cardBorder} ${gradientStopPoint}), ${theme.colors.gradientCardHeader}`

  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [contract, setContract] = useState(null)

  const updateEthers = async () => {
    try {
      // @ts-ignore
      const tempProvider = new ethers.providers.Web3Provider(window.ethereum)
      setProvider(tempProvider)

      const tempSigner = tempProvider.getSigner()
      setSigner(tempSigner)

      const tempContract = new ethers.Contract(CreatePoolContract, CreatePoolABI, tempSigner)
      setContract(tempContract)
    } catch {
      console.log('1')
    }
  }

  useEffect(() => {
    updateEthers()
  }, [account])

  const [goSteps, setGoSteps] = useState(0)

  //  Step One
  const [stakingToken, setStakingToken] = useState(null)
  const [rewardToken, setRewardToken] = useState(null)
  const [startTime, setStartTime] = useState(null)
  const [endTime, setEndTime] = useState(null)
  const [rewardPerBlock, setRewardPerBlock] = useState(null)

  //  Step Two
  const [owner, setOwner] = useState(null)

  const [isLoading, setIsLoading] = useState(false)
  const [isRejected, setIsRejected] = useState(false)

  //  Error Text
  const [errorText, setErrorText] = useState(null)

  const handleStepOneSubmit = (_stakingToken, _rewardToken, _startTime, _endTime, _rewardPerBlock) => {
    setStakingToken(_stakingToken)
    setRewardToken(_rewardToken)
    setStartTime(_startTime)
    setEndTime(_endTime)
    setRewardPerBlock(_rewardPerBlock)
    setGoSteps(1)
  }

  const handleStepTwoSubmit = (_owner) => {
    setOwner(_owner)
  }

  return (
    <>
      <style jsx global>
        {`
          #home-2 .page-bg {
            background: linear-gradient(180deg, #ffffff 22%, #efe0b1 100%);
          }
          #home-2 {
            position: relative;
          }
          [data-theme='dark'] #home-2 .page-bg {
            background: linear-gradient(180deg, #09070c 22%, #201335 100%);
          }
          .amount {
            font-weight: bold;
            font-size: 18px;
          }
          .form-wizard {
            display: flex;
            padding: 15px;
          }
          .step-content {
            flex: 1;
          }
        `}
      </style>
      <>{!!errorText && <ErrorMessage errorMessage={errorText} setErrorText={setErrorText} />}</>
      <PageHeader>
        <Flex justifyContent="space-between" flexDirection={['column', null, null, 'row']}>
          <Flex flex="1" flexDirection="column" mr={['8px', 0]}>
            <Heading as="h1" scale="xxl" color="secondary" mb="24px">
              BNBTiger Create Pools
            </Heading>
            <Heading scale="md" color="text">
              Just Create Pools.
            </Heading>
            {/* <Heading scale="md" color="text">
              High APR.
            </Heading> */}
          </Flex>

          <Image
            mx="auto"
            mt="12px"
            // src="/images/decorations/3d-syrup-bunnies.png"
            src="/images/decorations/bnbtiger.png"
            alt="Pancake illustration"
            width={192}
            height={184.5}
          />
        </Flex>
      </PageHeader>
      <PageSection
        innerProps={{ style: { margin: '0', width: '100%', padding: 0, textAlign: 'center' } }}
        background={theme.colors.background}
        index={2}
        containerProps={{
          id: 'home-2',
        }}
        hasCurvedDivider={false}
      >
        <Row justifyContent="center">
          <Card borderBackground={gradientBorderColor} style={{ minWidth: '100%' }}>
            <div className="form-wizard">
              <div>
                <Stepper>
                  {[1, 2, 3, 4].map((_, index) => (
                    <Step
                      // eslint-disable-next-line react/no-array-index-key
                      key={index}
                      index={index}
                      // @ts-ignore
                      statusFirstPart={goSteps === index ? 'current' : 'past'}
                      // @ts-ignore
                      statusSecondPart={goSteps > index ? 'current' : 'future'}
                      numberOfSteps={4}
                    />
                  ))}
                </Stepper>
              </div>
              <div className="step-content">
                {goSteps === 0 && (
                  <>
                    <StepOne
                      defaultAccount={account}
                      provider={provider}
                      stakingTokenValue={stakingToken}
                      rewardTokenValue={rewardToken}
                      startTimeValue={startTime}
                      endTimeValue={endTime}
                      rewardPerBlockValue={rewardPerBlock}
                      setErrorText={setErrorText}
                      onSubmit={handleStepOneSubmit}
                    />
                  </>
                )}
                {goSteps === 1 && (
                  <>
                    <StepTwo
                      setGoSteps={setGoSteps}
                      defaultAccount={account}
                      ownerValue={owner}
                      onSubmit={handleStepTwoSubmit}
                    />
                  </>
                )}
                {goSteps === 2 && (
                  <>
                    <StepThree
                      defaultAccount={account}
                      provider={provider}
                      signer={signer}
                      contract={contract}
                      stakingTokenValue={stakingToken}
                      rewardTokenValue={rewardToken}
                      startTimeValue={startTime}
                      endTimeValue={endTime}
                      rewardPerBlockValue={rewardPerBlock}
                      ownerValue={owner}
                      setErrorText={setErrorText}
                      setGoSteps={setGoSteps}
                      setIsLoading={setIsLoading}
                      setIsRejected={setIsRejected}
                    />
                  </>
                )}
                {goSteps === 3 && (
                  <>
                    <StepFour
                      isLoading={isLoading}
                      isRejected={isRejected}
                      setGoSteps={setGoSteps}
                      setIsRejected={setIsRejected}
                    />
                  </>
                )}
              </div>
            </div>
          </Card>
        </Row>
      </PageSection>
    </>
  )
}

export default CreatePools
