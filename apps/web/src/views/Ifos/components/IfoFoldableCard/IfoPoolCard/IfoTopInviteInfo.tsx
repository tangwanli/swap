/* eslint-disable no-restricted-globals */
import { useState, useEffect, Dispatch, SetStateAction } from 'react'
import { Text, Input } from '@pancakeswap/uikit'
import swal from 'sweetalert'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import styled from 'styled-components'
import { useAccount } from 'wagmi'
import contractABI from 'config/abi/ido-idoABI.json'
import usdtABI from 'config/abi/ido-usdtABI.json'
import ClaimABI from 'config/abi/ido-ClaimABI.json'
import { ethers } from 'ethers'
import { useTranslation } from '@pancakeswap/localization'
import ConfirmSwapModal from 'views/Swap/components/ConfirmSwapModal'

const StyleBox = styled.div`
  margin-bottom: 10px;
  .buy-box {
    display: flex;
    .buy-item {
      cursor: pointer;
      margin-right: 10px;
      padding: 0 20px;
      border: 1px solid var(--colors-textSubtle);
      border-radius: 8px;
    }
  }
`
const StyleLabel = styled.div`
  display: flex;
  margin-bottom: 10px;
  color: var(--colors-secondary);
  font-weight: 600;
  line-height: 1.5;
  font-size: 14px;
  .invite {
    color: var(--colors-textSubtle);
    font-size: 12px;
    .invite-text {
      color: var(--colors-text);
      margin-left: 4px;
      font-size: 14px;
      font-weight: 600;
    }
    .invite-text:first-child {
      margin-right: 4px;
    }
  }
  .right-text {
    margin-left: auto;
    cursor: pointer;
  }
`
const usdtAddress = '0xbd4E07164F583c2Cb87655BDdE1b7050D9aecE05'
const contractAddress = '0x4915E5641ad9a37CDCbF5Bf3e9edDaaD4bc5aCF8'
const defaultInviter = '0x0D971B7B7520f1FCE9b90665CA59952ea2c52b04'

