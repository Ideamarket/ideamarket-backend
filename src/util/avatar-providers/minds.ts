/* eslint-disable import/no-default-export */
import got from 'got'

export default async function run(username: string) {
  const request = await got.get(
    `https://www.minds.com/api/v1/channel/${username}`
  )

  const result: any = JSON.parse(request.body)

  if (result && result.status === 'success' && result.channel) {
    const avatars = result.channel.avatar_url
    if (avatars) {
      const { body: imgBody } = await got(avatars.master, {
        responseType: 'buffer',
      })
      return imgBody
    }
  }

  return null
}
