const asyncDBWrapper = require("./async_db_wrapper")
const fs = require("fs")
const identityStore = require("./auth/identity_store")

const populate = async () => {
  try {
    var db = await asyncDBWrapper.asyncGetDB()
  } catch (e) {
    console.log("error getting db" + e)
    throw Error(e)
  }

  try {
    await asyncDBWrapper.asyncDBRun(db,
      "CREATE TABLE IF NOT EXISTS main (name TEXT, status INTEGER)"
    )
  } catch (e) {
    console.log("error creating table", e)
    throw Error(e)
  }

  let dummyData = [["Vincent", 1], ["Will", 1]];

  for (const v of dummyData) {
    try {
      await asyncDBWrapper.asyncDBRun(db,
        "INSERT INTO main(name, status) VALUES(?, ?)", v)
    } catch (e) {
      console.log("error inserting record" + v)
    }

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

  db.close()
}

exports.populate = populate
fs.unlinkSync("./mydb.sqlite3")
populate()
