const sqlite3 = require('sqlite3')

let db = new sqlite3.Database("./mydb.sqlite3", (err) => { 
    if (err) { 
        console.log('Error when connnecting to the database', err) 
    } else { 
        console.log('Database connected!') 
    } 
})


db.run("CREATE TABLE main (name, status) VALUES()")