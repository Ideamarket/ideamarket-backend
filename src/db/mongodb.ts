import mongoose from "mongoose";
import config from "config";
import logger from "../lib/logger";

import "../models/comment.model";

function connect() {
  const dbUri = config.get("mongodb.uri") as string;

  return mongoose
    .connect(dbUri)
    .then(() => {
      logger.info(`Database connected # ${dbUri}`);
      console.log(`Database connected # ${dbUri}`);
    })
    .catch((error) => {
      logger.error("db error", error);
      console.log(error);
      process.exit(1);
    });
}

export default connect;
