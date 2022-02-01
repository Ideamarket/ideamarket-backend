import axios from 'axios'
import cheerio from 'cheerio'

/**
 * Checks if url is valid.
 * - If so, it returns the canonical url (if present), else returns original url
 * - If not, return null
 *
 * @param url
 */
export async function checkAndReturnValidUrl(url: string) {
  let res: any = null
  try {
    res = await axios.get(encodeURI(url))
  } catch (error: any) {
    console.error(
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      `Error occurred with status code - ${error.response?.status} while fetching url`
    )
    return null
  }

  try {
    const html = cheerio.load(res.data)
    const canonicalUrl = html('link[rel="canonical"]').attr('href')

    return canonicalUrl ?? url
  } catch (error) {
    console.error('Error occurred while fetching canonical url', error)
    return url
  }
}