const IfoTopInviteInfo = () => {
  const { address: account } = useAccount()
  const { t } = useTranslation()
  const [contributionAmount, setContributionAmount] = useState<string>('0')
  const [allowedIDOAmount, setAllowedIDOAmount] = useState<string>('0')
  // 分享的奖励 usdt
  const [referralAmount, setReferralAmount] = useState<string>('0')
  const [isJoined, setIsJoined] = useState(false)
  const [isClaimActive, setIsClaimActive] = useState(false)
  const [isIDOActive, setIsIDOActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isClaimed, setIsClaimed] = useState(false)

  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [contract, setContract] = useState(null)
  const [usdtContract, setUsdtContract] = useState(null)

  //  交易上鍊後 更新資訊用
  const [isOnChain, setIsOnChain] = useState(false)

  // 当前用户的邀请url
  const [personalLink, setPersonalLink] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [parentAddress, setParentAddress] = useState('0x...')
  // 设置了邀请人
  const [isInviterSet, setIsInviterSet] = useState(false)
  // 邀请的地址address.即 上级的address，和上面的parentAddress好像冲突了
  const [inviterAddress, setInviterAddress] = useState(defaultInviter)
  const [inviteInfo, setInviteInfo] = useState([])

  const [BNBAmount, setBNBAmount] = useState(null)
  const [maximumBNBAmount, setMaximumBNBAmount] = useState<string>('0')

  const [isOpen, setIsOpen] = useState(false)
  const [contents, setContents] = useState(['String1', 'String1', 'String1'])

  const copyLink = () => {
    if (account === null) {
      swal('Error', 'Connect wallet first to get your invitation link', 'error')
      return
    }
    try {
      swal('Success', `You invitaion link ${personalLink} has been successfully copied`, 'success')
    } catch (err) {
      // alert(err)
    }
  }

  // 初始化inviterAddress
  const initInviterAddress = () => {
    if (isInviterSet) return
    try {
      const inputString = window.location.search

      if (inputString.includes('0x')) {
        const start = inputString.indexOf('0x')
        const publicAddress = inputString.substring(start, start + 42)
        setInviterAddress(publicAddress)
        setIsInviterSet(true)
      }
    } catch (error) {
      const inputArray = document.URL.split('/')
      const inputString = inputArray[inputArray.length - 1]
      if (inputString.includes('0x')) {
        const start = inputString.indexOf('0x')
        const publicAddress = inputString.substring(start, start + 42)
        setInviterAddress(publicAddress)
        setIsInviterSet(true)
      }
    }
  }

  // 初始化合约相关函数
  const initContract = async () => {
    try {
      const tempProvider = new ethers.providers.Web3Provider(window.ethereum as any)
      setProvider(tempProvider)

      const tempSigner = tempProvider.getSigner()
      setSigner(tempSigner)

      const tempContract = new ethers.Contract(contractAddress, contractABI, tempSigner)
      setContract(tempContract)
      setUsdtContract(new ethers.Contract(usdtAddress, usdtABI, tempSigner))

      const tempAllowedIDOAmount = await tempContract.allowedIDOAmount(account)
      const realAllowedIDOAmount = ethers.utils.formatEther(`${tempAllowedIDOAmount}`)
      setAllowedIDOAmount(realAllowedIDOAmount)

      const personalInfo = await tempContract.personalInfo(account)
      const tempContributionHex = personalInfo.joinedAmount
      const tempContribution = ethers.utils.formatEther(`${tempContributionHex}`)
      setContributionAmount(tempContribution)

      const tempMaximumBNBAmount = await tempContract.maximumBNBAmount()
      const realMaximumBNBAmount = ethers.utils.formatEther(`${tempMaximumBNBAmount}`)
      setMaximumBNBAmount(realMaximumBNBAmount)
      // const tempContributionHex = await tempClaimContract.claimAmount(account);
      // const tempContribution = ethers.utils.formatEther(`${tempContributionHex}`);
      // if (tempContribution !== '0.0')
      //     setContributionAmount(`${tempContribution.slice(0, tempContribution.length - 2)}000000000`);

      const tempReferralHex = await tempContract.AddressToInviteAmount(account)
      const tempReferral = ethers.utils.formatEther(`${tempReferralHex}`)
      setReferralAmount(tempReferral)

      const tempParent = await tempContract.upperNode(account)
      if (tempParent === '0x0000000000000000000000000000000000000000') setParentAddress('0x...')
      if (tempParent !== '0x0000000000000000000000000000000000000000')
        setParentAddress(`${tempParent.slice(0, 4)}...${tempParent.slice(-4)}`)

      const tempClaimActive = await tempContract.isClaimActive()
      setIsClaimActive(tempClaimActive)

      // 关闭时候，需要注释
      const tempIDOActive = await tempContract.isIDOActive()
      setIsIDOActive(tempIDOActive)

      const tempInviteInfo = await tempContract.getInviteInfo(account)
      setInviteInfo(tempInviteInfo)
    } catch (error) {
      console.log('666')
      console.log(error)
    }
  }

  // 查看钱包地址，剩余得 usdt数量
  const checkBalance = async () => {
    const tempBalanceHex = await usdtContract.balanceOf(account)
    const tempBalance = ethers.utils.formatEther(`${tempBalanceHex}`)
    return tempBalance
  }

  // 查看钱包授权得usdt数量
  const checkAllowance = async () => {
    const allowance = await usdtContract.allowance(account, contractAddress)
    const allowanceAmount = ethers.utils.formatEther(`${allowance}`)
    return allowanceAmount
  }

  // 再次向用户查看授权，然后购买
  const checkAllowanceAgain = async (value) => {
    const result = await checkAllowance()

    if (result < value) {
      setIsLoading(true)
      setTimeout(() => {
        checkAllowanceAgain(value)
      }, 3000)
    } else handleContribute(value)
  }

  // 应该是购买相关得函数了，进行ido购买
  const handleContribute = async (value) => {
    setIsLoading(false)
    try {
      const etherAmount = ethers.utils.parseEther(`${value}`)

      const result = await contract.makeIDO(inviterAddress?.toLowerCase(), etherAmount, { gasLimit: '600000' })

      if (result) {
        setIsJoined(true)
        setContributionAmount(value)
        if (inviterAddress !== account) setParentAddress(`${inviterAddress.slice(0, 4)}...${inviterAddress.slice(-4)}`)
        else setParentAddress(`${defaultInviter.slice(0, 4)}...${defaultInviter.slice(-4)}`)

        if (value === 0) swal('Success', 'Successfully Contribute With 50 USDT', 'success')
        if (value === 1) swal('Success', 'Successfully Contribute With 100 USDT', 'success')
        if (value === 2) swal('Success', 'Successfully Contribute With 200 USDT', 'success')
      } else {
        swal('Error', 'Failed to Contribute', 'error')
      }
    } catch (err) {
      console.log(err)
    }
  }

  // 购买ido
  const makeApprove = async (value) => {
    if (!account) {
      swal('Error', 'Please Connect Your Wallet', 'error')
      return
    }
    if (!isIDOActive) {
      swal('Error', 'IDO is not active', 'error')
      return
    }

    let amount = 0
    if (value === 0) amount = 50
    if (value === 1) amount = 100
    if (value === 2) amount = 200

    if (isJoined) {
      swal('Error', 'You have already joined before!!', 'error')
      return
    }

    const balance = await checkBalance()
    if (+balance < +amount) {
      swal('Error', "You don't have enough USDT", 'error')
      return
    }

    const result = await checkAllowance()
    const approveAmount = ethers.utils.parseEther(`${amount}`)

    if (+result >= +amount) {
      handleContribute(amount)
    } else
      try {
        const result2 = await usdtContract.approve(contractAddress, approveAmount)
        if (result2) checkAllowanceAgain(amount)
      } catch {
        swal('Error', 'Failed to approve', 'error')
      }
  }

  // 领币
  const handleClaim = async () => {
    if (+contributionAmount === 0) {
      swal('Error', "You haven't make any contribution yet", 'error')
      return
    }
    if (isClaimed) {
      swal('Error', 'You have already claimed', 'error')
      return
    }
    if (!isClaimActive) {
      swal(
        'Error',
        'Cannot Claim Right Now. The time able to claim will be informed in our official telegram.',
        'error',
      )
      return
    }

    try {
      setIsOpen(true)
      setContents(['Claim IDO Token', 'Waiting For Confirmation', 'Confirm this transaction in your wallet'])

      const result = await contract.claimToken()

      setContents(['Claiming Token', 'You are claiming IDO token', ''])
      provider
        .getTransaction(result.hash)
        .then((tx: any) => {
          // 監聽交易上鍊事件
          tx.wait().then((receipt: any) => {
            console.log(`交易已上鍊，區塊高度為 ${receipt.blockNumber}`)
            swal('Success', 'Successfully Claimed', 'success')
            setIsOnChain(true)
            setIsOpen(false)
          })
        })
        .catch((err: any) => {
          console.error(err)
        })
    } catch (err: any) {
      if (err.reason !== undefined) swal('Error', `${err.reason}`, 'error')
      else swal('Error', `${err.message}`, 'error')
    }
  }

  useEffect(() => {
    initInviterAddress()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (account) {
      // eslint-disable-next-line prefer-destructuring
      const href = location.href
      let tempLink = ''
      const regStr = `INVITER=${inviterAddress}`
      if (href?.includes(`INVITER=${inviterAddress}`)) {
        const reg = new RegExp(regStr, 'g')
        tempLink = href.replace(reg, `INVITER=${account}`)
      } else if (href?.includes('?')) {
        tempLink = `${href}&INVITER=${account}`
      } else {
        tempLink = `${href}?INVITER=${account}`
      }
      setPersonalLink(tempLink)
      initContract()
    }

    if (isOnChain) {
      initContract()
      setIsOnChain((prev) => !prev)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, isOnChain])

  const idoWithBNB = async () => {
    if (account === null || account === undefined) return
    const bnbAmount = ethers.utils.parseUnits(`${BNBAmount}`, 'ether')
    try {
      setIsOpen(true)
      setContents(['Confirm IDO', 'Waiting For Confirmation', 'Confirm this transaction in your wallet'])

      const result = await contract.makeIDO(inviterAddress, {
        value: bnbAmount,
      })

      setContents(['Participating IDO', 'Your Transaction is now sending', ''])

      provider
        .getTransaction(result.hash)
        .then((tx: any) => {
          // 監聽交易上鍊事件
          tx.wait().then((receipt: any) => {
            console.log(`交易已上鍊，區塊高度為 ${receipt.blockNumber}`)
            swal('Success', '已成功认购', 'success')
            setIsOnChain(true)
            setIsOpen(false)
          })
        })
        .catch((err: any) => {
          console.error(err)
        })
    } catch (err: any) {
      setIsOpen(false)
      if (err.reason !== undefined) swal('Error', `${err.reason}`, 'error')
      else swal('Error', `${err.message}`, 'error')
    }
  }

  const Table = styled.table`
    border-collapse: collapse;
    width: 100%;
    font-family: Arial, sans-serif;
  `

  const Th = styled.th`
    text-align: left;
    padding: 8px;
    border-bottom: 1px solid #ddd;
    background-color: #4caf50;
    color: white;
  `

  const Td = styled.td`
    text-align: left;
    padding: 8px;
    border-bottom: 1px solid #ddd;
  `

  const OddRow = styled.tr`
    background-color: #f5f5f5;
  `

  const EvenRow = styled.tr`
    background-color: #fff;
  `

  const PaginationButton = styled.button`
    margin: 0 8px;
  `

  const PaginationContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 16px;
    margin-left: 16px;
  `

  const PaginationText = styled.div`
    margin-right: 16px;
  `

  const TableComponent = ({ infoArray }) => {
    const [currentPage, setCurrentPage] = useState(1)

    if (!Array.isArray(infoArray) || infoArray.length === 0) {
      return <div>No data available.</div>
    }

    const itemsPerPage = 10
    const totalPages = Math.ceil(inviteInfo.length / itemsPerPage)

    const handlePageChange = (page) => {
      setCurrentPage(page)
    }

    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage

    const pagedInviteInfo = inviteInfo.slice(startIndex, endIndex)

    return (
      <Table>
        <thead>
          <tr>
            <Th>Address</Th>
            <Th>Amount</Th>
          </tr>
        </thead>
        <tbody>
          {pagedInviteInfo.map((data, index) => {
            const oddOrEven = index % 2
            if (oddOrEven === 0)
              return (
                <OddRow>
                  <Td>
                    {data.invitedAddress.slice(0, 4)}...{data.invitedAddress.slice(-4)}
                  </Td>
                  <Td>{Number(ethers.utils.formatEther(data.invitedAmount)).toFixed(4)} BNB</Td>
                </OddRow>
              )
            return (
              <EvenRow>
                <Td>
                  {data.invitedAddress.slice(0, 4)}...{data.invitedAddress.slice(-4)}
                </Td>
                <Td>{Number(ethers.utils.formatEther(data.invitedAmount)).toFixed(4)} BNB</Td>
              </EvenRow>
            )
          })}
        </tbody>
        <tfoot>
          {totalPages !== 1 && (
            <PaginationContainer>
              <PaginationText>Current Page: {currentPage}</PaginationText>
              <PaginationButton disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>
                Prev
              </PaginationButton>
              <PaginationButton disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>
                Next
              </PaginationButton>
            </PaginationContainer>
          )}
        </tfoot>
      </Table>
    )
  }

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
    z-index: 1;
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
  }

  const Modal: React.FC<ModalProps> = () => {
    const closeModal = () => {
      setIsOpen(false)
    }

    return (
      <ModalContainer isOpen={isOpen}>
        <ModalContent>
          <ModalClose onClick={closeModal}>&times;</ModalClose>
          <ModalTitle>{contents[0]}</ModalTitle>
          <hr />
          <div
            style={{
              marginTop: '10vh',
              marginBottom: '10vh',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Text bold fontSize="18px">
              {contents[1]}
            </Text>
          </div>
          <hr />
          <Text bold fontSize="14px" color="textSubtle">
            {contents[2]}
          </Text>
        </ModalContent>
      </ModalContainer>
    )
  }

  return (
    <>
      <Modal isOpen={isOpen} setIsOpen={setIsOpen} contents={contents} />
      <StyleBox>
        <StyleLabel>上级地址:</StyleLabel>
        <Text bold fontSize="14px" color="textSubtle">
          {parentAddress === '0x...' ? '无上级地址' : parentAddress}
        </Text>
      </StyleBox>
      <br />
      <StyleBox>
        <StyleLabel>
          我的邀请链接 :{' '}
          <span className="invite">
            <span className="invite-text">邀请好友</span>获得<span className="invite-text">BNB</span>
          </span>
          {!!personalLink && (
            <span className="right-text">
              <CopyToClipboard text={personalLink} onCopy={copyLink}>
                <span>复制</span>
              </CopyToClipboard>
            </span>
          )}
        </StyleLabel>
        <Text
          bold
          fontSize="14px"
          color="textSubtle"
          style={{
            wordBreak: 'break-word',
          }}
        >
          {personalLink || '請連接錢包'}
        </Text>
      </StyleBox>
      <br />
      <StyleBox>
        <StyleLabel>
          可认购额度 :
          <span className="invite">
            <span className="invite-text">
              {Number(allowedIDOAmount) <= Number(maximumBNBAmount)
                ? Number(allowedIDOAmount).toFixed(4)
                : Number(maximumBNBAmount).toFixed(4)}{' '}
              BNB
            </span>
          </span>
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        </StyleLabel>
      </StyleBox>

      <StyleBox>
        <StyleLabel>
          已认购额度 :
          <span className="invite">
            <span className="invite-text">{Number(contributionAmount).toFixed(4)} BNB</span>
          </span>
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
          <span className="right-text" onClick={handleClaim}>
            提币
          </span>
        </StyleLabel>
      </StyleBox>

      <StyleBox>
        <StyleLabel>
          邀请奖励(自动到账) :
          <span className="invite">
            <span className="invite-text">{(Number(referralAmount) / 20).toFixed(4)} BNB</span>
          </span>
        </StyleLabel>
      </StyleBox>

      <StyleBox>
        <StyleLabel>
          认购 :
          <Input
            scale="sm"
            placeholder={t('用 BNB 认购')}
            style={{ marginLeft: '20px', maxWidth: '200px', width: '30vw' }}
            onChange={(e) => setBNBAmount(e.target.value)}
            type="number"
          />
          <span
            className="invite"
            style={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <span
              className="invite-text"
              style={{
                paddingLeft: '10px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {' '}
              BNB{' '}
            </span>
          </span>
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
          <span className="right-text" onClick={idoWithBNB}>
            认购
          </span>
        </StyleLabel>
      </StyleBox>
      <br />
      <StyleBox>
        <StyleLabel>邀请资讯：</StyleLabel>

        <TableComponent infoArray={inviteInfo} />
      </StyleBox>
    </>
  )
}

export default IfoTopInviteInfo
