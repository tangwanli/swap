import React, { Fragment, useState, useEffect } from "react";
//import Multistep from "react-multistep";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import { ethers } from 'ethers'

import ErrorMessage from './ErrorMessage'

import CreatePoolABI from './ABI/CreatePool.json'

const CreatePoolContract = "0xdFfbd6df5C039B27096e760fFD5B734dc33368F3"

const Pools = (props) => {

    const { defaultAccount
        // , isFiltered, setIsFiltered 
    } = props

    const explorerURL = "https://testnet.bscscan.com/address/";

    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [contract, setContract] = useState(null);

    const [poolData, setPoolData] = useState([]);
    const [runningPool, setRunningPool] = useState([]);
    const [endPool, setEndPool] = useState([])

    const [blockNumber, setBlockNumber] = useState(0);
    const [haveFiltered, setHaveFiltered] = useState(false);

    const updateEthers = async () => {
        try {
            let tempProvider = new ethers.providers.Web3Provider(window.ethereum);
            setProvider(tempProvider);

            let tempSigner = tempProvider.getSigner();
            setSigner(tempSigner);

            let tempContract = new ethers.Contract(CreatePoolContract, CreatePoolABI, tempSigner)
            setContract(tempContract);

            let poolsData = await tempContract.viewSmartChef()
            setPoolData(poolsData)
        } catch {

        }
    }

    useEffect(() => {
        updateEthers()
    }, [defaultAccount])


    useEffect(() => {
        if (poolData !== null) {
            filterData(poolData)
        }
    }, [poolData])

    const filterData = async (poolsData) => {
        if (haveFiltered) return;
        let block = await provider.getBlock("latest", false, true);
        console.log("Filtering")
        for (let i = 0; i < poolsData.length; i++) {
            //  結束區塊
            let i_endBlock = ethers.utils.formatUnits(poolsData[i][6], "0")

            //  結束區塊 < 現在區塊 => 已結束
            if (i_endBlock < block.number) {
                setEndPool([...endPool, poolsData[i]])
            }
            else {
                setRunningPool([...runningPool ,poolsData[i]])
            }
        }
        setHaveFiltered(prev => !prev)
        // setIsFiltered(true)
    }

    const [showList, setShowList] = useState(0);
    //  Error Text
    const [errorText, setErrorText] = useState(null);

    const style = (value) => {
        if (value == showList)
            return { color: 'red' }
    }
    return (
        <>
            <div className="row" style={{ marginTop: '5vh' }}>
                <div className="col-xl-12 col-xxl-12">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="card-title" style={{ textAlign: 'center', }}>Farm List</h4>
                        </div>
                        <div
                            style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', marginTop: '10px' }}
                        >
                            <span
                                onClick={() => setShowList(0)}
                                style={style(0)}
                            >All Pool</span>
                            <span
                                onClick={() => setShowList(1)}
                                style={style(1)}
                            >Running Pool</span>
                            <span
                                onClick={() => setShowList(2)}
                                style={style(2)}
                            >End Pool</span>
                        </div>
                        <hr />
                        <div className="card-body">
                            {
                                errorText !== null &&
                                <ErrorMessage
                                    errorMessage={errorText}
                                    setErrorText={setErrorText}
                                />
                            }
                        </div>
                        <div className="adminTable" style={{ color: 'black', overflowX: 'scroll', }}>
                            <table id="example" className="table display dataTable no-footer" style={{ color: 'black', width: '100vw', minWidth: '600px', }}>
                                <thead>
                                    <tr>
                                        <th>No.</th>
                                        <th>質押代幣</th>
                                        <th>獎勵代幣</th>
                                        <th>質押合約</th>
                                        <th>質押種類</th>
                                        <th>每秒獎勵</th>
                                        <th>結束區塊時間</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        showList == 0 && poolData !== [] &&
                                        poolData.map((item, index) => {
                                            return (
                                                <tr key={index}>
                                                    <td>{item[0].toNumber() + 1}</td>
                                                    <td>
                                                        <a href={`${explorerURL}${item[1]}`}>
                                                            {item[1].slice(0, 4)}...{item[1].slice(-4)}
                                                        </a>
                                                    </td>
                                                    <td>
                                                        <a href={`${explorerURL}${item[2]}`}>
                                                            {item[2].slice(0, 4)}...{item[2].slice(-4)}
                                                        </a>
                                                    </td>
                                                    <td>
                                                        <a href={`${explorerURL}${item[3]}`}>
                                                            {item[3].slice(0, 4)}...{item[3].slice(-4)}
                                                        </a>
                                                    </td>
                                                    <td>{item[4]}</td>
                                                    <td>{ethers.utils.formatUnits(item[5], "9")}</td>
                                                    <td>{ethers.utils.formatUnits(item[6], "0")}</td>
                                                </tr>
                                            )
                                        })
                                    }
                                    {
                                        showList == 1 && runningPool != [] &&
                                        runningPool.map((item, index) => {
                                            return (
                                                <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td>
                                                        <a href={`${explorerURL}${item[1]}`}>
                                                            {item[1].slice(0, 4)}...{item[1].slice(-4)}
                                                        </a>
                                                    </td>
                                                    <td>
                                                        <a href={`${explorerURL}${item[2]}`}>
                                                            {item[2].slice(0, 4)}...{item[2].slice(-4)}
                                                        </a>
                                                    </td>
                                                    <td>
                                                        <a href={`${explorerURL}${item[3]}`}>
                                                            {item[3].slice(0, 4)}...{item[3].slice(-4)}
                                                        </a>
                                                    </td>
                                                    <td>{item[4]}</td>
                                                    <td>{ethers.utils.formatUnits(item[5], "9")}</td>
                                                    <td>{ethers.utils.formatUnits(item[6], "0")}</td>
                                                </tr>
                                            )
                                        })
                                    }
                                    {
                                        showList == 2 && endPool != [] &&
                                        endPool.map((item, index) => {
                                            return (
                                                <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td>
                                                        <a href={`${explorerURL}${item[1]}`}>
                                                            {item[1].slice(0, 4)}...{item[1].slice(-4)}
                                                        </a>
                                                    </td>
                                                    <td>
                                                        <a href={`${explorerURL}${item[2]}`}>
                                                            {item[2].slice(0, 4)}...{item[2].slice(-4)}
                                                        </a>
                                                    </td>
                                                    <td>
                                                        <a href={`${explorerURL}${item[3]}`}>
                                                            {item[3].slice(0, 4)}...{item[3].slice(-4)}
                                                        </a>
                                                    </td>
                                                    <td>{item[4]}</td>
                                                    <td>{ethers.utils.formatUnits(item[5], "9")}</td>
                                                    <td>{ethers.utils.formatUnits(item[6], "0")}</td>
                                                </tr>
                                            )
                                        })
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Pools;