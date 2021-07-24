var Web3         = require( "web3");
var axios        = require ("axios");
var fetch       = require ("node-fetch");
var jsdom        = require ("jsdom");
var NodeCache    = require("node-cache");
var { CMC_header } = require( "../constants/constant.js");
const { json } = require("express");



class CMC
{
    constructor()
    {
        this.cache = new NodeCache({stdTTL:60});
    }

    axiosGetOperation = function (link, header = CMC_header) {
        return new Promise(function (resolve, reject) {
            axios.get(link, {headers: header}).then(res => {
                resolve(res);
                // console.log("axiosGetOperation done: ", res);
            }).catch(err => {
                reject(err);
                console.log("axiosGetOperation err: ", err);
            });
        });
    }

    async #getCMCId(symbol_or_address){
        let cmcids = this.cache.get("cmcids");
        let data;
        if( cmcids == undefined )
        {
            cmcids = await this.axiosGetOperation("https://pro-api.coinmarketcap.com/v1/cryptocurrency/map");
            this.cache.set("cmcids", cmcids.data.data);
            data = cmcids.data.data
        }
        else{
            data = cmcids;
        }
        let id = 0;
        for(let item of data){
            if(item.symbol == symbol_or_address.toUpperCase())
            {
                id = item.id;
                break;
            }
            if(item.platform == undefined) continue;
            if(item.platform.token_address == symbol_or_address) 
            {
                id = item.id;
                break;
            }
        };
        console.log(symbol_or_address.toUpperCase());
        console.log(id);
        return id;
    }

    async getCryptoCurrencyInfo(symbol_or_address)
    {
        let cmcid = await this.#getCMCId(symbol_or_address);
        if(cmcid == 0) return 0;
        let data = await this.axiosGetOperation("https://pro-api.coinmarketcap.com/v1/cryptocurrency/info?id=" + cmcid);
        let info = data.data.data[cmcid];
        return info;
    }
}

module.exports = CMC;
