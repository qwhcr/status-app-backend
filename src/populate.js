const asyncDBWrapper = require("./async_db_wrapper")

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
  db.close()
}

exports.populate = populate
