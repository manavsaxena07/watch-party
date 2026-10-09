const { v4: uuidv4 } = require("uuid");

function generateRoomCode() {
  return uuidv4()
    .replace(/-/g, "")
    .substring(0, 6)
    .toUpperCase();
}

module.exports = generateRoomCode;