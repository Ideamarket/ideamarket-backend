/* eslint-disable prefer-promise-reject-errors */
import config from 'config'

import type { AccountDocument } from '../models/account.model'
import { AccountModel } from '../models/account.model'
import type { AccountResponse } from '../types/account.types'
import { AccountSource } from '../types/account.types'
import { sendMailWithDynamicTemplate } from './emailUtil'
import { getRandomString } from './randomUtil'

const templateId: string = config.get('sendgrid.emailVerificationTemplateId')
const cloudFrontDomain: string = config.get('account.cloudFrontDomain')

export function isValidAccountSource(source: string) {
  return Object.keys(AccountSource).includes(source)
}

export function isValidUsername(username: string) {
  const pattern = '^[a-z0-9_]{3,15}$'
  const usernameRegex = new RegExp(pattern, 'u')
  return usernameRegex.test(username)
}

export async function isUsernameExists(username: string) {
  const account = await AccountModel.findOne({ username })
  return !!account
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

export function mapAccount(
  accountDoc: AccountDocument | Partial<AccountDocument> | null
): AccountResponse | null {
  if (!accountDoc) {
    return null
  }

  const account: AccountResponse = {}

  account.id = accountDoc.id

  if (accountDoc.name) {
    account.name = accountDoc.name
  }

  if (accountDoc.username) {
    account.username = accountDoc.username
  }

  if (accountDoc.email) {
    account.email = accountDoc.email
  }

  if (accountDoc.bio) {
    account.bio = accountDoc.bio
  }

  if (accountDoc.profilePhoto) {
    account.profilePhoto = accountDoc.profilePhoto
      ? `${cloudFrontDomain}/${accountDoc.profilePhoto}`
      : null
  }

  if (accountDoc.walletAddress) {
    account.walletAddress = accountDoc.walletAddress
  }

  account.role = accountDoc.role

  account.verified = accountDoc.verified ?? false

  return account
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
