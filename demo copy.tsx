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

    const setLink = (value) => {
        if (value === null) {
            return;
        }
        let tempLink = window.location.origin + "/?inviter=" + value
        setPersonalLink(tempLink);
    }

    const getLink = () => {
        if (personalLink !== null) return;
        if (defaultAccount === null) return;
        // swal("Error", "You need to connect wallet to get invite link","error"); 
        setLink(defaultAccount)
    }

    const analyzeLink = () => {
        if (inviterAddress !== defaultInviter) return;
        if (isInviterSet === true) return;
        try {
            let inputString;
            if (window.location.path === "/")
                inputString = window.location.search;
            else
                inputString = window.location.path;

            if (inputString.includes("0x")) {
                let StartIndex = inputString.indexOf("0x");
                try {
                    let publicAddress = inputString.substring(StartIndex, StartIndex + 42);
                    setInviterAddress(publicAddress);
                    setIsInviterSet(true);
                } catch (err) {

                }
            }
        } catch (error) {
            try {
                let inputArray = document.URL.split("/")
                let inputString = inputArray[inputArray.length - 1]
                if (inputString.includes("0x")) {
                    console.log("6")
                    let StartIndex = inputString.indexOf("0x");
                    console.log(inputString)
                    let publicAddress = inputString.substring(StartIndex, StartIndex + 42);
                    setInviterAddress(publicAddress);
                    setIsInviterSet(true);
                }
            } catch (err) {

            }
        }
    }


    analyzeLink()
    getLink()

    const copyLink = () => {
        if (defaultAccount === null) {
            if (language === "中") {
                swal("錯誤", "請先連結錢包來獲得邀請連結", "error");
                return;
            }
            swal("Error", "Connect wallet first to get your invitation link", "error");
            return;
        }
        try {
            setCopied(true)
            if (language === "中") {
                swal("成功", `成功複製連結 ${personalLink}`, "success")
                return;
            }
            swal("Success", `You invitaion link ${personalLink} has been successfully copied`, "success")
        } catch (err) {
            alert(err)
        }
    }


    const updateEthers = async () => {
        try {
            let tempProvider = new ethers.providers.Web3Provider(window.ethereum);
            setProvider(tempProvider);

            let tempSigner = tempProvider.getSigner();
            setSigner(tempSigner);

            let tempContract = new ethers.Contract(contractAddress, contractABI, tempSigner)
            setContract(tempContract);

            let tempUSDTContract = new ethers.Contract(usdtAddress, usdtABI, tempSigner)
            setUsdtContract(tempUSDTContract);

            let tempClaimContract = new ethers.Contract(claimContractAddress, ClaimABI, tempSigner)
            setClaimContract(tempClaimContract)

            // let tempContributionHex = await tempContract.AddressToJoinUsdtAmount(defaultAccount);
            // let tempContribution = ethers.utils.formatEther(`${tempContributionHex}`);
            // setContributionAmount(tempContribution);
            let tempContributionHex = await tempClaimContract.claimAmount(defaultAccount);
            let tempContribution = ethers.utils.formatEther(`${tempContributionHex}`);
            console.log(tempContribution)
            if (tempContribution !== '0.0')
                setContributionAmount(`${tempContribution.slice(0, tempContribution.length - 2)}000000000`);
            console.log(tempContributionHex)

            let tempReferralHex = await tempContract.AddressToRewardAmount(defaultAccount);
            let tempReferral = ethers.utils.formatEther(`${tempReferralHex}`);
            setReferralAmount(tempReferral);

            // let tempJoin = await tempContract.isAddressJoined(defaultAccount);
            // setIsJoined(tempJoin);

            let tempParent = await tempContract.fatherAddress(defaultAccount);
            if (tempParent === "0x0000000000000000000000000000000000000000")
                setParentAddress("0x...");
            if (tempParent !== "0x0000000000000000000000000000000000000000")
                setParentAddress(`${tempParent.slice(0, 4)}...${tempParent.slice(-4)}`);

            let tempClaimActive = await tempClaimContract.canClaim();
            setIsClaimActive(tempClaimActive);
            // let tempClaimActive = await tempContract.isClaimActive();
            // setIsClaimActive(tempClaimActive);

            // let tempIDOActive = await tempContract.isIDOActive();
            // setIsIDOActive(tempIDOActive);

            let tempIsClaimed = await tempClaimContract.canAddressClaim(defaultAccount);
            setIsClaimed(!tempIsClaimed);
        } catch {

        }
    }

    useEffect(() => {
        setLink(defaultAccount)
        if (defaultAccount !== null)
            updateEthers()
    }, [defaultAccount])

    const checkBalance = async () => {
        let tempBalanceHex = await usdtContract.balanceOf(defaultAccount);
        let tempBalance = ethers.utils.formatEther(`${tempBalanceHex}`, 'ether');
        return tempBalance;
    }

    const checkAllowance = async () => {
        let allowance = await usdtContract.allowance(defaultAccount, contractAddress);
        const allowanceAmount = ethers.utils.formatEther(`${allowance}`, 'ether');
        return allowanceAmount;
    }

    const checkAllowanceAgain = async (value) => {
        let result = await checkAllowance()

        if (result < value) {
            setIsLoading(true);
            setTimeout(async () => {
                await checkAllowanceAgain(value)
                return;
            }, 3000)
        }
        else
            handleContribute(value);
    }

    const makeApprove = async (value) => {
        if (defaultAccount === null) {
            if (language === "中") {
                swal("錯誤", "請先連接錢包", "error");
                return;
            }
            swal("Error", "Please Connect Your Wallet", "error");
            return;
        }
        if (!isIDOActive) {
            if (language === "中") {
                swal("錯誤", "IDO 未開放", "error");
                // swal("錯誤", "請檢查連線VPN 或 重新整理網頁", "error");
                return;
            }
            // swal("Error", "Please check your network connection or refresh the page", "error");
            swal("Error", "IDO is not active", "error");
            return;
        }

        let amount = 0;
        if (value === 0) amount = 50;
        if (value === 1) amount = 100;
        if (value === 2) amount = 200;

        if (isJoined) {
            if (language === "中") {
                swal("錯誤", "您已參加過IDO", "error");
                return;
            }
            swal("Error", "You have already joined before!!", "error");
            return;
        }

        let balance = await checkBalance();
        if (balance < amount || balance < amount || balance < amount) {
            if (language === "中") {
                swal("錯誤", "您沒有足夠的USDT", "error");
                return;
            }
            swal("Error", "You don't have enought USDT", "error");
            return;
        }


        let result = await checkAllowance()
        const approveAmount = ethers.utils.parseEther(`${amount}`);

        if (result >= amount) {
            handleContribute(amount)
        }
        else
            try {
                let result2 = await usdtContract.approve(contractAddress, approveAmount);
                if (result2)
                    checkAllowanceAgain(amount);
            } catch {
                if (language === "中") {
                    swal("錯誤", "授權USDT失敗", "error");
                    return;
                }
                swal("Error", "Failed to approve", "error");
                return;
            }
    }

    const handleContribute = async (value) => {
        setIsLoading(false);
        try {
            let etherAmount;
            etherAmount = ethers.utils.parseEther(`${value}`);

            let result = await contract.makeIDO(
                inviterAddress, etherAmount, { gasLimit: "300000" }
            );

            if (result) {
                setIsJoined(true);
                setContributionAmount(value);
                if (inviterAddress !== defaultAccount)
                    setParentAddress(`${inviterAddress.slice(0, 4)}...${inviterAddress.slice(-4)}`);
                else
                    setParentAddress(`${defaultInviter.slice(0, 4)}...${defaultInviter.slice(-4)}`);

                if (language === "中") {
                    if (value === 0)
                        swal("成功", "成功認購 50 USDT", "success");
                    if (value === 1)
                        swal("成功", "成功認購 100 USDT", "success");
                    if (value === 2)
                        swal("成功", "成功認購 200 USDT", "success");
                    return;
                }
                if (value === 0)
                    swal("Success", "Successfully Contribute With 50 USDT", "success");
                if (value === 1)
                    swal("Success", "Successfully Contribute With 100 USDT", "success");
                if (value === 2)
                    swal("Success", "Successfully Contribute With 200 USDT", "success");
            } else {
                if (language === "中") {
                    swal("錯誤", "認購失敗", "error");
                    return;
                }
                swal("Error", "Failed to Contribute", "error");
            }

        } catch (err) {

        }

    }

    const handleClaim = async () => {
        if (language === "中") {
            if (contributionAmount == 0) {
                swal("錯誤", "您並未進行任何認購", "error")
                return;
            }
            if (isClaimed) {
                swal("錯誤", "您已領取過，無法重複領取", "error");
                return;
            }
            if (!isClaimActive) {
                swal("錯誤", "現在還不能領幣，領幣時間請關注官方電報", "error")
                return;
            }
        }
        if (contributionAmount == 0) {
            swal("Error", "You haven't make any contribution yet", "error")
            return;
        }
        if (isClaimed) {
            swal("Error", "You have already claimed", "error");
            return;
        }
        if (!isClaimActive && defaultAccount !== "0x2678ecc61df4f476930069c801786efa5f1ca72f") {
            swal("Error", "Cannot Claim Right Now. The time able to claim will be informed in our official telegram.", "error")
            return
        }

        let result = await claimContract.claim()
        console.log(result)
    }

    const educationDetails = [
        {
            Quota: "50",
            title: language === "中" ? "小貓咪" : "Pussy",
            place: language === "中" ? "小貓咪" : "Little cats",
            // desc: "Lisque persius interesset his et, in quot quidam persequeris vim, ad mea essent possim iriure.",
        },
        {
            Quota: "100",
            title: language === "中" ? "貓咪" : "Cat",
            place: language === "中" ? "一般貓咪" : "Normal Cats",
            // desc: "Lisque persius interesset his et, in quot quidam persequeris vim, ad mea essent possim iriure.",
        },
        {
            Quota: "200",
            title: language === "中" ? "老闆貓咪" : "Boss Cat",
            place: language === "中" ? "貓咪之王" : "The King of Cats",
            // desc: "Lisque persius interesset his et, in quot quidam persequeris vim, ad mea essent possim iriure.",
        },
    ];

    return (
        <section
            id="resume"
            className={"section " + (darkTheme ? "bg-dark-1" : "")}
        >
            <div className={"container " + (classicHeader ? "" : "px-lg-5")}>
                {/* Heading */}
                <div className="position-relative d-flex text-center mb-5">
                    <h2
                        className={
                            "text-24  text-uppercase fw-600 w-100 mb-0 " +
                            (darkTheme ? "text-muted opacity-1" : "text-light opacity-4")
                        }
                    >
                        {language === "中" ? <>貢獻</> : <>Contribution</>}
                    </h2>
                    <p
                        className={
                            "text-9 text-dark fw-600 position-absolute w-100 align-self-center lh-base mb-0 " +
                            (darkTheme ? "text-white" : "text-dark")
                        }
                    >
                        {" "}
                        IDO
                        <span className="heading-separator-line border-bottom border-3 border-primary d-block mx-auto" />
                    </p>
                </div>
                {/* Heading end*/}
                <div className="row gx-5">
                    {/* My Education */}

                    <div onClick={() => setIsLoading(false)}>
                        {
                            isLoading &&
                            <Loading language={language} />
                        }
                    </div>

                    <div className="col-md-6">
                        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2
                                className={
                                    "text-6 fw-600 mb-4 " + (darkTheme ? "text-white" : "")
                                }
                            >
                                {language === "中" ? <>參與 IDO</> : <>Participate in IDO</>}
                                {/* {language === "中" ? <>如何參與 IDO</> : <>How to participate IDO</>} */}
                            </h2>
                            {/*
                                ===============================================
                                ===============================================

                                                Countdown Timer

                                ===============================================
                                ===============================================
                            */}

                            <h2
                                className={
                                    "text-6 fw-600 mb-4 " + (darkTheme ? "text-white" : "")
                                }
                            >IDO {language !== "中" ? 'has end' : '已結束'}</h2>

                            {/* <Countdown language={language} darkTheme={darkTheme} /> */}
                        </div>

                        <div
                            className={
                                "bg-white  rounded p-4 mb-4 " +
                                (darkTheme ? "bg-dark" : "bg-white border")
                            }
                            style={{ display: 'flex', flexDirection: 'column' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                {/* <img src={usdtImage} alt="usdtImage" style={{ width: "120px" }} /> */}
                                <p className="badge bg-primary text-2 fw-400">
                                    1. {language === "中" ? <>用 USDT 認購</> : <>Make Contribution with USDT</>}
                                </p><br />
                            </div>

                            <div style={{ display: "flex", flexDirection: "row", color: "white", flexWrap: "wrap" }}>
                                {educationDetails.length > 0 &&
                                    educationDetails.map((value, index) => (
                                        <div key={index} onClick={() => makeApprove(index)}>
                                            {/* <div key={index} onClick={() => handleContribute(index)}> */}
                                            <div style={{ flex: 1 }}>
                                                <div className="parallax"
                                                    style={{
                                                        width: "90px",
                                                        height: "90px",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        paddingLeft: "5px",
                                                        backgroundImage: 'url("images/outring.png")',
                                                        backgroundSize: "cover",
                                                        backgroundPosition: "center",
                                                        backgroundRepeat: "no-repeat",
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    {value.Quota}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>

                            <p className={darkTheme ? "text-primary" : "text-danger"}>
                                {language === "中" ? <>點擊上方按鈕參與</> : <>Click on the above button to join</>}
                                <br /><br />
                                <span style={{ color: 'white' }}>{language === "中" ? <> 當前邀請者 : </> : <>Current Inviter : </>}
                                    <span>
                                        {inviterAddress === defaultInviter
                                            ?
                                            <span>
                                                {
                                                    language === "中" ? " 無邀請者" : " No Inviter"
                                                }
                                            </span>
                                            :
                                            <span style={{ wordBreak: "break-word" }}>
                                                {inviterAddress}
                                            </span>
                                        }</span>
                                </span>
                            </p>

                        </div>

                        <div
                            className={
                                "bg-white  rounded p-4 mb-4 " +
                                (darkTheme ? "bg-dark" : "bg-white border")
                            }
                            style={{ display: 'flex', flexDirection: 'column' }}
                        >

                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                {/* <img src={usdtImage} alt="usdtImage" style={{ width: "120px" }} /> */}
                                <p className="badge bg-primary text-2 fw-400">
                                    2. {language === "中" ? <>邀請好友 獲得 USDT</> : <>Earn USDT with Invitation</>}
                                </p><br />
                            </div>
                            <p style={{ wordBreak: 'break-word', color: "white" }}>{
                                personalLink !== null ? personalLink :
                                    <>{
                                        language !== "中" ? "Please Connect Your Wallet" : "請連接錢包"
                                    }</>
                            }</p>
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {/* <a
                                    className="btn btn-primary rounded-pill"
                                    style={{ maxWidth: '120px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                                    onClick={copyLink}
                                >
                                    {language === "中" ? <>複製</> : <>Copy</>}
                                </a> */}

                                <CopyToClipboard
                                    text={personalLink}
                                    onCopy={copyLink}
                                >
                                    <button
                                        className="btn btn-primary rounded-pill"
                                        style={{ maxWidth: '120px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                                    >
                                        {language === "中" ? <>複製</> : <>Copy</>}
                                    </button>
                                </CopyToClipboard>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div>
                            <div>
                                <h2
                                    className={
                                        "text-6 fw-600 mb-4 " + (darkTheme ? "text-white" : "")
                                    }
                                >
                                    {language === "中" ? <>我的貢獻</> : <>My Contribution</>}
                                </h2>
                                <div
                                    className={
                                        "bg-white  rounded p-4 mb-4 " +
                                        (darkTheme ? "bg-dark" : "bg-white border")
                                    }
                                    style={{ display: 'flex', flexDirection: 'row' }}
                                >
                                    <div style={{ flex: '1' }}>
                                        <p className="badge bg-primary text-2 fw-400">
                                            {language === "中" ? <>認購額度</> : <>Contribution</>}
                                        </p>
                                        <h3 className={"text-5 " + (darkTheme ? "text-white" : "")}>
                                            {contributionAmount} Cat
                                        </h3>
                                        <p className={darkTheme ? "text-primary" : "text-danger"}>
                                            {language === "中" ? <>聰明的選擇</> : <>Smart Choice</>}
                                        </p>
                                    </div>
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <a
                                            className="btn btn-primary rounded-pill"
                                            style={{ maxWidth: '120px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                                            onClick={handleClaim}
                                        >
                                            {language === "中" ? <>提幣</> : <>Claim</>}
                                        </a>
                                    </div>
                                </div>

                                <div
                                    className={
                                        "bg-white  rounded p-4 mb-4 " +
                                        (darkTheme ? "bg-dark" : "bg-white border")
                                    }
                                    style={{ display: 'flex', flexDirection: 'column' }}
                                >
                                    <div style={{ flex: '1' }}>
                                        <p className="badge bg-primary text-2 fw-400">
                                            {language === "中" ? <>邀請獎勵</> : <>Invitation reward</>}
                                        </p>
                                        <h3 className={"text-5 " + (darkTheme ? "text-white" : "")}>
                                            {language === "中" ? <>業績 (自動到帳) </> : <>Income (auto)</>}：{referralAmount} USDT
                                        </h3>
                                        <p className={darkTheme ? "text-primary" : "text-danger"}>
                                            {language === "中" ? <>上級地址</> : <>Parent node</>}：
                                            {parentAddress === "0x..." ?
                                                <span>{language === "中" ? "沒有上級地址" : "No Parent Node"} </span> : parentAddress}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section >
    );
};

export default Resume;
