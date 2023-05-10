import { useState, useEffect, Dispatch, SetStateAction } from 'react'
import styled from 'styled-components'
import {
  Box,
  Card,
  CardBody,
  CardFooter,
  Heading,
  IconButton,
  PageSection,
  Slider,
  Row,
  AddIcon,
  MinusIcon,
  Button,
  Image,
  Text,
  PageHeader,
  Flex,
} from '@pancakeswap/uikit'
import { useAccount } from 'wagmi'
import useTheme from 'hooks/useTheme'
import swal from 'sweetalert'
import Container from 'components/Layout/Container'
import { useTranslation } from '@pancakeswap/localization'
import { useActiveChainId } from 'hooks/useActiveChainId'
// import BnbTigerDataRow from './components/BnbTigerDataRow'
// import { WedgeTopLeft, InnerWedgeWrapper, OuterWedgeWrapper, WedgeTopRight } from './components/WedgeSvgs'
// import UserBanner from './components/UserBanner'
// import MultipleBanner from './components/Banners/MultipleBanner'
// import NftBanner from './components/Banners/NftBanner'
import { ethers } from 'ethers'
import nftABI from 'config/abi/nft-nftABI.json'
import NftQuestions from 'views/Nft/market/NFTQuestions'
import ErrorMessage from './ErrorMessage'

const headerHeight = '73px'
const customHeadingColor = '#7645D9'
const gradientStopPoint = `calc(${headerHeight} + 1px)`

const nftMintAddress = '0x9c657E4A638df5E5e5d2b08cDCD7B3A2cE25052D'

