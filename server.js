const express = require("express");
const app = express();
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const db = require("./utils/db");
require("dotenv").config();

app.use(express());
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: "GET,POST,PATCH,DELETE,PUT",
    credentials: true,
  })
);

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: true,
      httpOnly: true,
      sameSite: "none",
      maxAge: 60 * 60 * 24 * 1000,
    },
  })
);

app.set("trust proxy", 1);

const productRouter = require("./routes/productRoute");
const reviewRouter = require("./routes/reviewRoute");

app.use("/product", productRouter);
app.use("/review", reviewRouter);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port:-`, PORT);
});
