import { useMemo } from 'react'
import useGetPublicIfoV3Data from 'views/Ifos/hooks/v3/useGetPublicIfoData'
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
import useGetWalletIfoV3Data from 'views/Ifos/hooks/v3/useGetWalletIfoData'

import { Ifo } from 'config/constants/types'

import { IfoCurrentCard } from './components/IfoFoldableCard'
import IfoContainer from './components/IfoContainer'
import IfoSteps from './components/IfoSteps'

interface TypeProps {
  activeIfo?: Ifo
}

const CurrentIfo: React.FC<React.PropsWithChildren<TypeProps>> = ({ activeIfo }) => {
  // const publicIfoData = useGetPublicIfoV3Data(activeIfo)
  // const walletIfoData = useGetWalletIfoV3Data(activeIfo)

  // const { poolBasic, poolUnlimited } = walletIfoData

  // console.log('data', publicIfoData, walletIfoData);

  // const isCommitted = useMemo(
  //   () =>
  //     poolBasic.amountTokenCommittedInLP.isGreaterThan(0) || poolUnlimited.amountTokenCommittedInLP.isGreaterThan(0),
  //   [poolBasic.amountTokenCommittedInLP, poolUnlimited.amountTokenCommittedInLP],
  // )

  return (
    <>
      <PageHeader>
        <Flex justifyContent="space-between" flexDirection={['column', null, null, 'row']}>
          <Flex flex="1" flexDirection="column" mr={['8px', 0]}>
            <Heading as="h1" scale="xxl" color="secondary" mb="24px">
              BNBTiger Ido
            </Heading>
            <Heading scale="md" color="text">
              Just Ido.
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
      <IfoContainer
        // ifo顶部右侧的ifo公开销售和私有销售
        ifoSection={<IfoCurrentCard />}
        // ifo下面的步骤条
        // ifoSteps={
        //   <IfoSteps />
        // }
      />
    </>
  )
}

export default CurrentIfo
