mongo   = require "mongodb"
express = require "express"

app     = express.createServer()
server  = new mongo.Server "127.0.0.1", 27017, {auto_reconnect: true}
db      = new mongo.Db "ars_api_development", server

send_image = (image_id, res, db) ->
  store = new mongo.GridStore db, image_id, "r"
  store.open (err, store) ->
    return res.send 404 if err
    store.read (err, data) ->
      return res.send 500 if err
      res.contentType store.contentType
      res.send new Buffer(data, "binary"), {"Content-Length": store.length}

app.get /^\/([0-9a-f]+)$/, (req, res) ->

  if db.state == "connected"
    send_image req.params[0], res, db
  else
    db.open (err, db) ->
      return res.send 500 if err
      send_image req.params[0], res, db

app.listen 3000
