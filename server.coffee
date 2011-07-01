bson    = require "bson"
mongo   = require "mongodb"
express = require "express"

app     = express.createServer()
server  = new mongo.Server "127.0.0.1", 27017, {auto_reconnect: true}
db      = new mongo.Db "ars_api_development", server

with_db = (cb) ->
  if db.state == "connected" then cb(null, db) else db.open(cb)

app.get /^\/([0-9a-f]+)$/, (req, res) ->
  object_id = new bson.ObjectID(req.params[0])
  with_db (err, db) ->
    return res.send 500 if err
    store = new mongo.GridStore db, object_id, "r"
    store.open (err, store) ->
      return res.send 404 if err or !store.length
      store.readBuffer store.length, (err, buf) ->
        res.send buf, {
          "Content-Type": store.contentType,
          "Content-Length": store.length,
        }, 200

app.listen 3000
