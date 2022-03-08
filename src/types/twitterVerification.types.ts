export type TwitterProfile = {
  id: string
  name: string
  username: string
  bio: string
  profileImageUrl: string
}

export type TwitterAuthorization = {
  alreadyVerified?: boolean
  authorizationUrl?: string
}

export type TwitterVerificationInitiation = {
  verificationInitiated: boolean
  redirectUrl: string
  requestToken: string
  twitterUserId: string | null
  twitterUsername: string | null
}

export type TwitterVerificationCompletion = {
  verificationCompleted: boolean
  tweet?: Tweet | null
  tokenNameMismatch?: boolean
  walletMismatch?: boolean
  usernameMismatch?: boolean
  mismatchData?:
    | TokenNameMismatchData
    | WalletMismatchData
    | UsernameMismatchData
}

export type Tweet = {
  id: string | null
  text: string | null
}

export type TokenNameMismatchData = {
  tokenName: string
  twitterUsername: string
}

export type WalletMismatchData = {
  tokenOwner: string
  walletAddress: string
}

export type UsernameMismatchData = {
  tokenName: string
  username: string
}
