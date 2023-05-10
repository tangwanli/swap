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
export const useMultipleBannerConfig = () => {
  const isRenderIFOBanner = useIsRenderIfoBanner()
  const isRenderCompetitionBanner = useIsRenderCompetitionBanner()

  return useMemo(() => {
    const SHUFFLE_BANNERS: IBannerConfig[] = []

    const NO_SHUFFLE_BANNERS: IBannerConfig[] = [
      {
        shouldRender: true,
        banner: <TigerBanner1 />,
      },
      {
        shouldRender: true,
        banner: <TigerBanner2 />,
      },
      {
        shouldRender: true,
        banner: <TigerBanner3 />,
      },
      {
        shouldRender: true,
        banner: <TigerBanner4 />,
      },
    ]
    // const NO_SHUFFLE_BANNERS: IBannerConfig[] = [
    //   { shouldRender: true, banner: <V3Banner /> },
    //   { shouldRender: true, banner: <AptosBanner /> },
    //   {
    //     shouldRender: isRenderIFOBanner,
    //     banner: <IFOBanner />,
    //   },
    // ]

    // const SHUFFLE_BANNERS: IBannerConfig[] = [
    //   {
    //     shouldRender: isRenderCompetitionBanner,
    //     banner: <CompetitionBanner />,
    //   },
    //   {
    //     shouldRender: true,
    //     banner: <PerpetualBanner />,
    //   },
    // ]
    return [...NO_SHUFFLE_BANNERS, ...shuffle(SHUFFLE_BANNERS)]
      .filter((bannerConfig: IBannerConfig) => bannerConfig.shouldRender)
      .map((bannerConfig: IBannerConfig) => bannerConfig.banner)
  }, [])
}
