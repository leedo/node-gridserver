(function() {
  var app, db, express, mongo, send_image, server;
  mongo = require("mongodb");
  express = require("express");
  app = express.createServer();
  server = new mongo.Server("127.0.0.1", 27017, {
    auto_reconnect: true
  });
  db = new mongo.Db("ars_api_development", server);
  send_image = function(req, res, db) {
    var image_id, store;
    image_id = req.params[0];
    store = new mongo.GridStore(db, image_id, "r");
    return store.open(function(err, store) {
      if (err) {
        return res.send(404);
      }
      return store.read(function(err, data) {
        if (err) {
          return res.send(500);
        }
        res.contentType(store.contentType);
        return res.send(new Buffer(data, "binary"), {
          "Content-Length": store.length
        });
      });
    });
  };
  app.get(/^\/([0-9a-f]+)$/, function(req, res) {
    if (db.state === "connected") {
      return send_image(req, res, db);
    } else {
      return db.open(function(err, db) {
        if (err) {
          return res.send(500);
        }
        return send_image(req, res, db);
      });
    }
  });
  app.listen(3000);
}).call(this);
