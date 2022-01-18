import type { AccountDocument } from '../models/account.model'
import { AccountModel } from '../models/account.model'
import type { AccountResponse } from '../types/account.types'
import { sendMail } from './emailUtil'
import { getRandomString } from './randomUtil'

/* eslint-disable prefer-promise-reject-errors */
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
  accountDoc: AccountDocument | Partial<AccountDocument>
): AccountResponse {
  const account: AccountResponse = {}

  if (accountDoc.name) {
    account.name = accountDoc.name
  }

  if (accountDoc.username) {
    account.username = accountDoc.username
  }

  if (accountDoc.email) {
    account.email = accountDoc.email
  }

  account.emailVerified = accountDoc.emailVerified

  if (accountDoc.bio) {
    account.bio = accountDoc.bio
  }

  if (accountDoc.profilePhoto) {
    account.profilePhoto = accountDoc.profilePhoto
  }

  if (accountDoc.walletAddress) {
    account.walletAddress = accountDoc.walletAddress
  }

  account.role = accountDoc.role

  return account
}

export async function sendMailForEmailVerification({
  to,
  code,
}: {
  to: string
  code: string
}) {
  return sendMail({
    to,
    subject: 'Ideamarket - Email Verification',
    text: `Your verification code is ${code}`,
    html: emailVerificationHtmlContent(code),
  })
}

function emailVerificationHtmlContent(code: string) {
  return `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
            <div style="margin:50px auto;width:70%;padding:20px 0">
              <div style="border-bottom:1px solid #eee">
                <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Ideamarket</a>
              </div>
              <p>Please use below verification code to verify your email address.</p>
              <h2 style="background: #00466a;margin: 0 10;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${code}</h2>
              <p style="font-size:0.9em;"><br />Regards,<br />Ideamarket</p>
              <hr style="border:none;border-top:1px solid #eee" />
              <p style="font-size:0.9em;">Disclaimer: If you have not requested for this, then please ignore or let us know.</p>
            </div>
          </div>`
}
