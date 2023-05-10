import shuffle from 'lodash/shuffle'
import { ReactElement, useMemo } from 'react'
import AptosBanner from '../AptosBanner'
import CompetitionBanner from '../CompetitionBanner'
import IFOBanner from '../IFOBanner'
import PerpetualBanner from '../PerpetualBanner'
import TigerBanner1 from '../TigerBanner1';
import TigerBanner2 from '../TigerBanner2';
import TigerBanner3 from '../TigerBanner3';
import TigerBanner4 from '../TigerBanner4';
import V3Banner from '../V3Banner'
import useIsRenderCompetitionBanner from './useIsRenderCompetitionBanner'
import useIsRenderIfoBanner from './useIsRenderIFOBanner'
import tiger1 from '../../../../../../public/bnbtiger/nft/1.jpg'
import tiger2 from '../../../../../../public/bnbtiger/nft/2.jpg'
import tiger3 from '../../../../../../public/bnbtiger/nft/3.jpg'
import tiger4 from '../../../../../../public/bnbtiger/nft/4.jpg'
import tiger5 from '../../../../../../public/bnbtiger/nft/5.jpg'

interface IBannerConfig {
  shouldRender: boolean
  banner: ReactElement
}

/**
 * make your custom hook to control should render specific banner or not
 * add new campaign banner easily
 *
 * @example
 * ```ts
 *  {
 *    shouldRender: isRenderIFOBanner,
 *    banner: <IFOBanner />,
 *  },
 * ```
 */
export const useNftBannerConfig = () => {

  return useMemo(() => {
    const SHUFFLE_BANNERS: IBannerConfig[] = []

    const NO_SHUFFLE_BANNERS: IBannerConfig[] = [
      {
        shouldRender: true,
        banner: <img width='256px' height='256px' src={tiger1?.src || ''} alt='1' />,
        // banner: <TigerBanner1 />,
      },
      {
        shouldRender: true,
        banner: <img width='256px' height='256px' src={tiger2?.src || ''} alt='1' />,
      },
      {
        shouldRender: true,
        banner: <img width='256px' height='256px' src={tiger3?.src || ''} alt='1' />,
      },
      {
        shouldRender: true,
        banner: <img width='256px' height='256px' src={tiger4?.src || ''} alt='1' />,
      },
      {
        shouldRender: true,
        banner: <img width='256px' height='256px' src={tiger5?.src || ''} alt='1' />,
      },
    ]
    return [...NO_SHUFFLE_BANNERS, ...shuffle(SHUFFLE_BANNERS)]
      .filter((bannerConfig: IBannerConfig) => bannerConfig.shouldRender)
      .map((bannerConfig: IBannerConfig) => bannerConfig.banner)
  }, [])
}
