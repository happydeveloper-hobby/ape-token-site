import { useState, useCallback } from 'react';
import axios from "axios";
import Web3 from 'web3';
import { BSCscanApikey, } from "../constants/constant.js";

const web3 = new Web3(new Web3.providers.HttpProvider('https://bsc-dataseed1.defibit.io'));

const useGetContract = () => {
    const [contract, setContract] = useState();
    const [error, setError] = useState();

    const getContract = useCallback(async(token) => {
        if(token) {
            try {
                const {data} = await axios.get(`https://api.bscscan.com/api?module=contract&action=getabi&address=${token}&apikey=${BSCscanApikey}`);
                
                const abi = JSON.parse(data.result);
                const temp = new web3.eth.Contract(abi, token);
                console.log("temp",temp);
                setContract(temp);
                setError(null);
            } catch (err) {
                setContract(null);
                setError(err);
                console.log('contract: ', err);
            }
        }
    }, []);

    return {
        contract,
        error,
        getContract
    }
};

export default useGetContract;