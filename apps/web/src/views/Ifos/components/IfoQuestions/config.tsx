import Trans from 'components/Trans'
import styled from 'styled-components'
import { Link } from '@pancakeswap/uikit'

const InlineLink = styled(Link)`
  display: inline;
`

const config = [
  {
    title: <Trans>How can I participate in the IDO?</Trans>,
    description: [
      <Trans>
        You need to hold BNBTiger to participate in the IDO.
      </Trans>,
      <Trans>
        The more BNBTiger you have, the more you can contribute.
      </Trans>
    ]
  },
  {
    title: <Trans>How many BNB can I contribute?</Trans>,
    description: [
      <Trans>There’s no least BNB requirement to make a contribution.</Trans>,
      <Trans>The maximum BNB that an address can contribute is ___ BNB.</Trans>,
    ]
  },
  {
    title: <Trans>How to become an inviter?</Trans>,
    description: [
      <Trans>You should contribute at least 3 BNB to become an inviter.</Trans>,
    ]
  },
  {
    title: <Trans>What’s the benefits to become an inviter?</Trans>,
    description: [
      <Trans>You can get 5% of the BNB back once someone use your link to join the IDO.</Trans>,
    ]
  },
  {
    title: <Trans>How can I invite others to join the IDO?</Trans>,
    description: [
      <Trans>You can copy the invitation link via the copy button above.</Trans>,
      <Trans>Be aware, only inviters are benefitial from the invitations.</Trans>,
    ]
  },
]
export default config
