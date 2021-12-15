import { validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

/**
 * Checks if request has any validation errors and if it does,
 * then replies with error response and list of errors
 */
export default function validateRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    // no validation errors found, continuing
    return next();
  }

  const extractedErrors: { [key: string]: any } = [];
  errors.array().map((err) => extractedErrors.push({ [err.param]: err.msg }));

  return res.status(400).json({ errors: extractedErrors });
}
