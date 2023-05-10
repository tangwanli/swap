import { ArrowForwardIcon, Button, Text, Link, useMatchBreakpoints, useIsomorphicEffect } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import Image from 'next/legacy/image'
import { memo, useMemo, useRef } from 'react'
import styled, { useTheme } from 'styled-components'
import { getPerpetualUrl } from 'utils/getPerpetualUrl'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { perpetualImage, perpetualMobileImage } from './images'
import circleIcon from "../../../../../public/bnbtiger/circle-01.png";
import * as S from './Styled'

const RightWrapper = styled.div`
  position: absolute;
  min-height: 100%;
  right: 0;
  bottom: 0px;
  ${({ theme }) => theme.mediaQueries.sm} {
    bottom: 8.2px;
  }
  ${({ theme }) => theme.mediaQueries.md} {
    bottom: 9px;
  }
  ${({ theme }) => theme.mediaQueries.lg} {
    bottom: -2px;
  }
`
const Content = styled.div`
  display: flex;
  align-items: center;
  color: #fff;
  margin-bottom: 6px;
  img {
    width: 16px;
    height: 16px;
    margin-right: 4px;
  }
`
const Header = styled(S.StyledHeading)`
  font-size: 20px;
  min-height: 44px;
  ${({ theme }) => theme.mediaQueries.sm} {
    font-size: 40px;
    min-height: auto;
  }
`

const HEADING_ONE_LINE_HEIGHT = 27

const TigerBanner2 = () => {
  const {
    t,
    currentLanguage: { code },
  } = useTranslation()
  const { isDesktop, isMobile } = useMatchBreakpoints()
  const { isDark } = useTheme()
  const { chainId } = useActiveChainId()

  const perpetualUrl = useMemo(() => getPerpetualUrl({ chainId, languageCode: code, isDark }), [chainId, code, isDark])
  const headerRef = useRef<HTMLDivElement>(null)

  useIsomorphicEffect(() => {
    const target = headerRef.current
    target.style.fontSize = '' // reset
    target.style.lineHeight = ''
    if (!target || !isMobile) return
    if (target.offsetHeight > HEADING_ONE_LINE_HEIGHT) {
      target.style.fontSize = '18px'
      target.style.lineHeight = `${HEADING_ONE_LINE_HEIGHT}px`
    }
  }, [isMobile, code])

  return (
    <S.Wrapper>
      <S.Inner>
        <S.LeftWrapper>
          <S.StyledSubheading ref={headerRef}>(Q1 2023) Launch - 25%</S.StyledSubheading>
          {/* <Header width={['160px', '160px', 'auto']}>{t('Up to 100× Leverage')}</Header> */}
          <Content><img src={circleIcon?.src ?? ''} alt="logo" />5,000 Telegram Members</Content>
          <Content><img src={circleIcon?.src ?? ''} alt="logo" />Website Redesign</Content>
          <Content><img src={circleIcon?.src ?? ''} alt="logo" />Burn Plan/Events</Content>
          <Content><img src={circleIcon?.src ?? ''} alt="logo" />9,000 Holders</Content>
          <Content><img src={circleIcon?.src ?? ''} alt="logo" />10,000 Telegram Members</Content>
          <Content><img src={circleIcon?.src ?? ''} alt="logo" />18,000 Holders</Content>
          {/* <Link href={perpetualUrl} external>
            <Button>
              <Text color="invertedContrast" bold fontSize="16px" mr="4px">
                {t('Trade Now')}
              </Text>
              <ArrowForwardIcon color="invertedContrast" />
            </Button>
          </Link> */}
        </S.LeftWrapper>
        {/* <RightWrapper>
          {isDesktop ? (
            <Image src={perpetualImage} alt="PerpetualBanner" width={392} height={232} placeholder="blur" />
          ) : (
            <Image src={perpetualMobileImage} alt="PerpetualBanner" width={208} height={208} placeholder="blur" />
          )}
        </RightWrapper> */}
      </S.Inner>
    </S.Wrapper>
  )
}

export default memo(TigerBanner2)
