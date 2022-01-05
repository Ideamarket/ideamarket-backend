import { body, param } from "express-validator";

export const createCommentValidation = [
  body("userId").notEmpty().withMessage("UserId is required"),
  body("market").notEmpty().withMessage("Market field is required"),
  body("listing").notEmpty().withMessage("Listing field is required"),
  body("value").notEmpty().withMessage("Comment text is required"),
  body("price").isNumeric().optional(),
  body("holders").isNumeric().optional(),
  body("supply").isNumeric().optional(),
  body("deposits").isNumeric().optional(),
];

export const updateCommentValidation = [
  body("value").notEmpty().withMessage("Comment text is required"),
];
