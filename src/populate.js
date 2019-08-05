const sqlite3 = require('sqlite3');

const populate = async () => {
    let db = new sqlite3.Database("./mydb.sqlite3", (err) => {
        if (err) {
            console.log('Error when connnecting to the database', err)
        } else {
            console.log('Database connected!')
        }
    })
    db.serialize(() => {
        db.run("CREATE TABLE IF NOT EXISTS main (name TEXT, status INTEGER)");
        var dummyData = [["Vincent", 1], ["Will", 1]];
        dummyData.forEach((data) => {
            db.run("INSERT INTO main(name, status) VALUES(?, ?)", data, (err) => {
                if (err) {
                    console.log(err);
                };
            });
        });
    })
    db.close
}

populate();