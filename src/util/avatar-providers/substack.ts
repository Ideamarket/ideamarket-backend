/* eslint-disable import/no-default-export */
import { load } from 'cheerio'
import got from 'got'

export default async function run(username: string): Promise<any> {
  const { body } = await got(`https://${username}.substack.com`)
  const $ = load(body)
  const imageURL = $('link[rel=apple-touch-icon][sizes=120x120]').attr('href')
  const { body: imgBody } = await got(
    imageURL as string,
    {
      responseType: 'buffer',
    } as any
  )
  return imgBody
}
