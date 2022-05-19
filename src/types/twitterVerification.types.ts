export type TwitterProfile = {
  id: string
  name: string
  username: string
  bio: string
  profileImageUrl: string
}

export type TwitterVerificationInitiation = {
  authorizationUrl?: string
}

export type TwitterVerificationCompletion = {
  verificationCompleted: boolean
}
