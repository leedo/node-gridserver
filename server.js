(function() {
  var app, db, express, mongo, send_image, server;
  mongo = require("mongodb");
  express = require("express");
  app = express.createServer();
  server = new mongo.Server("127.0.0.1", 27017, {
    auto_reconnect: true
  });
  db = new mongo.Db("ars_api_development", server);
  send_image = function(image_id, res, db) {
    var store;
    store = new mongo.GridStore(db, image_id, "r");
    return store.open(function(err, store) {
      if (err) {
        return res.send(404);
      }
      res.contentType(store.contentType);
      res.header("Content-Length", store.length);
      return store.readBuffer(store.length, function(err, buf) {
        if (buf) {
          res.write(buf);
        }
        return res.end();
      });
    });
  };
  app.get(/^\/([0-9a-f]+)$/, function(req, res) {
    if (db.state === "connected") {
      return send_image(req.params[0], res, db);
    } else {
      return db.open(function(err, db) {
        if (err) {
          return res.send(500);
        }
        return send_image(req.params[0], res, db);
      });
    }
  });
  app.listen(3000);
}).call(this);
