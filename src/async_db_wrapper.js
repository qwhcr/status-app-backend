const sqlite3 = require("sqlite3")

exports.asyncGetDB = async () => {
  return new Promise((rs, rj) => {
    let db = new sqlite3.Database("./mydb.sqlite3", err => {
      if (err) {
        rj(err);
      }
    })
    rs(db);
  });
}

exports.asyncDBRun = async (db, query, data) => {
  return new Promise((rs, rj) => {
    if (data == null) {
      db.run(query, (err) => {
        if (err) {
          rj(err);
        }
        rs();
      });
    } else {
      db.run(query, data, (err) => {
        if (err) {
          rj(err);
        }
        rs();
      });
    }
  })
}

exports.asyncDBGet = async (db, query, data) => {
  return new Promise((rs, rj) => {
    if (data == null) {
      db.get(query, (err) => {
        if (err) {
          rj(err);
        }
        rs();
      });
    } else {
      db.get(query, data, (err, row) => {
        if (err) {
          rj(err);
        }
        rs(row);
      });
    }
  })
}

exports.asyncDBAll = async (db, query) => {
  return new Promise((rs, rj) => {
    db.all(query, (err, rows) => {
      if (err) {
        rj(err);
      }
      rs(rows);
    });
  })
}
