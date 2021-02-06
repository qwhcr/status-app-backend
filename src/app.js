const express = require('express');
const path = require('path')
const cors = require('cors');
const bodyParser = require('body-parser');
const HttpStatus = require('http-status-codes');
var app = express();
app.use(cors());
app.use(bodyParser.json());

// -------------------------- front-end serving  -------------------------------
app.use('/static', express.static(path.join(__dirname, 'static')));


// -------------------------- backend --------------------------------
const asyncDBWrapper = require('./async_db_wrapper')
const identityStore = require('./auth/identity_store')
const tokenHelper = require('./auth/token_helper')

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/static/html/index.html'));
});

app.post('/api/auth/signin', async (req, res) => {
  let id = req.body.id;
  let pwd = req.body.password;

  res.setHeader('Content-Type', 'application/json');

  let verificationResult;
  try {
    verificationResult = await identityStore.verify(id, pwd);
  } catch (e) {
    res.status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR);
    res.send(JSON.stringify({error: e}));
  }
  let responsePayload;
  if (verificationResult == true) {
    res.status(HttpStatus.StatusCodes.OK);
    responsePayload = {
      token: await tokenHelper.sign({id: id})
    };
  } else {
    res.status(HttpStatus.StatusCodes.UNAUTHORIZED);
    responsePayload = {
      token: null
    };
  }
  res.send(JSON.stringify(responsePayload));
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
});

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
});

app.get('/api/diag/ping', (req, res) => {
  res.send("pong");
});


app.listen(5000);

