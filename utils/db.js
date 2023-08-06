const mongoose = require("mongoose");
require("dotenv").config();

mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "MainDB",
  })
  .catch((err) => {
    console.log(err.messge);
  });
const db = mongoose.connection;

db.on("error", (error) => console.error(error));
db.on("open", () => console.log("Database Connected on MongoDB"));
