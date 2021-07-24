var Web3         = require( "web3");
var axios        = require ("axios");
var fetch       = require ("node-fetch");
var jsdom        = require ("jsdom");
var NodeCache    = require("node-cache");
var {
        ISATokenAddress, 
        BNBTokenAddress, 
        BUSDTokenAddress, 
        USDTTokenAddress, 
        LPAddressV1, 
        LPAddressV2, 
        PancakeFactoryV1, 
        PancakeFactoryV2, 
        BSCscanApikey, 
        ISAAbi, 
        ERC20Abi, 
        PancakeFactoryAbi, 
        BNBPriceURL,
        axios_link,
        axios_bitquery_header,    
    } = require( "../constants/constant.js");

class TokenInfo
{
    constructor()
    {
        console.log("hello ISA");
        this.cache = new NodeCache({ stdTTL: 5, checkperiod: 6 });
        this.web3 = new Web3('https://bsc-dataseed1.binance.org:443');
        this.decimals = 10 ** 8;
        this.ISAcontract = new this.web3.eth.Contract(ISAAbi, ISATokenAddress);
        this.BNBContract = new this.web3.eth.Contract(ERC20Abi, BNBTokenAddress);
        this.BUSDContract = new this.web3.eth.Contract(ERC20Abi, BUSDTokenAddress);
        this.USDTContract = new this.web3.eth.Contract(ERC20Abi, USDTTokenAddress);
        this.PFV1 = new this.web3.eth.Contract(PancakeFactoryAbi, PancakeFactoryV1);
        this.PFV2 = new this.web3.eth.Contract(PancakeFactoryAbi, PancakeFactoryV2);
    }

    axiosGetOperation = function (link, query, header) {
        return new Promise(function (resolve, reject) {
            axios.get(link).then(res => {
                resolve(res)
                // console.log("done: ", res);
            }).catch(err => {
                reject(err)
                console.log("err: ", err);
            })
        });
    }

    axiosPostOperation = function (link, query, header) {
        return new Promise(function (resolve, reject) {
            axios.post(link, JSON.stringify({ query }), header).then(res => {
                resolve(res)
                // console.log("done: ", res);
            }).catch(err => {
                reject(err)
                console.log("err: ", err);
            })
        });
    }

    async getCurrentPrice() {
        if (this.cache.get('price')) {
            return this.cache.get('price').price;
        }
        let total = await this.ISAcontract.methods.totalSupply().call();
        let isaBalance = await this.ISAcontract.methods.balanceOf(LPAddressV2).call();
        let bnbBalance = await this.BNBContract.methods.balanceOf(LPAddressV2).call();
        let response = await fetch(BNBPriceURL).then((response) => { return response.json() });
        // let price = bnbBalance / isaBalance * (response.result.ethusd * 0.996016) / 10000000000;
        let price = bnbBalance / isaBalance * (response.result.ethusd * 0.996016) / 10000000000;

        let obj = { price: price };
        this.cache.set('price', obj, 5);

        return total;
    }

    async getTotalSupply(tokenAddress)
    {
        try{
            this.getBurntLPNum(tokenAddress);
            // this.getLPtokenInfo(tokenAddress, BNBTokenAddress,  this.PFV2, this.BNBContract, true);
            // this.getLPtokenInfo(tokenAddress, BNBTokenAddress,  this.PFV1, this.BNBContract, false);
            // this.getLPtokenInfo(tokenAddress, BUSDTokenAddress, this.PFV2, this.BUSDContract, true);
            // this.getLPtokenInfo(tokenAddress, BUSDTokenAddress, this.PFV1, this.BUSDContract, false);
            // this.getLPtokenInfo(tokenAddress, USDTTokenAddress, this.PFV2, this.USDTContract, true);
            // this.getLPtokenInfo(tokenAddress, USDTTokenAddress, this.PFV1, this.USDTContract, false);

            var contract = new this.web3.eth.Contract(ERC20Abi, tokenAddress); 
            let total = await contract.methods.totalSupply().call();
            let decimal = await contract.methods.decimals().call();
            let totalSupply =( total / 10 ** decimal);
            let TokenPrice = await fetch("https://api.pancakeswap.info/api/v2/tokens/" + tokenAddress).then((response) => { return response.json() });
            let marketCap = Math.trunc(TokenPrice.data.price * (totalSupply -  await this.getBurntLPNum(tokenAddress))).toLocaleString();
            totalSupply = Math.trunc(totalSupply).toLocaleString();
            return {totalSupply:totalSupply, marketCap: marketCap};
        }catch(e)
        {
            console.log("node server error", e);
        }
    }


    /**
     * fromTokenAddress: Base Token Address
     * toTokenAddress: Quote Token Address
     * PFV: Pancake Factory V1/V2
     * 
     */
    async getLPtokenInfo(fromTokenAddress, toTokenAddress, PFV, pairContract, isV2)
    {
        try{

            let pairTokenAddress = await PFV.methods.getPair(fromTokenAddress, toTokenAddress).call();
            var contract = new this.web3.eth.Contract(ERC20Abi, fromTokenAddress);
            let fromSymbol = await contract.methods.symbol().call();
            let lp_balance = await contract.methods.balanceOf(pairTokenAddress).call();
            let decimal1 = await contract.methods.decimals().call();
            lp_balance = Math.round( lp_balance / 10 ** decimal1);
            
            let pairBalance = await pairContract.methods.balanceOf(pairTokenAddress).call();
            let toSymbol = await pairContract.methods.symbol().call();
            let pairTokenPrice = await fetch("https://api.pancakeswap.info/api/v2/tokens/" + toTokenAddress).then((response) => { return response.json() });
            // let bnbPrice = await fetch(BNBPriceURL).then((response) => { return response.json() });
            let decimal2 = await pairContract.methods.decimals().call();
            pairBalance = ( pairBalance / 10 ** decimal2 );
            let lp_price = "$" + Math.trunc(pairBalance * pairTokenPrice.data.price).toLocaleString();
            pairBalance = (pairBalance.toFixed(2) * 1).toLocaleString();
            
            console.log("test LP token info: \n", {pairName:fromSymbol+"/"+toSymbol, pv2: isV2, tokenBalance: lp_balance, pairBalance: pairBalance, price: lp_price});
            return  {pairName:fromSymbol+"/"+toSymbol, pv2: isV2, tokenBalance: lp_balance, pairBalance: pairBalance, price: lp_price};
        }catch(e)
        {
            return {status: "failed"};
        }finally{
            return {status: "failed"};
        }

    }

    async getBurntLPNum(tokenAddress)
    {
        let axios_query =   `{
                                ethereum(network: bsc) {
                                    address(address: {is: "0x000000000000000000000000000000000000dead"}) {
                                        balances(currency: {is: "${tokenAddress}"}) {
                                            currency {
                                            address
                                            symbol
                                            tokenType
                                            }
                                            value
                                        }
                                    }
                                }
                            }`;
        
        return await this.axiosPostOperation(axios_link, axios_query, axios_bitquery_header).then(axios_res => {
            // console.log("burnt num:", axios_res.data.data.ethereum.address[0].balances[0].value);
            return axios_res.data.data.ethereum.address[0].balances[0].value;
        }).catch(axios_res_err => {
            console.error(axios_res_err);
            return 0;
        });
    }
    
    async checkAddress(tokenAddress) {
        return Web3.utils.isAddress(tokenAddress);
    }
}

module.exports = TokenInfo;