const NftMarketPage: React.FC<React.PropsWithChildren> = () => {
  const { theme } = useTheme()
  const { address: account } = useAccount()
  const { chainId } = useActiveChainId()

  const { t } = useTranslation()

  const [isOpen, setIsOpen] = useState(false)
  const [contents, setContents] = useState(['String1', 'String1', 'String1'])

  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [nftContract, setNFTContract] = useState(null)
  const [mintAmount, setMintAmount] = useState(1)
  const [maxMint, setMaxMint] = useState(10)
  const [totalSupply, setTotalSupply] = useState(999)
  const [alreadyMint, setAlreadyMint] = useState(0)
  const [errorText, setErrorText] = useState('')

  //  交易上鍊後 更新資訊用
  const [isOnChain, setIsOnChain] = useState(false)
  const [imgURL, setImgURL] = useState([])

  const borderBackground = `linear-gradient(${customHeadingColor} ${gradientStopPoint}, ${theme.colors.cardBorder} ${gradientStopPoint})`

  // Gradient overlap is also possible, just put the "dividing" gradient first and after that the header gradient
  const gradientBorderColor = `linear-gradient(transparent ${gradientStopPoint}, ${theme.colors.cardBorder} ${gradientStopPoint}), ${theme.colors.gradientCardHeader}`

  interface ModalContainerProps {
    isOpen: boolean
  }

  const ModalButton = styled.button`
    background-color: #0077ff;
    color: white;
    padding: 12px 24px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  `

  const ModalContainer = styled.div<ModalContainerProps>`
    display: ${(props) => (props.isOpen ? 'block' : 'none')};
    position: fixed;
    z-index: 100;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgba(0, 0, 0, 0.4);
  `

  const ModalContent = styled.div`
    background-color: white;
    margin: 20vh auto;
    padding: 20px;
    border: 1px solid #888;
    width: 100%;
    max-width: 400px;
    border-radius: 8px;
  `

  const ModalClose = styled.span`
    color: #aaa;
    float: right;
    font-size: 28px;
    font-weight: bold;
    cursor: pointer;
  `

  const ModalTitle = styled.h2`
    margin-top: 0;
  `

  type ModalProps = {
    isOpen: boolean
    setIsOpen: Dispatch<SetStateAction<boolean>>
    contents: string[] // new prop for the 3 content strings
    setImgURL: Dispatch<SetStateAction<string[]>>
  }

  const Modal: React.FC<ModalProps> = () => {
    const closeModal = () => {
      setIsOpen(false)
      setImgURL([])
    }

    return (
      <ModalContainer isOpen={isOpen}>
        <ModalContent>
          <ModalClose onClick={closeModal}>&times;</ModalClose>
          <ModalTitle>{contents[0]}</ModalTitle>
          <hr />
          <div
            style={{
              marginTop: '5vh',
              marginBottom: '5vh',
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {imgURL.length > 0 &&
              imgURL.map((imageUrl, index) => {
                console.log(imageUrl)
                return (
                  <div
                    style={{
                      margin: '10px',
                    }}
                  >
                    <img
                      key={contents[1].split(',')[index]}
                      src={imageUrl}
                      alt={contents[1].split(',')[index]}
                      style={{
                        maxWidth: '130px',
                      }}
                    />
                    <Text bold fontSize="18px">
                      #{contents[1].split(',')[index]}
                    </Text>
                  </div>
                )
              })}
            {imgURL.length === 0 && (
              <Text bold fontSize="18px">
                {contents[1]}
              </Text>
            )}
          </div>
          <hr />
          <Text bold fontSize="14px" color="textSubtle">
            {contents[2]}
          </Text>
        </ModalContent>
      </ModalContainer>
    )
  }

  const handleAmount = (number: number) => {
    setMintAmount(mintAmount + number)
  }

  const initContract = async () => {
    try {
      const tempProvider = new ethers.providers.Web3Provider(window.ethereum as any)
      setProvider(tempProvider)

      const tempSigner = tempProvider.getSigner()
      setSigner(tempSigner)

      const tempNFTContract = new ethers.Contract(nftMintAddress, nftABI, tempSigner)
      setNFTContract(tempNFTContract)

      const tempMaxMint = await tempNFTContract.maxMint()
      const _maxMint = ethers.utils.formatUnits(`${tempMaxMint}`, 'wei')
      setMaxMint(+_maxMint)

      //  剩下NFT還沒被mint的數量
      const remainderMint = await tempNFTContract.availableTokens()
      const _remainderMint = remainderMint?.[1].length

      //  目前已被mint出來的數量
      const tempAlreadyMint = await tempNFTContract.totalSupply()
      const _alreadyMint = ethers.utils.formatUnits(`${tempAlreadyMint}`, 'wei')
      setAlreadyMint(+_alreadyMint)

      // 實際上的Supply
      const _totalSupply = Number(_remainderMint) + Number(_alreadyMint)
      setTotalSupply(+_totalSupply)
    } catch (err) {
      console.log(err)
      // // alert(err)
      // setErrorText(err.toString())
    }
  }
  interface Log {
    topics: string[]
    // other log properties
  }

  const handleMint = async () => {
    //  原本的代碼
    if (!account) {
      setErrorText('Wallet Not Conneted')
      return
    }
    try {
      setIsOpen(true)
      setContents(['Mint NFT', 'Waiting For Confirmation', 'Confirm this transaction in your wallet'])

      const nftPrice = await nftContract.mintPrice()
      const pay = mintAmount * nftPrice
      // console.log(pay)
      const result = await nftContract.mint(mintAmount, {
        value: pay,
        gasLimit: 200000 * mintAmount,
      })

      setContents(['Minting NFT', 'Your NFT is now coming...', ''])
      console.log(result)
      provider
        .getTransaction(result.hash)
        .then((tx: any) => {
          // 監聽交易上鍊事件
          tx.wait().then(async (receipt: any) => {
            console.log(`交易已上鍊，區塊高度為 ${receipt.blockNumber}`)
            swal('Success', 'NFT Bought Successfully', 'success')
            //  資料已上鍊 刷新合約信息
            setIsOnChain(true)

            //  獲取 mint的參數
            const topicsArrays = receipt.logs.map((log: Log) => log.topics)

            //  得到 mint的 tokenID (16進制)
            const fourthTopics = topicsArrays.reduce((acc, curr) => {
              acc.push(curr[3])
              return acc
            }, [])

            //  轉換tokenID為 10進制
            const topicsDecimals = fourthTopics.map((hexString) => {
              return parseInt(hexString, 16)
            })

            //  獲取NFT資料
            const tokenUris = topicsDecimals.map((tokenID) => nftContract.tokenURI(tokenID))

            //  得到所有 mint 到的 tokenURI
            Promise.all(tokenUris)
              .then((responses) => {
                const fetchPromises = responses.map(async (response) => {
                  console.log(response)
                  // 抓取各自的 tokenURI
                  return fetch(response)
                    .then((responsed) => responsed.json())
                    .then((data) => {
                      console.log(data)
                      const image = data.image.split('ipfs://')[1]
                      return `https://gateway.pinata.cloud/ipfs/${image}`
                    })
                    .catch((error) => {
                      console.error(error)
                      // 处理错误
                    })
                })
                // 并发地处理所有图像 URL
                return Promise.all(fetchPromises)
              })
              .then((imageURLs) => {
                console.log(imageURLs)
                setImgURL(imageURLs)
              })
              .catch((error) => {
                console.error(error)
                // 处理错误
              })
            console.log(tokenUris)
            setContents(['NFT Minted', `${topicsDecimals}`, `You minted ${topicsDecimals}`])
          })
        })
        .catch((err: any) => {
          console.error(err)
        })

      const alreadyMinted = Number(alreadyMint) + Number(mintAmount)
      setAlreadyMint(alreadyMinted)
    } catch (err: any) {
      if (err.reason !== undefined) swal('Error', `${err.reason}`, 'error')
      else swal('Error', `${err.message}`, 'error')
      setIsOpen(false)
      // @ts-ignore
      setErrorText(err.reason)
    }
  }

  useEffect(() => {
    if (account) {
      initContract()
    }
    if (isOnChain) {
      initContract()
      setIsOnChain((prev) => !prev)
    }
  }, [account, isOnChain])
  return (
    <>
      <Modal isOpen={isOpen} setIsOpen={setIsOpen} contents={contents} setImgURL={setImgURL} />
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
          .amount {
            font-weight: bold;
            font-size: 18px;
          }
          #home-2 .nft-1 {
            position: absolute;
            top: 18%;
            left: 10%;
          }
          #home-2 .nft-2 {
            position: absolute;
            top: 18%;
            right: 10%;
          }
          .header-box {
            display: flex;
            justify-content: space-between;
          }
          .header-box span {
            flex: 1;
          }
          .box-nft-1,
          .box-nft-2 {
            opacity: 0.6;
          }
          .box-nft-img-1 {
            position: absolute;
            top: 0;
            left: 0;
          }
          .box-nft-2 {
            top: 0;
            right: 0;
          }
          .box-nft-img-2 {
            position: absolute;
            top: 0;
            right: 0;
          }
          .box-nft-text {
            font-size: 24px;
            color: #5200ff;
          }
        `}
      </style>
      <>{!!errorText && <ErrorMessage errorMessage={errorText} setErrorText={setErrorText} />}</>

      <PageHeader>
        <Flex justifyContent="space-between" flexDirection={['column', null, null, 'row']}>
          <Flex flex="1" flexDirection="column" mr={['8px', 0]}>
            <Heading as="h1" scale="xxl" color="secondary" mb="24px">
              BNBTiger Tiger NFT
            </Heading>
            <Heading scale="md" color="text">
              Just NFT.
            </Heading>
            {/* <Heading scale="md" color="text">
              High APR.
            </Heading> */}
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

      <PageSection
        innerProps={{ style: { margin: '0', width: '100%', padding: 0, textAlign: 'center' } }}
        background={theme.colors.background}
        index={2}
        containerProps={{
          id: 'home-2',
        }}
        hasCurvedDivider={false}
      >
        {/* <Text bold fontSize={24}>
          BNB Tiger NFT
        </Text>{' '}
        <br /> */}
        {/* <Image src="./bnbtiger/nft-pic-2.png" width={200} height={243} alt="nft" className="nft-1" /> */}
        <Row justifyContent="center">
          <Card borderBackground={gradientBorderColor} style={{ minWidth: '400px', position: 'relative', zIndex: 99 }}>
            <Box background={theme.colors.gradientCardHeader} p="16px" height={headerHeight} style={{ maxWidth: 500 }}>
              <Heading size="xl" className="header-box">
                <span className="box-nft-1">
                  <Image
                    className="box-nft-img-1"
                    src="./bnbtiger/nft-pic-5.jpg"
                    width={200}
                    height={200}
                    alt="box-nft-1"
                  />
                </span>
                <span
                  className="box-nft-text"
                  style={{
                    color: 'black',
                  }}
                >
                  Nft Mint
                </span>
                <span className="box-nft-2">
                  <Image
                    className="box-nft-img-2"
                    src="./bnbtiger/nft-pic-7.jpg"
                    width={200}
                    height={200}
                    alt="box-nft-2"
                  />
                </span>
              </Heading>
            </Box>
            <CardBody>
              <Row justifyContent="center">
                <IconButton
                  mr="24px"
                  variant="secondary"
                  disabled={mintAmount === 1}
                  onClick={() => {
                    handleAmount(-1)
                  }}
                >
                  <MinusIcon color="primary" width="14px" />
                </IconButton>
                <span className="amount">{mintAmount}</span>
                <IconButton
                  ml="24px"
                  variant="secondary"
                  disabled={mintAmount === maxMint}
                  onClick={() => {
                    handleAmount(1)
                  }}
                >
                  <AddIcon color="primary" width="14px" />
                </IconButton>
              </Row>
              <Row>
                <Button
                  width="100%"
                  mt="24px"
                  variant="bubblegum"
                  style={{ border: '1px solid grey' }}
                  onClick={handleMint}
                >
                  Mint
                </Button>
              </Row>
            </CardBody>
            <CardBody>NFT Price : 0.01 BNB</CardBody>
            <CardFooter>
              Mint Progress : {alreadyMint}
              <Slider
                name="slider"
                min={0}
                max={totalSupply}
                value={alreadyMint}
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                onValueChanged={() => {}}
                disabled
                valueLabel={totalSupply === alreadyMint ? 'MAX' : `${(alreadyMint / totalSupply) * 100}%`}
              />
              Total : {totalSupply}
            </CardFooter>
          </Card>
        </Row>
        {/* <Image src="./bnbtiger/nft-pic-1.png" width={200} height={243} alt="nft2" className="nft-2" /> */}
      </PageSection>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
        <NftQuestions />
      </div>
    </>
  )
}

export default NftMarketPage
