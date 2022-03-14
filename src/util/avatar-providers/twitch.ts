/* eslint-disable import/no-default-export */
import { load } from 'cheerio'
import got from 'got'

export default async function run(username: string): Promise<any> {
  const { body } = await got(`https://twitch.tv/${username}`)
  const $ = load(body)
  const imageURL = $('meta[property="og:image"]').attr('content')
  const { body: imgBody } = await got(
    imageURL as string,
    {
      responseType: 'buffer',
    } as any
  )
  return imgBody
}
