import { Express } from "express";
import validateRequest from "./middleware/validateRequest";

import { getAllComments, newComment } from "./controllers/comments.controller";

import { createCommentValidation } from "./validations/comments.validation";

export default function (app: Express) {
  // fetch comments by comments and listing
  app.get("/comments", getAllComments);
  app.post("/comments", createCommentValidation, validateRequest, newComment);
}
