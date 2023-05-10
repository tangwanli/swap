import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import nftABI from './ABI/nftABI.json'
import ErrorMessage from './ErrorMessage';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';

const nftMintAddress = "0x9c657E4A638df5E5e5d2b08cDCD7B3A2cE25052D";

const NFTMint = ({ defaultAccount }) => {
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [nftContract, setNFTContract] = useState(null);

    const [errorText, setErrorText] = useState(null);
    const [mintAmount, setMintAmount] = useState(1);
    const [maxMint, setMaxMint] = useState(10);

    const updateEthers = async () => {
        try {
            let tempProvider = new ethers.providers.Web3Provider(window.ethereum);
            setProvider(tempProvider);

            let tempSigner = tempProvider.getSigner();
            setSigner(tempSigner);

            let tempNFTContract = new ethers.Contract(nftMintAddress, nftABI, tempSigner)
            setNFTContract(tempNFTContract);

            let tempMaxMint = await tempNFTContract.maxMint()
            let normalNumber_maxMint = ethers.utils.formatUnits(`${tempMaxMint}`, "wei")
            setMaxMint(normalNumber_maxMint)
        } catch(err) {
            // console.log(err);
            // // alert(err)
            // setErrorText(err.toString())
        }
    }

    useEffect(() => {
        if (defaultAccount != null) {
            updateEthers()
            return;
        }
    }, [defaultAccount])

    const mint = async () => {
        if (defaultAccount == null) {
            setErrorText("Wallet Not Conneted")
            return;
        }
        try {
            const nftPrice = await nftContract.mintPrice();
            const pay = mintAmount * nftPrice;
            // console.log(pay)
            let result = await nftContract.mint(mintAmount, {
                value: pay
            })

            console.log(result)
        } catch (err) {
            setErrorText(err.toString())
            // setErrorText(err.reason)
        }
    }

    const setMintInput = (value) => {
        const mintValue = document.getElementById("mintAmount");
        mintValue.value = value;
    }


    return (
        <div className="content" style={{
            padding: '2vh 2vw',
        }}>
            {
                errorText !== null &&
                <ErrorMessage
                    errorMessage={errorText}
                    setErrorText={setErrorText}
                />
            }
            <div style={{
                display: 'flex', flexDirection: 'row',
                width: '90vw', maxWidth: '400px', justifyContent: 'space-between'
            }}>
                <button
                    className='btn btn-primary'
                    onClick={() => {
                        if (mintAmount >= maxMint) {
                            setMintAmount(1);
                            setMintInput(1)
                        }
                        else {
                            setMintAmount(prev => prev + 1)
                            setMintInput(mintAmount + 1)
                        }
                    }}>
                    +
                </button>
                <input
                    className='form-control'
                    id="mintAmount"
                    defaultValue={mintAmount}
                    onChange={(e)=>{
                        if (e.target.value > 10 || e.target.value <= 0) {
                            setErrorText(`
                            Invalid Mint Amount. 
                            The amount should be greater than or equal to 1
                            and less than or equal to ${maxMint}.`);
                            return;
                        }
                        else setMintAmount(e.target.value)
                    }}
                />
                <button
                    className='btn btn-primary'
                    onClick={() => {
                        if (mintAmount <= 1) {
                            setMintAmount(maxMint);
                            setMintInput(maxMint);
                        }
                        else {
                            setMintAmount(prev => prev - 1)
                            setMintInput(mintAmount - 1)
                        }
                    }}>
                    -
                </button>
            </div>

            <button onClick={mint}>
                Mint
            </button>

        </div>
    )
}

export default NFTMint
