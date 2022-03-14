/* eslint-disable require-unicode-regexp */
/* eslint-disable promise/no-return-wrap */
/* eslint-disable import/no-default-export */
import got from 'got'

const TWITTER_BEARER_TOKEN =
  'Bearer AAAAAAAAAAAAAAAAAAAAAFfPKAEAAAAA7%2BEunk2HwatStdPh7fQa9yLDPmQ%3DNnFF2hPVWVr6K21djaMBwx6HjsvJ5aJLd3PE68e5W1fwHczMUd'

export default async function run(username: string) {
  const res = await got(
    `https://api.twitter.com/2/users/by/username/${username}?user.fields=profile_image_url`,
    {
      headers: {
        authorization: TWITTER_BEARER_TOKEN,
      },
    }
  ).then((response) => {
    return Promise.resolve(response.body)
  })

  const rawImageURL = JSON.parse(res).data.profile_image_url
  const imageURL = rawImageURL.replace(/_(?:bigger|mini|normal)\./, `_400x400.`)
  const { body: imgBody } = await got(imageURL, {
    responseType: 'buffer',
  } as any)

  return imgBody
}
