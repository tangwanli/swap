import { ReactElement } from 'react'
import styled from 'styled-components'
import { useTranslation } from '@pancakeswap/localization'
import { Box, Container, LinkExternal, PageSection } from '@pancakeswap/uikit'
import useTheme from 'hooks/useTheme'
import IfoLayout, { IfoLayoutWrapper } from './IfoLayout'
import IfoPoolVaultCard from './IfoPoolVaultCard'
import IfoQuestions from './IfoQuestions'

const IfoStepBackground = styled(Box)`
  background: ${({ theme }) => theme.colors.gradientBubblegum};
`

interface TypeProps {
  ifoSection: ReactElement
  ifoSteps?: ReactElement
}

// ifo的整体布局页面
const IfoContainer: React.FC<React.PropsWithChildren<TypeProps>> = ({ ifoSection, ifoSteps }) => {
  const { t } = useTranslation()
  const { theme } = useTheme()

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
          #current-ifo {
            padding-top: 0;
            margin-top: 0;
          }
        `}
      </style>
      <IfoLayout id="current-ifo" py={['24px', '24px', '40px']}>
        {/* ifo顶部的cake和右边的销售框 */}
        <PageSection
          innerProps={{ style: { margin: '0', width: '100%', padding: 0, textAlign: 'center' } }}
          background={theme.colors.background}
          index={2}
          containerProps={{
            id: 'home-2',
          }}
          hasCurvedDivider={false}
        >
          <Container>
            <IfoLayoutWrapper>
              {/* ifo顶部的质押cake和下面的领取代币 */}
              {/* <IfoPoolVaultCard /> */}
              {/* ifo顶部右侧的公开销售和私人销售 */}
              {ifoSection}
            </IfoLayoutWrapper>
          </Container>
        </PageSection>
        {/* ifo下面的步骤 条 */}
        {/* <IfoStepBackground>
        <Container>{ifoSteps}</Container>
      </IfoStepBackground> */}
        <Container>
          {/* ifo底部的详细资料 */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <IfoQuestions />
          </div>
          {/* ifo底部的链接 */}
          {/* <LinkExternal
          href="https://docs.pancakeswap.finance/contact-us/business-partnerships#ifos-token-sales"
          mx="auto"
          mt="16px"
        >
          {t('Apply to run an IFO!')}
        </LinkExternal> */}
        </Container>
      </IfoLayout>
    </>
  )
}

export default IfoContainer
