/* eslint-disable jsx-a11y/anchor-is-valid */
import styled from 'styled-components'
import { PageSection, Text, Button } from '@pancakeswap/uikit'
import { useAccount } from 'wagmi'
import useTheme from 'hooks/useTheme'
import Container from 'components/Layout/Container'
import { useTranslation } from '@pancakeswap/localization'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { ChainId } from '@pancakeswap/sdk'
import Hero from './components/Hero'
import { swapSectionData, earnSectionData, cakeSectionData } from './components/SalesSection/data'
import MetricsSection from './components/MetricsSection'
import SalesSection from './components/SalesSection'
import WinSection from './components/WinSection'
import FarmsPoolsRow from './components/FarmsPoolsRow'
import Footer from './components/Footer'
import CakeDataRow from './components/CakeDataRow'
import BnbTigerDataRow from './components/BnbTigerDataRow'
import { WedgeTopLeft, InnerWedgeWrapper, OuterWedgeWrapper, WedgeTopRight } from './components/WedgeSvgs'
import UserBanner from './components/UserBanner'
import MultipleBanner from './components/Banners/MultipleBanner'
import NftBanner from './components/Banners/NftBanner'

const StyledHeroSection = styled(PageSection)`
  padding-top: 16px;

  ${({ theme }) => theme.mediaQueries.md} {
    padding-top: 48px;
  }
  ${({ theme }) => theme.mediaQueries.sm} {
    display: flex;
  }
`

const UserBannerWrapper = styled(Container)`
  z-index: 1;
  position: absolute;
  width: 100%;
  top: 0;
  left: 50%;
  transform: translate(-50%, 0);
  padding-left: 0px;
  padding-right: 0px;

  ${({ theme }) => theme.mediaQueries.lg} {
    padding-left: 24px;
    padding-right: 24px;
  }
`

