const {v4: uuid} = require("uuid");
const asyncDBWrapper = require("./async_db_wrapper");
const fs = require("fs");
const identityStore = require("./auth/identity_store");

const populate = async () => {
  try {
    var db = await asyncDBWrapper.asyncGetDB()
  } catch (e) {
    console.log("error getting db" + e)
    throw Error(e)
  }

  try {
    await asyncDBWrapper.asyncDBRun(db,
      `
      CREATE TABLE IF NOT EXISTS identity_tbl
          (id TEXT, name TEXT, entity_type TEXT, pwd_hash TEXT)
      `
    )
  } catch (e) {
    console.log("error creating identity table", e)
    throw Error(e)
  }

  let testUser = {
    id: "demo@demo.com", name: "demo", entityType: "user",
    pwdPlainText: "demopwd"
  };
  try {
    await identityStore.storeNewIdentity(testUser)
  } catch (e) {
    console.log("error storing demo user");
    throw Error(e)
  }
  let testUser2 = {
    id: "demo2@demo.com", name: "demo2", entityType: "user",
    pwdPlainText: "demo2pwd"
  };
  try {
    await identityStore.storeNewIdentity(testUser2)
  } catch (e) {
    console.log("error storing second demo user");
    throw Error(e)
  }
  console.log("running user verification test:")
  try {
    if (await identityStore.verify("demo@demo.com", "demopwd")) {
      console.log("user verified");
    } else {
      console.log("user not verified");
    }
  } catch (e) {
    console.log("error verifying demo user");
    throw Error(e)
  }

  try {
    await asyncDBWrapper.asyncDBRun(db,
      `
      CREATE TABLE IF NOT EXISTS room_tbl
          (
            id TEXT,
            name TEXT,
            access_code_hash TEXT
          )
      `
    )
  } catch (e) {
    console.log("error creating room table", e)
    throw Error(e)
  }

  let roomID1 = "ed91a75f-68e0-4cc2-b453-1bb61571fc11";
  let roomTableData = [
    [roomID1, "demo room", ""]
  ];

  for (const v of roomTableData) {
    try {
      await asyncDBWrapper.asyncDBRun(db,
        `INSERT INTO room_tbl(
          id,
          name,
          access_code_hash
        ) VALUES(?, ?, ?)`, v)
    } catch (e) {
      console.log("error inserting record for room table:" + v)
    }
  }

  try {
    await asyncDBWrapper.asyncDBRun(db,
      `
      CREATE TABLE IF NOT EXISTS room_occupancy_tbl
          (
            user_id TEXT,
            room_id TEXT,
            user_nickname TEXT
          )
      `
    )
  } catch (e) {
    console.log("error creating room table", e)
    throw Error(e)
  }

  let roomOccupancyTableData = [
    ["demo@demo.com", roomID1, "demo"],
    ["demo2@demo.com", roomID1, "demo2"]
  ];

  for (const v of roomOccupancyTableData) {
    try {
      await asyncDBWrapper.asyncDBRun(db,
        `INSERT INTO room_occupancy_tbl(
          user_id,
          room_id,
          user_nickname
        ) VALUES(?, ?, ?)`, v)
    } catch (e) {
      console.log("error inserting record for room occupancy table:" + v)
    }
  }

  try {
    await asyncDBWrapper.asyncDBRun(db,
      `
      CREATE TABLE IF NOT EXISTS status_tbl
          (
            status_name TEXT,
            user_id TEXT,
            room_id TEXT,
            selected INTEGER,
            selected_at INTEGER
          )
      `
    )
  } catch (e) {
    console.log("error creating identity table", e)
    throw Error(e)
  }

  let statusTableData = [
    ["Sleeping", "demo@demo.com", roomID1, 0, 0],
    ["Studying", "demo@demo.com", roomID1, 1, Math.floor(Date.now() / 1000)],
    ["Studying", "demo2@demo.com", roomID1, 0, 0],
    ["Sleeping", "demo2@demo.com", roomID1, 1, Math.floor(Date.now() / 1000)]
  ];

  for (const v of statusTableData) {
    try {
      await asyncDBWrapper.asyncDBRun(db,
        `INSERT INTO status_tbl(
            status_name,
            user_id,
            room_id,
            selected,
            selected_at
          ) VALUES(?, ?, ?, ?, ?)`, v)
    } catch (e) {
      console.log("error inserting record for status table:" + v)
    }
  }

  db.close()
}

exports.populate = populate
fs.unlinkSync("./mydb.sqlite3")
populate()
