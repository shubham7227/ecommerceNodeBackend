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

const addressRouter = require("./routes/addressRoute");
const authRouter = require("./routes/authRoute");
const brandRouter = require("./routes/brandRoute");
const categoryRouter = require("./routes/categoryRoute");
const orderRouter = require("./routes/orderRoute");
const productRouter = require("./routes/productRoute");
const reviewRouter = require("./routes/reviewRoute");
const wishlistRouter = require("./routes/wishlistRoute");

app.use("/address", addressRouter);
app.use("/auth", authRouter);
app.use("/brand", brandRouter);
app.use("/category", categoryRouter);
app.use("/order", orderRouter);
app.use("/product", productRouter);
app.use("/review", reviewRouter);
app.use("/wishlist", wishlistRouter);

app.get("/", (req, res) => {
  res.send("GROWCOMERS - Backend is running!!!");
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port:-`, PORT);
});
