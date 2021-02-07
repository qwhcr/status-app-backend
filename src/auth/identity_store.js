const asyncDBWrapper = require("../async_db_wrapper")
const bcrypt = require("bcrypt")

exports.verify = async (id, pwdPlainText) => {
  let identity = await getIdentity(id);
  if (!identity || !identity.pwd_hash) {
    return false;
  }
  return await bcrypt.compare(pwdPlainText, identity.pwd_hash)
}

exports.storeNewIdentity = async (identity) => {
  // check identity integrity
  if (!(identity.id && identity.name && identity.entityType
    && identity.pwdPlainText)) {
    throw Error("cannot store incomplete identity")
  }
  let passwordHash = await bcrypt.hash(identity.pwdPlainText, 5);
  let flattenedIdentity = [];
  flattenedIdentity.push(identity.id);
  flattenedIdentity.push(identity.name);
  flattenedIdentity.push(identity.entityType);
  flattenedIdentity.push(passwordHash);

  let db = await asyncDBWrapper.asyncGetDB();
  try {
    await asyncDBWrapper.asyncDBRun(db,
      `INSERT INTO identity_tbl(id, name, entity_type, pwd_hash)
      VALUES(?, ?, ?, ?)`,
      flattenedIdentity);
  } catch (e) {
    console.log("error storing identity:", identity);
    throw Error(e);
  } finally {
    db.close();
  }
}

exports.checkIDExists = async (id) => {
  if (await getIdentity(id)) {
    return true;
  }
  return false;
}

var getIdentity = async (id) => {
  let db = await asyncDBWrapper.asyncGetDB();
  let identity = await asyncDBWrapper.asyncDBGet(
    db,
    "SELECT * FROM identity_tbl WHERE id = ?",
    id
  );
  db.close();
  return identity;

}

