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
      db.get(query, (err, row) => {
        if (err) {
          rj(err);
        }
        rs(row);
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

exports.asyncDBAll = async (db, query, data) => {
  if (data === null) {
    return new Promise((rs, rj) => {
      db.all(query, (err, rows) => {
        if (err) {
          rj(err);
        }
        rs(rows);
      });
    })
  } else {
    return new Promise((rs, rj) => {
      db.all(query, data, (err, rows) => {
        if (err) {
          rj(err);
        }
        rs(rows);
      });
    })
  }
}

exports.asyncTransaction = async (db, transactionFunc) => {
  return new Promise((rs, _) => {
    db.serialize(() => {
      transactionFunc(db);
      rs();
    });
  });
}
