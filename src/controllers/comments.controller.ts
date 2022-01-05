import { Request, Response } from "express";

import { handleSuccess, handlePagingSuccess, handleError } from '../lib/base'
import * as commentService from '../services/comments.service'

export async function fetchAllComments(req: Request, res: Response) {
  const listing = req.query.listing as string
  const market = req.query.market as string
  const page = Number.parseInt(req.query.page as string) || 0
  const count = Number.parseInt(req.query.count as string) || 50

  try {
    const filter: any = {}

    if (listing) {
      filter.listing = listing
    }
    if (market) {
      filter.market = market
    }

    const result = await commentService.fetchAllComments(filter, page, count)
    return handlePagingSuccess(res, result)
  } catch (error) {
    return handleError(res, error, 'Unable to handle fetching comments')
  }
}

export async function addComment(req: Request, res: Response) {
  console.log(req.body)
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
    const newComment = await commentService.addComment(comment);
    commentService.moderateById(newComment.id);

    return handleSuccess(res, newComment);
  } catch (error) {
    return handleError(res, error, `Unable to handle create comment`);
  }
}

export async function updateComment(req: Request, res: Response) {
  try {
    await commentService.updateCommentById(req.params.id, req.body.value, "TODO: userId");
    return handleSuccess(res, 'Comment has been updated');
  } catch (error) {
    return handleError(res, error, `Unable to handle create comment`);
  }
}

export async function deleteCommentById(
  req: Request,
  res: Response
) {
  console.log(req.params);
  try {
    if (!req.params.id) {
     return handleError(res, null, `Invalid or no comment identifier provided`);
    }
    await commentService.deleteById(req.params.id, "TODO: userId");
    return handleSuccess(res, 'Comment has been deleted successfully');
  } catch (error) {
    return handleError(res, error, 'Unable to handle create comment')
  }
}
