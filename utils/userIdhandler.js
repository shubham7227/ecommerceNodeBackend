const fs = require("fs");
const path = require("path");
const fileName = path.join(__dirname, "..", "uploads", "userIds.json");

const getNewuserId = () => {
  const data = JSON.parse(fs.readFileSync(fileName));
  const removedEntry = data.shift();
  //   const removedEntry = data.splice(index, 1)[0];
  fs.writeFileSync(fileName, JSON.stringify(data));
  return removedEntry;
};

module.exports = { getNewuserId };
