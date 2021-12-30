import { CommentModel } from '../models/comment.model'

export async function fetchAllCommentsService(
  filter: any,
  page: number,
  count: number
) {
  return CommentModel.paginate(filter, {
    limit: count,
    offset: page * count,
    sort: { createdAt: -1 },
  })
}

export async function addCommentService(comment: any) {
  return CommentModel.create(comment)
}
