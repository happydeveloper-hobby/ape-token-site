"use strict";

const axios = require("axios");
const fetch = require("node-fetch");
const NodeCache = require( "node-cache" );

const TokenInfo = require( "../../util/tokenInfo");
const CMC = require( "../../util/cmc");


class ApeController {
  constructor()
  {
    this.cache = new NodeCache({ stdTTL: 5, checkperiod: 6 });
    this.TokenInfo = new TokenInfo();
    this.CMC = new CMC();
  }
  
  async testReq(req, res) {
    var totalSupply = await this.TokenInfo.getTotalSupply(req.params.tokenAddress);
    console.log("node server log:", totalSupply);
    res.json({ message: "Requested successfully", totalSupply : totalSupply });
    // Task.find({}, function(err, task) {
    //   if (err)
    //     res.send(err);
    //   res.json(task);
    // });
  };

  async getCryptoCurrencyInfoFromCMC(req, res)
  {
    const symbol_or_address = req.query.symbol_or_address;
    var result = await this.CMC.getCryptoCurrencyInfo(symbol_or_address);
    // res.header("Access-Control-Allow-Origin", "*");
    // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.json({ status: 200, message: "Requested successfully", data : result });
  }



  // exports.create_a_task = function(req, res) {
  //   var new_task = new Task(req.body);
  //   new_task.save(function(err, task) {
  //     if (err)
  //       res.send(err);
  //     res.json(task);
  //   });
  // };

  // exports.read_a_task = function(req, res) {
  //   Task.findById(req.params.taskId, function(err, task) {
  //     if (err)
  //       res.send(err);
  //     res.json(task);
  //   });
  // };

  // exports.update_a_task = function(req, res) {
  //   Task.findOneAndUpdate({_id: req.params.taskId}, req.body, {new: true}, function(err, task) {
  //     if (err)
  //       res.send(err);
  //     res.json(task);
  //   });
  // };

  // exports.delete_a_task = function(req, res) {

  //   Task.remove({
  //     _id: req.params.taskId
  //   }, function(err, task) {
  //     if (err)
  //       res.send(err);
  //     res.json({ message: 'Task successfully deleted' });
  //   });
  // };
}

module.exports = ApeController;
