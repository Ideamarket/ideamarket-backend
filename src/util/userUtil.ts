import { UserAccountModel } from '../models/user-accounts.model'
import { getRandomString } from '../util/randomUtil'

/* eslint-disable prefer-promise-reject-errors */
export function isValidUsername(username: string) {
  const pattern = '^[a-z0-9_]{3,15}$'
  const usernameRegex = new RegExp(pattern, 'u')
  return usernameRegex.test(username)
}

export async function isUsernameExists(username: string) {
  const userAccount = await UserAccountModel.findOne({ username })
  return !!userAccount
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
