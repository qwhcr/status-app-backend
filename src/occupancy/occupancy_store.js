const asyncDBWrapper = require("../async_db_wrapper")

exports.getOccupantNicknamesByRoom = async (roomID) => {
  let db = await asyncDBWrapper.asyncGetDB();
  let occupantNicknames = await asyncDBWrapper.asyncDBAll(db,
    `
    SELECT user_id, user_nickname FROM room_occupancy_tbl WHERE room_id = ?
    `, roomID)
  db.close()
  return occupantNicknames;
}

