const express = require('express');
const path = require('path')
const cors = require('cors');

var app = express();
app.use(cors());


// -------------------------- front-end serving  -------------------------------
app.use('/static', express.static(path.join(__dirname, 'static')));


// -------------------------- backend --------------------------------
const asyncDBWrapper = require('./async_db_wrapper')

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/static/html/index.html'));
});

app.get('/api/status', async function (_, res) {
  res.setHeader('Content-Type', 'application/json');
  let db;
  try {
    db = await asyncDBWrapper.asyncGetDB()
  } catch (e) {
    console.log("cannot get DB" + e)
    res.send(JSON.stringify({"error": e}))
    return
  }
  let statusData;
  try {
    statusData = await asyncDBWrapper.asyncDBAll(db, "SELECT * FROM main")
  } catch (e) {
    console.log("cannot get status data" + e)
    res.send(JSON.stringify({"error": e}))
    return
  }

  db.close()
  res.send(JSON.stringify(statusData));
})

app.get('/api/update', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  queryName = req.query.name;
  queryStatus = req.query.status;
  try {
    db = await asyncDBWrapper.asyncGetDB()
  } catch (e) {
    console.log("cannot get DB" + e)
    res.send(JSON.stringify({"error": e}))
    return
  }
  try {
    await asyncDBWrapper.asyncDBRun(db,
      "UPDATE main SET status = $status WHERE name = $name",
      {
        $name: queryName,
        $status: queryStatus
      })
  } catch (e) {
    console.log("failed to update:" + e)
    res.send(JSON.stringify({"error": e}))
  }
  db.close()
  res.send(JSON.stringify({"result": "OK"}));
})

app.get('/api/diag/ping', (req, res) => {
  res.send("pong");
})


app.listen(5000);

