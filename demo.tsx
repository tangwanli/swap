import React, { useState, useEffect } from "react";
import swal from 'sweetalert'
// import Web3 from 'web3'
import contractABI from './abi/idoABI.json';
import usdtABI from './abi/usdtABI.json';
import { ethers } from 'ethers';
import Loading from "./Loading";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Countdown from "./Countdown";
import ClaimABI from './abi/ClaimABI.json'


// // let OKCMainnetProvider = 'https://exchainrpc.okex.org/';
// let BSCMainnetProvider = 'https://bsc-dataseed.binance.org/';
// let web3 = new Web3(new Web3.providers.HttpProvider(BSCMainnetProvider));
const claimContractAddress = "0xBA8CC2640264B84B1FA32B4AA5dEC7058AF1Ca16";
const usdtAddress = "0x55d398326f99059fF775485246999027B3197955";
const contractAddress = "0x4c144A05D8B3e5B68973009935a68d55DD61be6D";
const defaultInviter = "0x16c21c28FED3e3B545493e111dB87842D11281AD";
const slicedDefaultInviter = `${defaultInviter.slice(0, 4)}...${defaultInviter.slice(-4)}`;

const Resume = ({ classicHeader, darkTheme, defaultAccount, language }) => {
    const [contributionAmount, setContributionAmount] = useState(0);
    const [referralAmount, setReferralAmount] = useState(0);
    const [isInviterSet, setIsInviterSet] = useState(false)
    const [isJoined, setIsJoined] = useState(false);
    const [isClaimActive, setIsClaimActive] = useState(false);
    const [isIDOActive, setIsIDOActive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isClaimed, setIsClaimed] = useState(false);

    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [contract, setContract] = useState(null);
    const [usdtContract, setUsdtContract] = useState(null);

    const [claimContract, setClaimContract] = useState(null);


    const [personalLink, setPersonalLink] = useState(null);
    const [copied, setCopied] = useState(false);
    const [parentAddress, setParentAddress] = useState("0x...")
    const [inviterAddress, setInviterAddress] = useState(defaultInviter)

    // const setLink = (value) => {
    //     if (value === null) {
    //         return;
    //     }
    //     let tempLink = window.location.origin + "/?inviter=" + value
    //     setPersonalLink(tempLink);
    // }

    // const getLink = () => {
    //     if (personalLink !== null) return;
    //     if (defaultAccount === null) return;
    //     // swal("Error", "You need to connect wallet to get invite link","error"); 
    //     setLink(defaultAccount)
    // }

    // const analyzeLink = () => {
    //     if (inviterAddress !== defaultInviter) return;
    //     if (isInviterSet === true) return;
    //     try {
    //         let inputString;
    //         if (window.location.path === "/")
    //             inputString = window.location.search;
    //         else
    //             inputString = window.location.path;

    //         if (inputString.includes("0x")) {
    //             let StartIndex = inputString.indexOf("0x");
    //             try {
    //                 let publicAddress = inputString.substring(StartIndex, StartIndex + 42);
    //                 setInviterAddress(publicAddress);
    //                 setIsInviterSet(true);
    //             } catch (err) {

    //             }
    //         }
    //     } catch (error) {
    //         try {
    //             let inputArray = document.URL.split("/")
    //             let inputString = inputArray[inputArray.length - 1]
    //             if (inputString.includes("0x")) {
    //                 console.log("6")
    //                 let StartIndex = inputString.indexOf("0x");
    //                 console.log(inputString)
    //                 let publicAddress = inputString.substring(StartIndex, StartIndex + 42);
    //                 setInviterAddress(publicAddress);
    //                 setIsInviterSet(true);
    //             }
    //         } catch (err) {

    //         }
    //     }
    // }


    // analyzeLink()
    // getLink()

    // const copyLink = () => {
    //     if (defaultAccount === null) {
    //         if (language === "中") {
    //             swal("錯誤", "請先連結錢包來獲得邀請連結", "error");
    //             return;
    //         }
    //         swal("Error", "Connect wallet first to get your invitation link", "error");
    //         return;
    //     }
    //     try {
    //         setCopied(true)
    //         if (language === "中") {
    //             swal("成功", `成功複製連結 ${personalLink}`, "success")
    //             return;
    //         }
    //         swal("Success", `You invitaion link ${personalLink} has been successfully copied`, "success")
    //     } catch (err) {
    //         alert(err)
    //     }
    // }


    // const updateEthers = async () => {
    //     try {
    //         let tempProvider = new ethers.providers.Web3Provider(window.ethereum);
    //         setProvider(tempProvider);

    //         let tempSigner = tempProvider.getSigner();
    //         setSigner(tempSigner);

    //         let tempContract = new ethers.Contract(contractAddress, contractABI, tempSigner)
    //         setContract(tempContract);

    //         let tempUSDTContract = new ethers.Contract(usdtAddress, usdtABI, tempSigner)
    //         setUsdtContract(tempUSDTContract);

    //         let tempClaimContract = new ethers.Contract(claimContractAddress, ClaimABI, tempSigner)
    //         setClaimContract(tempClaimContract)

    //         // let tempContributionHex = await tempContract.AddressToJoinUsdtAmount(defaultAccount);
    //         // let tempContribution = ethers.utils.formatEther(`${tempContributionHex}`);
    //         // setContributionAmount(tempContribution);
    //         let tempContributionHex = await tempClaimContract.claimAmount(defaultAccount);
    //         let tempContribution = ethers.utils.formatEther(`${tempContributionHex}`);
    //         console.log(tempContribution)
    //         if (tempContribution !== '0.0')
    //             setContributionAmount(`${tempContribution.slice(0, tempContribution.length - 2)}000000000`);
    //         console.log(tempContributionHex)

    //         let tempReferralHex = await tempContract.AddressToRewardAmount(defaultAccount);
    //         let tempReferral = ethers.utils.formatEther(`${tempReferralHex}`);
    //         setReferralAmount(tempReferral);

    //         // let tempJoin = await tempContract.isAddressJoined(defaultAccount);
    //         // setIsJoined(tempJoin);

    //         let tempParent = await tempContract.fatherAddress(defaultAccount);
    //         if (tempParent === "0x0000000000000000000000000000000000000000")
    //             setParentAddress("0x...");
    //         if (tempParent !== "0x0000000000000000000000000000000000000000")
    //             setParentAddress(`${tempParent.slice(0, 4)}...${tempParent.slice(-4)}`);

    //         let tempClaimActive = await tempClaimContract.canClaim();
    //         setIsClaimActive(tempClaimActive);
    //         // let tempClaimActive = await tempContract.isClaimActive();
    //         // setIsClaimActive(tempClaimActive);

    //         // let tempIDOActive = await tempContract.isIDOActive();
    //         // setIsIDOActive(tempIDOActive);

    //         let tempIsClaimed = await tempClaimContract.canAddressClaim(defaultAccount);
    //         setIsClaimed(!tempIsClaimed);
    //     } catch {

    //     }
    // }

    // useEffect(() => {
    //     setLink(defaultAccount)
    //     if (defaultAccount !== null)
    //         updateEthers()
    // }, [defaultAccount])

    // const checkBalance = async () => {
    //     let tempBalanceHex = await usdtContract.balanceOf(defaultAccount);
    //     let tempBalance = ethers.utils.formatEther(`${tempBalanceHex}`, 'ether');
    //     return tempBalance;
    // }

    // const checkAllowance = async () => {
    //     let allowance = await usdtContract.allowance(defaultAccount, contractAddress);
    //     const allowanceAmount = ethers.utils.formatEther(`${allowance}`, 'ether');
    //     return allowanceAmount;
    // }

    // const checkAllowanceAgain = async (value) => {
    //     let result = await checkAllowance()

    //     if (result < value) {
    //         setIsLoading(true);
    //         setTimeout(async () => {
    //             await checkAllowanceAgain(value)
    //             return;
    //         }, 3000)
    //     }
    //     else
    //         handleContribute(value);
    // }

    // const makeApprove = async (value) => {
    //     if (defaultAccount === null) {
    //         if (language === "中") {
    //             swal("錯誤", "請先連接錢包", "error");
    //             return;
    //         }
    //         swal("Error", "Please Connect Your Wallet", "error");
    //         return;
    //     }
    //     if (!isIDOActive) {
    //         if (language === "中") {
    //             swal("錯誤", "IDO 未開放", "error");
    //             // swal("錯誤", "請檢查連線VPN 或 重新整理網頁", "error");
    //             return;
    //         }
    //         // swal("Error", "Please check your network connection or refresh the page", "error");
    //         swal("Error", "IDO is not active", "error");
    //         return;
    //     }

    //     let amount = 0;
    //     if (value === 0) amount = 50;
    //     if (value === 1) amount = 100;
    //     if (value === 2) amount = 200;

    //     if (isJoined) {
    //         if (language === "中") {
    //             swal("錯誤", "您已參加過IDO", "error");
    //             return;
    //         }
    //         swal("Error", "You have already joined before!!", "error");
    //         return;
    //     }

    //     let balance = await checkBalance();
    //     if (balance < amount || balance < amount || balance < amount) {
    //         if (language === "中") {
    //             swal("錯誤", "您沒有足夠的USDT", "error");
    //             return;
    //         }
    //         swal("Error", "You don't have enought USDT", "error");
    //         return;
    //     }


    //     let result = await checkAllowance()
    //     const approveAmount = ethers.utils.parseEther(`${amount}`);

    //     if (result >= amount) {
    //         handleContribute(amount)
    //     }
    //     else
    //         try {
    //             let result2 = await usdtContract.approve(contractAddress, approveAmount);
    //             if (result2)
    //                 checkAllowanceAgain(amount);
    //         } catch {
    //             if (language === "中") {
    //                 swal("錯誤", "授權USDT失敗", "error");
    //                 return;
    //             }
    //             swal("Error", "Failed to approve", "error");
    //             return;
    //         }
    // }

    // const handleContribute = async (value) => {
    //     setIsLoading(false);
    //     try {
    //         let etherAmount;
    //         etherAmount = ethers.utils.parseEther(`${value}`);

    //         let result = await contract.makeIDO(
    //             inviterAddress, etherAmount, { gasLimit: "300000" }
    //         );

    //         if (result) {
    //             setIsJoined(true);
    //             setContributionAmount(value);
    //             if (inviterAddress !== defaultAccount)
    //                 setParentAddress(`${inviterAddress.slice(0, 4)}...${inviterAddress.slice(-4)}`);
    //             else
    //                 setParentAddress(`${defaultInviter.slice(0, 4)}...${defaultInviter.slice(-4)}`);

    //             if (language === "中") {
    //                 if (value === 0)
    //                     swal("成功", "成功認購 50 USDT", "success");
    //                 if (value === 1)
    //                     swal("成功", "成功認購 100 USDT", "success");
    //                 if (value === 2)
    //                     swal("成功", "成功認購 200 USDT", "success");
    //                 return;
    //             }
    //             if (value === 0)
    //                 swal("Success", "Successfully Contribute With 50 USDT", "success");
    //             if (value === 1)
    //                 swal("Success", "Successfully Contribute With 100 USDT", "success");
    //             if (value === 2)
    //                 swal("Success", "Successfully Contribute With 200 USDT", "success");
    //         } else {
    //             if (language === "中") {
    //                 swal("錯誤", "認購失敗", "error");
    //                 return;
    //             }
    //             swal("Error", "Failed to Contribute", "error");
    //         }

    //     } catch (err) {

    //     }

    // }

    // const handleClaim = async () => {
    //     if (language === "中") {
    //         if (contributionAmount == 0) {
    //             swal("錯誤", "您並未進行任何認購", "error")
    //             return;
    //         }
    //         if (isClaimed) {
    //             swal("錯誤", "您已領取過，無法重複領取", "error");
    //             return;
    //         }
    //         if (!isClaimActive) {
    //             swal("錯誤", "現在還不能領幣，領幣時間請關注官方電報", "error")
    //             return;
    //         }
    //     }
    //     if (contributionAmount == 0) {
    //         swal("Error", "You haven't make any contribution yet", "error")
    //         return;
    //     }
    //     if (isClaimed) {
    //         swal("Error", "You have already claimed", "error");
    //         return;
    //     }
    //     if (!isClaimActive && defaultAccount !== "0x2678ecc61df4f476930069c801786efa5f1ca72f") {
    //         swal("Error", "Cannot Claim Right Now. The time able to claim will be informed in our official telegram.", "error")
    //         return
    //     }

    //     let result = await claimContract.claim()
    //     console.log(result)
    // }

    return (
        <div className="row gx-5">

            {/* 第一个块，参与ido */}
            <div>
                <p>1. {language === "中" ? <>用 USDT 認購</> : <>Make Contribution with USDT</>}</p>

                {/* <div>
                    {educationDetails.length > 0 &&
                        ['50', '100', '200'].map((Quota, index) => (
                            <div key={index} onClick={() => makeApprove(index)}>
                                <div>{Quota}</div>
                            </div>
                        ))}
                </div> */}

                {/* 邀请者的 address */}
                {/* <span>{language === "中" ? <> 當前邀請者 : </> : <>Current Inviter : </>}
                    <span>{inviterAddress === defaultInviter ? <span>{language === "中" ? " 無邀請者" : " No Inviter"}</span> : <span>{inviterAddress}</span>}</span>
                </span> */}
            </div>

            {/* 第二个块，复制链接 */}
            <div>
                    <p>
                        2. {language === "中" ? <>邀請好友 獲得 USDT</> : <>Earn USDT with Invitation</>}
                    </p>
                {/* <p>{
                    personalLink !== null ? personalLink :
                        <>{
                            language !== "中" ? "Please Connect Your Wallet" : "請連接錢包"
                        }</>
                }</p> */}
                <div>
                    {/* 复制链接 */}
                    {/* <CopyToClipboard
                        text={personalLink}
                        onCopy={copyLink}
                    >
                        <span>{language === "中" ? <>複製</> : <>Copy</>}</span>
                    </CopyToClipboard> */}
                </div>
            </div>

            {/* 第三个块，提币 */}
            <div>
                {/* <div>
                    <p>{language === "中" ? <>認購額度</> : <>Contribution</>}</p>
                    <h3>{contributionAmount} Cat</h3>
                    <p>{language === "中" ? <>聰明的選擇</> : <>Smart Choice</>}</p>
                </div> */}
                {/* <div>
                    <a onClick={handleClaim}>{language === "中" ? <>提幣</> : <>Claim</>}</a>
                </div> */}
            </div>

            {/* 第四个块，邀请奖励 */}
            <div>
                {/* <div>
                    <p>{language === "中" ? <>邀請獎勵</> : <>Invitation reward</>}</p>
                    <h3>{language === "中" ? <>業績 (自動到帳) </> : <>Income (auto)</>}：{referralAmount} USDT</h3>
                    <p>
                        {language === "中" ? <>上級地址</> : <>Parent node</>}：
                        {parentAddress === "0x..." ?
                            <span>{language === "中" ? "沒有上級地址" : "No Parent Node"} </span> : parentAddress}
                    </p>
                </div> */}
            </div>
        </div>
    );
};

export default Resume;
