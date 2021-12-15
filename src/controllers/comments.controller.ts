import { Request, Response } from "express";
import { handleError, handleSuccess, handlePagingSuccess } from "../lib/base";
import { getComments, createComment } from "../services/comments.service";

// Get comments by filter or latest
export async function getAllComments(req: Request, res: Response, next: any) {
  const listing = req.query.listing as string;
  const market = req.query.market as string;
  const page = parseInt(req.query.page as string) || 0;
  const count = parseInt(req.query.count as string) || 50;

  try {
    let filter: any = {};

    if (listing) filter["listing"] = listing;
    if (market) filter["market"] = market;

    const result = await getComments(filter, page, count);
    return handlePagingSuccess(res, result);
  } catch (error) {
    handleError(error, `Unable to handle fetching comments`, next);
  }
}

export async function newComment(req: Request, res: Response, next: any) {
  console.log(req.body);
  try {
    const comment = {
      listing: req.body.listing,
      market: req.body.market,
      value: req.body.value,
      userId: req.body.userId,
      price: req.body.price,
      deposits: req.body.deposits,
      holders: req.body.holders,
      supply: req.body.supply,
    };

    const newComment = await createComment(comment);
    return handleSuccess(res, newComment);
  } catch (error) {
    handleError(error, `Unable to handle create comment`, next);
  }
}
