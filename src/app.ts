import express from "express";
import config from "config";
import mongdbConnect from "./db/mongodb";
import routes from "./routes";
import * as dotenv from "dotenv";
import cors from "cors";

const port = config.get("server.port") as number;

const app = express();

app.use(cors());

dotenv.config();

// initialize mongo db
mongdbConnect();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.listen(port, () => {
  console.log(`Server listing at port ${port}`);
  routes(app);
});
