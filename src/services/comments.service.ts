/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-negated-condition */
/* eslint-disable promise/prefer-await-to-callbacks */
/* eslint-disable promise/prefer-await-to-then */
/* eslint-disable unicorn/no-unsafe-regex */
/* eslint-disable unicorn/better-regex */
/* eslint-disable require-unicode-regexp */
/* eslint-disable prefer-regex-literals */
import axios from 'axios'

import { CommentModel } from '../models/comment.model'
import { PermissionAccessViolationError } from './errors'

export function getAllComments(filter: any, page: number, count: number) {
  filter.isDeleted = false // retrieve all non-deleted records

  return CommentModel.paginate(filter, {
    limit: count,
    offset: page * count,
    sort: { createdAt: -1 },
    populate: 'account',
  })
}

export function addNewComment(comment: any) {
  return CommentModel.create(comment)
}

export function updateCommentById(
  commentId: string,
  value: string,
  userId: string
) {
  return validateOwnership(commentId, userId).then((comment) => {
    return CommentModel.findByIdAndUpdate(commentId, { value })
  })
}

export function deleteById(commentId: string, userId: string) {
  return validateOwnership(commentId, userId).then((comment) => {
    return CommentModel.findByIdAndUpdate(commentId, { isDeleted: true })
  })
}

const containsFinancial = (value: string) => {
  const words = value.split(' ')

  const amex = new RegExp('^3[47][0-9]{13}$')
  const visa = new RegExp('^4[0-9]{12}(?:[0-9]{3})?$')
  const cup1 = new RegExp('^62[0-9]{14}[0-9]*$')
  const cup2 = new RegExp('^81[0-9]{14}[0-9]*$')

  const mastercard = new RegExp('^5[1-5][0-9]{14}$')
  const mastercard2 = new RegExp('^2[2-7][0-9]{14}$')

  const disco1 = new RegExp('^6011[0-9]{12}[0-9]*$')
  const disco2 = new RegExp('^62[24568][0-9]{13}[0-9]*$')
  const disco3 = new RegExp('^6[45][0-9]{14}[0-9]*$')

  const diners = new RegExp('^3[0689][0-9]{12}[0-9]*$')
  const jcb = new RegExp('^35[0-9]{14}[0-9]*$')

  return words.some(
    (value) =>
      amex.test(value) ||
      visa.test(value) ||
      cup1.test(value) ||
      cup2.test(value) ||
      mastercard.test(value) ||
      mastercard2.test(value) ||
      disco1.test(value) ||
      disco2.test(value) ||
      disco3.test(value) ||
      diners.test(value) ||
      jcb.test(value)
  )
}

export async function moderateById(commentId: string) {
  const comment = await CommentModel.findById(commentId)
  console.log(`Comment found by id ${commentId}`)
  if (!comment) {
    return
  }

  try {
    const defaultLanguage = 'eng'
    const baseUrl = process.env.AZURE_MODERATION_ENDPOINT as string
    const azureModeraionKey = process.env.AZURE_MODERATION_KEY as string
    const detectTextLanguageModerationUrl = `${baseUrl}/contentmoderator/moderate/v1.0/ProcessText/DetectLanguage`

    const detectLanguageResult = await axios.post(
      detectTextLanguageModerationUrl,
      comment.value,
      {
        headers: {
          'Ocp-Apim-Subscription-Key': azureModeraionKey,
          'Content-Type': 'text/plain',
        },
      }
    )

    // set default language to 'eng' if unable to detect
    const language: string =
      detectLanguageResult.data?.DetectedLanguage || defaultLanguage

    // screen text now
    const screenTextModerationUrl = `${baseUrl}/contentmoderator/moderate/v1.0/ProcessText/Screen/?language=${language}&classify=true&PII=true`

    const screenResponse = await axios.post(
      screenTextModerationUrl,
      comment.value,
      {
        headers: {
          'Ocp-Apim-Subscription-Key': azureModeraionKey,
          'Content-Type': 'text/plain',
        },
      }
    )

    if (screenResponse.status === 200) {
      const screenResult = screenResponse.data
      if (language === defaultLanguage) {
        const textContainsFinancials = containsFinancial(comment.value)
        // const response = {
        //   explicit: screenResult.Classification.Category1.Score,
        //   mature: screenResult.Classification.Category2.Score,
        //   offensive: screenResult.Classification.Category3.Score,
        //   isSafe: !(
        //     screenResult.Classification?.ReviewRecommended ||
        //     textContainsFinancials
        //   ),
        //   address: screenResult.PII?.Address.length > 0,
        //   email: screenResult.PII?.Email.length > 0,
        //   network: screenResult.PII?.IPA.length > 0,
        //   phone: screenResult.PII?.Phone.length > 0,
        //   ssn: screenResult.PII?.SSN.length > 0,
        //   financial: textContainsFinancials,
        // };

        await CommentModel.findByIdAndUpdate(commentId, {
          moderatedAt: new Date(),
          isModerated: true,
        })
        console.log('updated')
        return true
      }
      // TODO: handle non english response
      return false
    }

    return false
  } catch (error) {
    console.log(error)
  }
  return false
}

const validateOwnership = (commentId: string, userId: string) => {
  return new Promise((resolve, reject) => {
    CommentModel.findById(commentId)
      .populate('account')
      .then((comment) => {
        if (comment.account.id !== userId) {
          reject(new PermissionAccessViolationError())
        } else {
          resolve(comment)
        }
      })
      .catch((error) => {
        reject(error)
      })
  })
}
