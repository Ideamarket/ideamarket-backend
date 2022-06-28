/* eslint-disable prefer-promise-reject-errors */
import config from 'config'

import type { UserTokenDocument } from '../models/user-token.model'
import { UserTokenModel } from '../models/user-token.model'
import { fetchTwitterUsernameByUserId } from '../services/twitterVerification.service'
import type {
  UserTokenResponse,
  UserTokenResponseWithHoldingAmount,
} from '../types/user-token.types'
import { sendMailWithDynamicTemplate } from './emailUtil'
import { getRandomString } from './randomUtil'

const templateId: string = config.get('sendgrid.emailVerificationTemplateId')
const cloudFrontDomain: string = config.get('userToken.cloudFrontDomain')

export function isValidUsername(username: string) {
  const pattern = '^[a-z0-9_]{3,15}$'
  const usernameRegex = new RegExp(pattern, 'u')
  return usernameRegex.test(username)
}

export async function isUsernameExists(username: string) {
  const userToken = await UserTokenModel.findOne({ username })
  return !!userToken
}

export async function isUsernameAvailable(username: string) {
  const usernameExists = await isUsernameExists(username)
  return usernameExists ? Promise.reject() : Promise.resolve()
}

export async function generateRandomUsername() {
  let randomUsername = ''
  do {
    randomUsername = getRandomString()
    // eslint-disable-next-line no-await-in-loop
  } while (await isUsernameExists(randomUsername))

  return randomUsername
}

export async function checkUsernameCanBeUpdatedOrNot({
  currentUsername,
  usernameToBeChecked,
}: {
  currentUsername: string | undefined
  usernameToBeChecked: string | undefined
}) {
  if (!usernameToBeChecked) {
    return false
  }

  if (currentUsername === usernameToBeChecked) {
    return false
  }

  if (await isUsernameExists(usernameToBeChecked)) {
    return false
  }

  return true
}

export function mapUserTokenResponse(
  userTokenDoc: UserTokenDocument | null
): UserTokenResponse | null {
  if (!userTokenDoc) {
    return null
  }

  return {
    id: userTokenDoc._id.toString(),
    walletAddress: userTokenDoc.walletAddress,
    name: userTokenDoc.name,
    username: (userTokenDoc.username as any) ?? null,
    twitterUsername: userTokenDoc.twitterUsername,
    email: userTokenDoc.email,
    bio: userTokenDoc.bio,
    profilePhoto: userTokenDoc.profilePhoto
      ? `${cloudFrontDomain}/${userTokenDoc.profilePhoto}`
      : null,
    role: userTokenDoc.role,
    tokenAddress: userTokenDoc.tokenAddress,
    marketId: userTokenDoc.marketId,
    marketName: userTokenDoc.marketName,
    tokenOwner: userTokenDoc.tokenOwner,
    price: userTokenDoc.price || 0,
    dayChange: userTokenDoc.dayChange || 0,
    weekChange: userTokenDoc.weekChange || 0,
    deposits: userTokenDoc.deposits || 0,
    holders: userTokenDoc.holders || 0,
    yearIncome: userTokenDoc.yearIncome || 0,
    claimableIncome: userTokenDoc.claimableIncome || 0,
    totalRatingsCount: userTokenDoc.totalRatingsCount || 0,
    latestRatingsCount: userTokenDoc.latestRatingsCount || 0,
  }
}

export function mapUserTokenResponseWithHoldingAmount({
  userToken,
  holdingAmount,
}: {
  userToken: UserTokenDocument
  holdingAmount: number
}): UserTokenResponseWithHoldingAmount {
  return {
    id: userToken._id.toString(),
    walletAddress: userToken.walletAddress,
    name: userToken.name,
    username: (userToken.username as any) ?? null,
    twitterUsername: userToken.twitterUsername,
    email: userToken.email,
    bio: userToken.bio,
    profilePhoto: userToken.profilePhoto
      ? `${cloudFrontDomain}/${userToken.profilePhoto}`
      : null,
    role: userToken.role,
    tokenAddress: userToken.tokenAddress,
    marketId: userToken.marketId,
    marketName: userToken.marketName,
    tokenOwner: userToken.tokenOwner,
    price: userToken.price || 0,
    dayChange: userToken.dayChange || 0,
    weekChange: userToken.weekChange || 0,
    deposits: userToken.deposits || 0,
    holders: userToken.holders || 0,
    yearIncome: userToken.yearIncome || 0,
    claimableIncome: userToken.claimableIncome || 0,
    totalRatingsCount: userToken.totalRatingsCount || 0,
    latestRatingsCount: userToken.latestRatingsCount || 0,
    holdingAmount,
  }
}

export async function mapUserTokenResponseWithLatestTwitterUsername(
  userTokenDoc: UserTokenDocument | null
): Promise<UserTokenResponse | null> {
  if (!userTokenDoc) {
    return null
  }

  const twitterUsername = await fetchTwitterUsernameByUserId(
    userTokenDoc.twitterUserId
  )

  if (twitterUsername && twitterUsername !== userTokenDoc.twitterUsername) {
    await UserTokenModel.findByIdAndUpdate(userTokenDoc.id, {
      $set: { twitterUsername },
    })
  }

  return {
    id: userTokenDoc._id.toString(),
    walletAddress: userTokenDoc.walletAddress,
    name: userTokenDoc.name,
    username: (userTokenDoc.username as any) ?? null,
    twitterUsername: twitterUsername ?? userTokenDoc.twitterUsername,
    email: userTokenDoc.email,
    bio: userTokenDoc.bio,
    profilePhoto: userTokenDoc.profilePhoto
      ? `${cloudFrontDomain}/${userTokenDoc.profilePhoto}`
      : null,
    role: userTokenDoc.role,
    tokenAddress: userTokenDoc.tokenAddress,
    marketId: userTokenDoc.marketId,
    marketName: userTokenDoc.marketName,
    tokenOwner: userTokenDoc.tokenOwner,
    price: userTokenDoc.price || 0,
    dayChange: userTokenDoc.dayChange || 0,
    weekChange: userTokenDoc.weekChange || 0,
    deposits: userTokenDoc.deposits || 0,
    holders: userTokenDoc.holders || 0,
    yearIncome: userTokenDoc.yearIncome || 0,
    claimableIncome: userTokenDoc.claimableIncome || 0,
    totalRatingsCount: userTokenDoc.totalRatingsCount || 0,
    latestRatingsCount: userTokenDoc.latestRatingsCount || 0,
  }
}

export async function sendMailForEmailVerification({
  to,
  code,
}: {
  to: string
  code: string
}) {
  return sendMailWithDynamicTemplate({
    to,
    templateId,
    dynamicTemplateData: { code },
  })
}
