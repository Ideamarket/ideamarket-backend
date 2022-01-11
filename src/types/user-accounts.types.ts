export type UserAccountResponse = {
  name?: string
  username?: string
  email?: string
  bio?: string
  profilePhoto?: string | null
  emailVerified?: boolean
  walletAddress?: string
  visibilityOptions?: VisibilityOptions
  role?: string
}

export type VisibilityOptions = {
  email: boolean
  bio: boolean
  ethAddress: boolean
}
