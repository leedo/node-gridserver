(function() {
  var app, db, express, mongo, server, with_db;
  mongo = require("mongodb");
  express = require("express");
  app = express.createServer();
  server = new mongo.Server("127.0.0.1", 27017, {
    auto_reconnect: true
  });
  db = new mongo.Db("ars_api_development", server);
  with_db = function(cb) {
    if (db.state === "connected") {
      return cb(null, db);
    } else {
      return db.open(cb);
    }
  };
  app.get(/^\/([0-9a-f]+)$/, function(req, res) {
    return with_db(function(err, db) {
      var store;
      if (err) {
        return res.send(500);
      }
      store = new mongo.GridStore(db, req.params[0], "r");
      return store.open(function(err, store) {
        if (err || !store.length) {
          return res.send(404);
        }
        return store.readBuffer(store.length, function(err, buf) {
          return res.send(buf, {
            "Content-Type": store.contentType,
            "Content-Length": store.length
          }, 200);
        });
      });
    });
  });
  app.listen(3000);
}).call(this);
