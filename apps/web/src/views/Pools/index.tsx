import styled from 'styled-components'

import { useAccount } from 'wagmi'
import { Heading, Flex, Image, Text, Link, FlexLayout, PageHeader, Loading, Pool, ViewMode } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { usePoolsPageFetch, usePoolsWithVault } from 'state/pools/hooks'
import Page from 'components/Layout/Page'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { Token } from '@pancakeswap/sdk'
import { TokenPairImage } from 'components/TokenImage'

import { allPool } from 'config/constants/pools'
import CardActions from './components/PoolCard/CardActions'
import AprRow from './components/PoolCard/AprRow'
import CardFooter from './components/PoolCard/CardFooter'
import CakeVaultCard from './components/CakeVaultCard'
import PoolControls from './components/PoolControls'
import PoolRow, { VaultPoolRow } from './components/PoolsTable/PoolRow'

const CardLayout = styled(FlexLayout)`
  justify-content: center;
`

const FinishedTextContainer = styled(Flex)`
  padding-bottom: 32px;
  flex-direction: column;
  ${({ theme }) => theme.mediaQueries.md} {
    flex-direction: row;
  }
`

const FinishedTextLink = styled(Link)`
  font-weight: 400;
  white-space: nowrap;
  text-decoration: underline;
`

// 单币质押挖矿页面
const Pools: React.FC<React.PropsWithChildren> = () => {
  const { t } = useTranslation()
  // 当前用户的账号
  const { address: account } = useAccount()
  // 为所有的池子,已结束的池子和正在进行中的池子,都是这个pool,这里面是所有池子的全量数据
  const { pools, userDataLoaded } = usePoolsWithVault()

  // console.log('pools', pools)

  usePoolsPageFetch()

  // console.log('pools', account, pools, userDataLoaded);

  return (
    <>
      <PageHeader>
        <Flex justifyContent="space-between" flexDirection={['column', null, null, 'row']}>
          <Flex flex="1" flexDirection="column" mr={['8px', 0]}>
            <Heading as="h1" scale="xxl" color="secondary" mb="24px">
              {t('BNBTiger Pools')}
            </Heading>
            <Heading scale="md" color="text">
              {t('Just stake some tokens to earn.')}
            </Heading>
            <Heading scale="md" color="text">
              {t('High APR.')}
            </Heading>
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
      <Page>
        <PoolControls pools={pools}>
          {/* chosenPools为当前页面上展示的所有池子的列表;viewModel为对应的模式;stakedOnly为只展示自己已经质押了的矿池;normalizedUrlSearch为自己输入的查询条件 */}
          {({ chosenPools, viewMode, stakedOnly, normalizedUrlSearch, showFinishedPools }) => (
            <>
              {/* 跳转到pancake的v1的矿池 */}
              {/* {showFinishedPools && (
                <FinishedTextContainer>
                  <Text fontSize={['16px', null, '20px']} color="failure" pr="4px">
                    {t('Looking for v1 CAKE syrup pools?')}
                  </Text>
                  <FinishedTextLink href="/migration" fontSize={['16px', null, '20px']} color="failure">
                    {t('Go to migration page')}.
                  </FinishedTextLink>
                </FinishedTextContainer>
              )} */}
              {account && !userDataLoaded && stakedOnly && (
                <Flex justifyContent="center" mb="4px">
                  <Loading />
                </Flex>
              )}
              {viewMode === ViewMode.CARD ? (
                <CardLayout>
                  {chosenPools.map((pool) =>
                    pool.vaultKey ? (
                      // <CakeVaultCard key={pool.vaultKey} pool={pool} showStakedOnly={stakedOnly} />
                      <></>
                    ) : (
                      <Pool.PoolCard<Token>
                        key={pool.sousId}
                        pool={pool}
                        isStaked={Boolean(pool?.userData?.stakedBalance?.gt(0))}
                        // 池子顶部卡片右上角的代币头像
                        tokenPairImage={
                          //  先將圖片移除
                          <Image
                            src="/images/decorations/bnbtiger.png"
                            alt="Pancake illustration"
                            width={64}
                            height={64}
                          />
                          // <TokenPairImage
                          //   primaryToken={pool.earningToken}
                          //   secondaryToken={pool.stakingToken}
                          //   width={64}
                          //   height={64}
                          // />
                          // null
                        }
                        // 卡片顶部的年利率
                        aprRow={<AprRow pool={pool} stakedBalance={pool?.userData?.stakedBalance} />}
                        cardContent={
                          // 卡片主内容区,中间的一大串,不包括顶部的年利率
                          account ? (
                            <CardActions pool={pool} stakedBalance={pool?.userData?.stakedBalance} />
                          ) : (
                            <>
                              {/* 卡片主内容区的连接钱包按钮 */}
                              <Text mb="10px" textTransform="uppercase" fontSize="12px" color="textSubtle" bold>
                                {t('Start earning')}
                              </Text>
                              <ConnectWalletButton />
                            </>
                          )
                        }
                        // 卡片最底部的详细资料
                        cardFooter={<CardFooter pool={pool} account={account} />}
                      />
                    ),
                  )}
                </CardLayout>
              ) : (
                <Pool.PoolsTable>
                  {chosenPools.map((pool) =>
                    pool.vaultKey ? (
                      <></>
                    ) : (
                      // <VaultPoolRow
                      //   initialActivity={normalizedUrlSearch.toLowerCase() === pool.earningToken.symbol?.toLowerCase()}
                      //   key={pool.vaultKey}
                      //   vaultKey={pool.vaultKey}
                      //   account={account}
                      // />
                      <PoolRow
                        initialActivity={normalizedUrlSearch.toLowerCase() === pool.earningToken.symbol?.toLowerCase()}
                        key={pool.sousId}
                        sousId={pool.sousId}
                        account={account}
                      />
                    ),
                  )}
                </Pool.PoolsTable>
              )}
              {/* <Image
                mx="auto"
                mt="12px"
                // src="/images/decorations/3d-syrup-bunnies.png"
                src="/images/decorations/bnbtiger.png"
                alt="Pancake illustration"
                width={192}
                height={184.5}
              /> */}
            </>
          )}
        </PoolControls>
      </Page>
    </>
  )
}

export default Pools
