import { Response } from "express";
import logger from "../lib/logger";

export const handleError = (error: any, message: string, next: any) => {
  let cause = findCause(error);

  if (cause.custom) {
    logger.error(`${message}. Error: ${cause.message}. Stack: ${cause.stack}`);
  } else {
    logger.error(`${message}. Cause: ${error.message}`);
  }

  next(cause);
};

export const handleSuccess = (res: Response, data: object | string) => {
  return res.status(200).send({
    success: true,
    data: data,
  });
};

export const handlePagingSuccess = (res: Response, data: any) => {
  return res.status(200).send({
    success: true,
    data: data.docs,
    total: data.total,
  });
};

const findCause = (sourceError: any) => {
  let error = sourceError;
  while (error.parent && error.custom) {
    error = error.parent;
  }

  return error;
};
