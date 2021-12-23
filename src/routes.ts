import { Express } from "express";
import validateRequest from "./middleware/validateRequest";

import {
  deleteCommentById,
  getAllComments,
  newComment,
  updateComment,
} from "./controllers/comments.controller";

import {
  createCommentValidation,
  updateCommentValidation,
} from "./validations/comments.validation";

export default function (app: Express) {
  // fetch comments by comments and listing
  app.get("/comments", getAllComments);
  app.post("/comments", createCommentValidation, validateRequest, newComment);
  app.put(
    "/comments/:id",
    updateCommentValidation,
    validateRequest,
    updateComment
  );
  app.delete("/comments/:id", deleteCommentById);
}
