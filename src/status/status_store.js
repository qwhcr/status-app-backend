const asyncDBWrapper = require("../async_db_wrapper")

exports.createNewStatusByUserAndRoom = async (userID, statusName, roomID) => {
  let db = await asyncDBWrapper.asyncGetDB();
  await asyncDBWrapper.asyncDBRun(db,
    `INSERT INTO status_tbl(
        status_name, user_id, room_id, selected, selected_at
      ) VALUES(?, ?, ?, ?, ?)`, [statusName, userID, roomID, 0, 0])
  db.close()
}

exports.deleteStatusByUserAndRoom = async (userID, statusName, roomID) => {
  let db = await asyncDBWrapper.asyncGetDB();
  await asyncDBWrapper.asyncDBRun(
    db,
    `
    DELETE FROM status_tbl WHERE status_name = ? AND user_id = ? AND room_id = ?
    `,
    [statusName, userID, roomID]);
  db.close();
}

exports.getOccupantsStatusByRoom = async (roomID) => {
  let db = await asyncDBWrapper.asyncGetDB();
  let occupantStatus = await asyncDBWrapper.asyncDBAll(
    db,
    `
    SELECT user_id, status_name, selected_at FROM status_tbl
      WHERE room_id = ? AND selected = 1 AND user_id
        IN (SELECT user_id FROM room_occupancy_tbl WHERE room_id = ?)
    `,
    [roomID, roomID]);
  db.close();
  return occupantStatus;
}

exports.getAllStatusesByUserIDAndRoomID = async (userID, roomID) => {
  let db = await asyncDBWrapper.asyncGetDB();
  let userStatuses = await asyncDBWrapper.asyncDBAll(
    db,
    `
    SELECT status_name, selected, selected_at FROM status_tbl
      WHERE user_id = ? AND room_id = ?
    `,
    [userID, roomID]);
  db.close();
  return userStatuses;
}

exports.setNewStatusByUserAndRoom = async (userID, roomID, statusName) => {
  let db = await asyncDBWrapper.asyncGetDB();
  let transactionFunc = (db) => {
    db.run("BEGIN TRANSACTION");
    db.run(
      `UPDATE status_tbl SET selected = 0, selected_at = 0
      WHERE selected = 1 AND user_id = $userID AND room_id = $roomID`,
      {
        $userID: userID,
        $roomID: roomID,
      });
    db.run(
      `UPDATE status_tbl SET selected = 1, selected_at = $ts
      WHERE status_name = $statusName AND user_id = $userID AND room_id = $roomID
      `,
      {
        $userID: userID,
        $roomID: roomID,
        $ts: Math.floor(Date.now() / 1000),
        $statusName: statusName
      });
    db.run("COMMIT");
  };
  await asyncDBWrapper.asyncTransaction(db, transactionFunc);
  db.close();
}
