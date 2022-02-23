import type { SignedWalletAddress } from '../util/web3Util'

export enum AccountSource {
  WALLET = 'WALLET',
  EMAIL = 'EMAIL',
  GOOGLE = 'GOOGLE',
}

export type AccountRequest = {
  source: string
  signedWalletAddress: SignedWalletAddress | null
  email: string | null
  code: string | null
  googleIdToken: string | null
}

export type AccountResponse = {
  id?: string
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
