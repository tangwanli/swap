import { useCallback, useEffect, useMemo, useRef, useState, ReactElement } from "react";
import styled from "styled-components";
import BigNumber from "bignumber.js";
import partition from "lodash/partition";
import { useTranslation } from "@pancakeswap/localization";
import { useIntersectionObserver } from "@pancakeswap/hooks";
import latinise from "@pancakeswap/utils/latinise";
import { useRouter } from "next/router";

import PoolTabButtons from "./PoolTabButtons";
import { ViewMode } from "../../components/ToggleView/ToggleView";
import { Flex, Text, SearchInput, Select, OptionProps } from "../../components";

import { DeserializedPool, DeserializedPoolVault } from "./types";
import { sortPools } from "./helpers";

const PoolControlsView = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  position: relative;

  justify-content: space-between;
  flex-direction: column;
  margin-bottom: 32px;

  ${({ theme }) => theme.mediaQueries.sm} {
    flex-direction: row;
    flex-wrap: wrap;
    padding: 16px 32px;
    margin-bottom: 0;
  }
`;

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 8px 0px;

  ${({ theme }) => theme.mediaQueries.sm} {
    width: auto;
    padding: 0;
  }
`;

const LabelWrapper = styled.div`
  > ${Text} {
    font-size: 12px;
  }
`;

const ControlStretch = styled(Flex)`
  > div {
    flex: 1;
  }
`;

const NUMBER_OF_POOLS_VISIBLE = 12;

interface ChildrenReturn<T> {
  chosenPools: DeserializedPool<T>[];
  viewMode: ViewMode;
  stakedOnly: boolean;
  showFinishedPools: boolean;
  normalizedUrlSearch: string;
}

interface PoolControlsPropsType<T> {
  pools: DeserializedPool<T>[];
  children: (childrenReturn: ChildrenReturn<T>) => ReactElement;
  stakedOnly: boolean;
  setStakedOnly: (s: boolean) => void;
  viewMode: ViewMode;
  setViewMode: (s: ViewMode) => void;
  account: string;
  threshHold: number;
  hideViewMode?: boolean;
}

