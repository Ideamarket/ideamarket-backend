/* eslint-disable import/no-default-export */
import { load } from 'cheerio'
import got from 'got'

export default async function run(username: string): Promise<any> {
  const { body } = await got(`https://tryshowtime.com/${username}`)
  const $ = load(body)
  const res = JSON.parse($('script[id="__NEXT_DATA__"]').html() as string)
  if (
    !res ||
    !res.props ||
    !res.props.pageProps ||
    !res.props.pageProps.profile ||
    !res.props.pageProps.profile.img_url
  ) {
    throw new Error('not found')
  }

  const imageURL = res.props.pageProps.profile.img_url
  const { body: imgBody } = await got(
    imageURL as string,
    {
      responseType: 'buffer',
    } as any
  )
  return imgBody
}
