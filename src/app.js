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
const statusStore = require('./status/status_store')
const occupancyStore = require('./occupancy/occupancy_store')
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
      token: await tokenHelper.signAuthToken(id)
    };
  } else {
    res.status(HttpStatus.StatusCodes.UNAUTHORIZED);
    responsePayload = {
      token: null
    };
  }
  res.send(JSON.stringify(responsePayload));
});

app.get('/api/status', async function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  let roomID = req.query.roomid;
  let userID = req.query.userid;
  let currentUserStatus;
  try {
    currentUserStatus =
      await statusStore.getAllStatusesByUserIDAndRoomID(userID, roomID);
  } catch (e) {
    console.log("cannot get status data" + e);
    res.status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR);
    res.send(JSON.stringify({"error": e}));
    return
  }

  let occupantStatuses;
  try {
    occupantStatuses =
      await statusStore.getOccupantsStatusByRoom(roomID);
  } catch (e) {
    console.log("cannot get occupants status data" + e);
    res.status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR);
    res.send(JSON.stringify({"error": e}));
    return
  }

  let occupantNicknames;
  try {
    occupantNicknames =
      await occupancyStore.getOccupantNicknamesByRoom(roomID);
  } catch (e) {
    console.log("cannot get nickname data" + e);
    res.status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR);
    res.send(JSON.stringify({"error": e}));
    return
  }

  let nicknameMap = new Map();
  occupantNicknames.forEach((v) => {
    nicknameMap[v.user_id] = v.user_nickname
  });

  let otherOccupantsNicknameWithStatus = [];
  occupantStatuses.forEach((v) => {
    if (v.user_id != userID) {
      otherOccupantsNicknameWithStatus.push({
        nickname: nicknameMap[v.user_id],
        status: {
          status_name: v.status_name,
          selected_at: v.selected_at
        }
      })
    }
  });

  currentUserStatus.map((v) => {
    if (v.selected != 1) {
      delete v.selected_at
    }
  })

  responsePayload = {
    current_user: {
      nickname: nicknameMap[userID],
      statuses: currentUserStatus
    },
    other_occupants: otherOccupantsNicknameWithStatus
  };
  res.status(HttpStatus.StatusCodes.OK)
  res.send(JSON.stringify(responsePayload));
});

app.get('/api/update', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  userID = req.query.userid;
  statusName = req.query.statusname;
  roomID = req.query.roomid;
  try {
    await statusStore.setNewStatusByUserAndRoom(userID, roomID, statusName);
  } catch (e) {
    console.log("failed to update:" + e)
    res.status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
    res.send(JSON.stringify({"error": e}))
    return;
  }
  res.status(HttpStatus.StatusCodes.OK)
  res.send(JSON.stringify({"result": "OK"}));
});

app.get('/api/diag/ping', (req, res) => {
  res.send("pong");
});


app.listen(5000);

