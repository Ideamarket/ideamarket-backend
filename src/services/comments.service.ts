import CommentModel from "../models/comment.model";

export async function getComments(filter: any, page: number, count: number) {
  const results = await CommentModel.paginate(filter, {
    limit: count,
    offset: page * count,
    sort: { createdAt: -1 },
  });

  return results;
}

export async function createComment(comment: any) {
  return await CommentModel.create(comment);
}
