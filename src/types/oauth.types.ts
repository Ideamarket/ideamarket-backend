export type TwitterAccessTokenResponse = {
  requestToken: string
  twitterUserId: string | null
  twitterUsername: string | null
}

export type TwitterProfile = {
  id: string
  name: string
  username: string
  bio: string
  profileImageUrl: string
}

export type Tweet = {
  id: string
  text: string
}
