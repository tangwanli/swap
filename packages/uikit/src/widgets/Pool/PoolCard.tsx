import { useTranslation } from "@pancakeswap/localization";
import { ReactElement, useState, useEffect } from "react";
import { Flex } from "../../components/Box";
import { CardBody, CardRibbon } from "../../components/Card";
import { Skeleton } from "../../components/Skeleton";
import { PoolCardHeader, PoolCardHeaderTitle } from "./PoolCardHeader";
import { StyledCard } from "./StyledCard";
import { DeserializedPool } from "./types";

interface PoolCardPropsType<T> {
  pool: DeserializedPool<T>;
  cardContent: ReactElement;
  aprRow: ReactElement;
  cardFooter: ReactElement;
  tokenPairImage: ReactElement;
  isStaked: boolean;
}

export function PoolCard<T>({ pool, cardContent, aprRow, isStaked, cardFooter, tokenPairImage }: PoolCardPropsType<T>) {
  // @ts-ignore
  const { sousId, stakingToken, earningToken, isFinished, totalStaked, foreverTime } = pool;
  const { t } = useTranslation();
  const [countdown, setCountdown] = useState(
    foreverTime && foreverTime > new Date().getTime() ? (foreverTime - new Date().getTime()) / 1000 : 0
  );

  const isForever = foreverTime && foreverTime > new Date().getTime();

  useEffect(() => {
    let timerId: any;

    if (countdown > 0) {
      timerId = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    }

    return () => clearTimeout(timerId);
  }, [countdown]);

  const isCakePool = earningToken?.symbol === "CAKE" && stakingToken?.symbol === "CAKE";

  return (
    <>
      {/* @ts-ignore */}
      <style jsx global>
        {`
          .pool-disable {
            filter: brightness(0.5);
            pointer-events: none;
          }
          .pool-card {
            position: relative;
          }
          .pool-timer {
            // width: 100%;
            position: absolute;
            // top: 50%;
            left: 50%;
            filter: brightness(1);
            color: red;
            // text-shadow: 2px 2px grey;
            -webkit-text-stroke: 1px #a28484;
            text-align: center;
            text-stroke: 1px red;
            font-size: 30px;
            z-index: 999;
          }
          .pool-timer-text {
            top: 28%;
            transform: translateX(-50%);
            border: 3px solid red;
            padding: 10px 15%;
            border-radius: 15px;
            box-shadow: 1px 1px 3px red, -1px -1px 3px red;
          }
          .pool-timer-number {
            top: 43%;
            transform: translateX(-50%);
          }
        `}
      </style>
      <StyledCard
        className={isForever && countdown ? "pool-disable pool-card" : "pool-card"}
        isActive={isCakePool}
        isFinished={isFinished && sousId !== 0}
        ribbon={isFinished && <CardRibbon variantColor="textDisabled" text={t("Finished")} />}
      >
        {isForever && countdown && (
          <div>
            <span className="pool-timer pool-timer-text">Incoming</span>
            {/* @ts-ignore */}
            <span className="pool-timer pool-timer-number">{parseInt(countdown)} s</span>
          </div>
        )}
        <PoolCardHeader isStaking={isStaked} isFinished={isFinished && sousId !== 0}>
          {totalStaked && totalStaked.gte(0) ? (
            <>
              <PoolCardHeaderTitle
                title={isCakePool ? t("Manual") : t("Earn %asset%", { asset: earningToken?.symbol || "" })}
                subTitle={
                  isCakePool ? t("Earn CAKE, stake CAKE") : t("Stake %symbol%", { symbol: stakingToken?.symbol || "" })
                }
              />
              {tokenPairImage}
            </>
          ) : (
            <Flex width="100%" justifyContent="space-between">
              <Flex flexDirection="column">
                <Skeleton width={100} height={26} mb="4px" />
                <Skeleton width={65} height={20} />
              </Flex>
              <Skeleton width={58} height={58} variant="circle" />
            </Flex>
          )}
        </PoolCardHeader>
        <CardBody>
          {aprRow}
          <Flex mt="24px" flexDirection="column">
            {cardContent}
          </Flex>
        </CardBody>
        {cardFooter}
      </StyledCard>
    </>
  );
}