// Pool最上面的search条件和下面的展示的所有列表内容区
export function PoolControls<T>({
  pools, // 所有的池子,已结束的池子和正在进行中的池子,都是这个pool,这里面是所有池子的全量数据
  children,
  stakedOnly,
  setStakedOnly,
  viewMode,
  setViewMode,
  account,
  threshHold,
  hideViewMode = false,
}: PoolControlsPropsType<T>) {
  const router = useRouter();
  const { t } = useTranslation();

  // 当前页面展示的池子的数量,这个也是用来做无限滚动的,初始数量为12条,往后面拉的话 数量就会增加
  const [numberOfPoolsVisible, setNumberOfPoolsVisible] = useState(NUMBER_OF_POOLS_VISIBLE);
  const { observerRef, isIntersecting } = useIntersectionObserver();
  const normalizedUrlSearch = useMemo(
    () => (typeof router?.query?.search === "string" ? router.query.search : ""),
    [router.query]
  );
  const [_searchQuery, setSearchQuery] = useState("");
  const searchQuery = normalizedUrlSearch && !_searchQuery ? normalizedUrlSearch : _searchQuery;
  const [sortOption, setSortOption] = useState("hot");
  const chosenPoolsLength = useRef(0);

  // finishedPools为已结束的所有池子,这个是全量数据; openPools为当前正在进行中的池子的全量数据
  const [finishedPools, openPools] = useMemo(() => partition(pools, (pool) => pool.isFinished), [pools]);
  // openPoolsWithStartBlockFilter为当前 正在进行中并且已经开启了的池子; 当前进行中的池子,如果没开启,也是不会展示出来的
  const openPoolsWithStartBlockFilter = useMemo(
    () =>
      openPools.filter((pool) =>
        threshHold > 0 && pool.startBlock ? Number(pool.startBlock) < threshHold || pool?.foreverTime : true
      ),
    [threshHold, openPools]
  );
  // 自己质押的 已结束的池子
  const stakedOnlyFinishedPools = useMemo(
    () =>
      finishedPools.filter((pool) => {
        if (pool.vaultKey) {
          const vault = pool as DeserializedPoolVault<T>;
          return vault?.userData?.userShares?.gt(0);
        }
        return pool.userData && new BigNumber(pool.userData.stakedBalance).isGreaterThan(0);
      }),
    [finishedPools]
  );
  // 自己质押的 正在进行中并且已经开启了的池子
  const stakedOnlyOpenPools = useCallback(() => {
    return openPoolsWithStartBlockFilter.filter((pool) => {
      if (pool.vaultKey) {
        const vault = pool as DeserializedPoolVault<T>;
        return vault?.userData?.userShares?.gt(0);
      }
      return pool.userData && new BigNumber(pool.userData.stakedBalance).isGreaterThan(0);
    });
  }, [openPoolsWithStartBlockFilter]);
  const hasStakeInFinishedPools = stakedOnlyFinishedPools.length > 0;

  useEffect(() => {
    if (isIntersecting) {
      // 滚动下拉的时候,修改当前页面上展示的池子的数量,即 每次增加12条
      setNumberOfPoolsVisible((poolsCurrentlyVisible) => {
        if (poolsCurrentlyVisible <= chosenPoolsLength.current) {
          return poolsCurrentlyVisible + NUMBER_OF_POOLS_VISIBLE;
        }
        return poolsCurrentlyVisible;
      });
    }
  }, [isIntersecting]);
  const showFinishedPools = router.pathname.includes("history");

  const handleChangeSearchQuery = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(event.target.value),
    []
  );

  const handleSortOptionChange = useCallback((option: OptionProps) => setSortOption(option.value), []);

  // 当前页面上展示的所有池子.这个不一定是全量数据,只是当前页面上展示的数据,如果数据量太大的话,这里是会有一个滚动分页的
  let chosenPools: DeserializedPool<T>[];
  // 根据当前用户是否质押,做一个筛选
  if (showFinishedPools) {
    // 已结束的池子
    chosenPools = stakedOnly ? stakedOnlyFinishedPools : finishedPools;
  } else {
    // 正在进行中并且已经开启了的池子
    chosenPools = stakedOnly ? stakedOnlyOpenPools() : openPoolsWithStartBlockFilter;
  }

  // console.log('660', showFinishedPools, stakedOnly, stakedOnlyOpenPools(), openPoolsWithStartBlockFilter);

  // 这里是对所有池子进行一个筛选,根据分页参数和搜索条件,来进行一个筛选
  chosenPools = useMemo(() => {
    // 这里是对所有的池子进行一个筛选,只展示 后面滚动分页对应数量的池子.不是展示所有池子
    const sortedPools = sortPools<T>(account, sortOption, chosenPools).slice(0, numberOfPoolsVisible);

    if (searchQuery) {
      const lowercaseQuery = latinise(searchQuery.toLowerCase());
      return sortedPools.filter((pool) =>
        latinise(pool?.earningToken?.symbol?.toLowerCase() || "").includes(lowercaseQuery)
      );
    }
    return sortedPools;
  }, [account, sortOption, chosenPools, numberOfPoolsVisible, searchQuery]);

  chosenPoolsLength.current = chosenPools.length;

  // 返回传入到子组件里面的属性
  const childrenReturn: ChildrenReturn<T> = useMemo(
    () => ({ chosenPools, stakedOnly, viewMode, normalizedUrlSearch, showFinishedPools }),
    [chosenPools, normalizedUrlSearch, showFinishedPools, stakedOnly, viewMode]
  );

  return (
    <>
      <PoolControlsView>
        {/* 搜索条件: 列表表格模式切换\ 即时\已结束 切换条件等 */}
        <PoolTabButtons
          stakedOnly={stakedOnly}
          setStakedOnly={setStakedOnly}
          hasStakeInFinishedPools={hasStakeInFinishedPools}
          viewMode={viewMode}
          setViewMode={setViewMode}
          hideViewMode={hideViewMode}
        />
        <FilterContainer>
          {/* 搜索条件\热门等 */}
          {/* <LabelWrapper>
            <Text fontSize="12px" bold color="textSubtle" textTransform="uppercase">
              {t("Sort by")}
            </Text>
            <ControlStretch>
              <Select
                options={[
                  {
                    label: t("Hot"),
                    value: "hot",
                  },
                  {
                    label: t("APR"),
                    value: "apr",
                  },
                  {
                    label: t("Earned"),
                    value: "earned",
                  },
                  {
                    label: t("Total staked"),
                    value: "totalStaked",
                  },
                  {
                    label: t("Latest"),
                    value: "latest",
                  },
                ]}
                onOptionChange={handleSortOptionChange}
              />
            </ControlStretch>
          </LabelWrapper> */}
          {/* 上面的搜索区域 */}
          <LabelWrapper style={{ marginLeft: 16 }}>
            <Text fontSize="12px" bold color="textSubtle" textTransform="uppercase">
              {t("Search")}
            </Text>
            <SearchInput initialValue={searchQuery} onChange={handleChangeSearchQuery} placeholder="Search Pools" />
          </LabelWrapper>
        </FilterContainer>
      </PoolControlsView>
      {/* 展示的所有列表内容区 */}
      {children(childrenReturn)}
      <div ref={observerRef} />
    </>
  );
}
