"use strict";

module.exports = function (app) {
  var apeController = require("../controllers/apeController");
  var ape = new apeController();

  app.get('/hello', function(req, res){
    res.send("Hello World!");
 });

  // ape Routes
  app.get("/getTotalSupply/:tokenAddress", function (req, res) {
    ape.testReq(req, res);
  });

  app.get("/getCryptoCurrencyInfo", (req, res) => {
    ape.getCryptoCurrencyInfoFromCMC(req, res);
  });
  // .get(ape.testReq);
  // .post(ape.create_a_task);

  // app.route('/tasks/:taskId')
  //   .get(ape.read_a_task)
  //   .put(ape.update_a_task)
  //   .delete(ape.delete_a_task);
};