const Home: React.FC<React.PropsWithChildren> = () => {
  const { theme } = useTheme()
  const { address: account } = useAccount()
  const { chainId } = useActiveChainId()

  const HomeSectionContainerStyles = { margin: '0', width: '100%', maxWidth: '968px' }

  const { t } = useTranslation()

  // {`
  //         #home-1 .page-bg {
  //           background: linear-gradient(139.73deg, #e6fdff 0%, #f3efff 100%);
  //           padding: 0;
  //         }
  //         [data-theme='dark'] #home-1 .page-bg {
  //           background: radial-gradient(103.12% 50% at 50% 50%, #21193a 0%, #191326 100%);
  //         }
  //         #home-2 .page-bg {
  //           background: linear-gradient(180deg, #ffffff 22%, #d7caec 100%);
  //         }
  //         [data-theme='dark'] #home-2 .page-bg {
  //           background: linear-gradient(180deg, #09070c 22%, #201335 100%);
  //         }
  //         #home-3 .page-bg {
  //           background: linear-gradient(180deg, #6fb6f1 0%, #eaf2f6 100%);
  //         }
  //         [data-theme='dark'] #home-3 .page-bg {
  //           background: linear-gradient(180deg, #0b4576 0%, #091115 100%);
  //         }
  //         #home-4 .inner-wedge svg {
  //           fill: #d8cbed;
  //         }
  //         [data-theme='dark'] #home-4 .inner-wedge svg {
  //           fill: #201335;
  //         }
  //         #home-6 .page-bg {
  //           padding-top: 0;
  //         }
  //       `}
  return (
    <>
      <style jsx global>
        {`
          #home-1 .page-bg {
            background: linear-gradient(139.73deg, #e6fdff 0%, #f3efff 100%);
            padding: 0;
          }
          [data-theme='dark'] #home-1 .page-bg {
            background: radial-gradient(103.12% 50% at 50% 50%, #21193a 0%, #191326 100%);
          }
          #home-2 .page-bg {
            background: linear-gradient(180deg, #ffffff 22%, #efe0b1 100%);
          }
          #home-2 {
            position: relative;
          }
          #home-2 .nft {
            position: absolute;
            font-size: 30px;
            color: #df1c1c;
            text-shadow: 4px 2px #c4c41a;
          }
          #home-2 .nft2 {
            top: 0;
            transform: rotate(45deg);
          }
          #home-2 .nft3 {
            right: 10%;
            top: 30%;
            transform: rotate(45deg);
          }
          [data-theme='dark'] #home-2 .page-bg {
            background: linear-gradient(180deg, #09070c 22%, #201335 100%);
          }
          #home-3 {
            position: relative;
          }
          #home-3 .page-bg {
            background: linear-gradient(180deg, #b2a24826 0%, #4aadd770 100%);
          }
          [data-theme='dark'] #home-3 .page-bg {
            background: linear-gradient(180deg, #0b4576 0%, #091115 100%);
          }
          #home-4 .inner-wedge svg {
            fill: #d8cbed;
          }
          [data-theme='dark'] #home-4 .inner-wedge svg {
            fill: #201335;
          }
          #home-6 .page-bg {
            padding-top: 0;
          }
          #home-3.more-info {
            position: absolute;
            top: 10px;
            right: -20px;
          }
        `}
      </style>
      <PageSection
        innerProps={{
          style: { margin: '0', width: '100%', maxWidth: '256px', height: '256px', padding: 0, textAlign: 'center' },
        }}
        background={theme.colors.background}
        index={2}
        containerProps={{
          id: 'home-2',
        }}
        hasCurvedDivider={false}
      >
        {/* <SalesSection {...cakeSectionData(t)} /> */}
        <span className="nft2 nft">NFT</span>
        <NftBanner />
        <span className="nft3 nft">NFT</span>
        {/* <CakeDataRow /> */}
      </PageSection>
      {/* <PageSection
        innerProps={{ style: { margin: '0', width: '100%' } }}
        containerProps={{
          id: 'home-2',
        }}
        index={2}
        hasCurvedDivider={false}
      >
        <MetricsSection />
      </PageSection>
      <PageSection
        innerProps={{ style: HomeSectionContainerStyles }}
        background={theme.colors.background}
        containerProps={{
          id: 'home-4',
        }}
        index={2}
        hasCurvedDivider={false}
      >
        <OuterWedgeWrapper>
          <InnerWedgeWrapper top>
            <WedgeTopLeft />
          </InnerWedgeWrapper>
        </OuterWedgeWrapper>
        <SalesSection {...swapSectionData(t)} />
      </PageSection>
      <PageSection
        innerProps={{ style: HomeSectionContainerStyles }}
        background={theme.colors.gradientCardHeader}
        index={2}
        hasCurvedDivider={false}
      >
        <OuterWedgeWrapper>
          <InnerWedgeWrapper width="150%" top>
            <WedgeTopRight />
          </InnerWedgeWrapper>
        </OuterWedgeWrapper>
        <SalesSection {...earnSectionData(t)} />
        {chainId === ChainId.BSC && <FarmsPoolsRow />}
      </PageSection>
      <PageSection
        innerProps={{ style: HomeSectionContainerStyles }}
        containerProps={{
          id: 'home-3',
        }}
        index={2}
        hasCurvedDivider={false}
      >
        <WinSection />
      </PageSection> */}
      <PageSection
        innerProps={{ style: HomeSectionContainerStyles }}
        background={theme.colors.background}
        index={2}
        containerProps={{
          id: 'home-3',
        }}
        hasCurvedDivider={false}
      >
        <Button scale="sm" className="more-info">
          <a href="https://www.bnbtiger.top/">more info</a>
        </Button>
        {/* <Text color="secondary" className="more-info">
          <a href="https://www.bnbtiger.top/">more info</a>
        </Text> */}
        {/* <SalesSection {...cakeSectionData(t)} /> */}
        <BnbTigerDataRow />
        {/* <CakeDataRow /> */}
      </PageSection>
      <StyledHeroSection
        innerProps={{ style: HomeSectionContainerStyles }}
        // innerProps={{ style: { margin: '0', width: '100%', padding: 0} }}
        containerProps={{
          id: 'home-2',
        }}
        index={2}
        hasCurvedDivider={false}
      >
        {/* {account && chainId === ChainId.BSC && (
          <UserBannerWrapper>
            <UserBanner />
          </UserBannerWrapper>
        )} */}
        {/* 最上面的轮播图 */}
        <MultipleBanner />
        {/* <Hero /> */}
      </StyledHeroSection>
      {/* <PageSection
        innerProps={{ style: HomeSectionContainerStyles }}
        background="linear-gradient(180deg, #7645D9 0%, #5121B1 100%)"
        index={2}
        hasCurvedDivider={false}
      >
        <Footer />
      </PageSection> */}
    </>
  )
}

export default Home
