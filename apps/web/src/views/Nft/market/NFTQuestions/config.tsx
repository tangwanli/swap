import Trans from 'components/Trans'
import styled from 'styled-components'
import { Link } from '@pancakeswap/uikit'

const InlineLink = styled(Link)`
  display: inline;
`

const config = [
  {
    title: <Trans>How many NFTs can I mint?</Trans>,
    description: [
      <Trans>
        You can mint ___ NFTs with an address.
      </Trans>,
      <Trans>
        Incomes of the NFTs will be used to buyback BNBTiger.
      </Trans>
    ]
  },
  {
    title: <Trans>What is the power of the BNBTiger NFT?</Trans>,
    description: [
      <Trans>If you have a BNBTiger NFT, you can mint a BNBTiger land NFT free</Trans>,
    ]
  },
  {
    title: <Trans>What is the price of the BNBTiger NFT?</Trans>,
    description: [
      <Trans>The price is ___ BNB per NFT</Trans>,
    ]
  },
]
export default config
