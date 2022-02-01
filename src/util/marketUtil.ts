import config from 'config'

export const validMarkets: string = config.get('markets.validMarketIds')

export const twitterMarketName: string = config.get(
  'markets.names.twitterMarketName'
)
export const substackMarketName: string = config.get(
  'markets.names.substackMarketName'
)
export const showtimeMarketName: string = config.get(
  'markets.names.showtimeMarketName'
)
export const wikipediaMarketName: string = config.get(
  'markets.names.wikipediaMarketName'
)
export const mindsMarketName: string = config.get(
  'markets.names.mindsMarketName'
)
export const urlMarketName: string = config.get('markets.names.urlMarketName')

export function getAllMarketIds() {
  return validMarkets.split(',').map((marketId) => Number.parseInt(marketId))
}

export function getAllMarkets(): Record<number, string> {
  const allMarkets: Record<number, string> = {}

  const allMarketIds = getAllMarketIds()
  for (const marketId of allMarketIds) {
    allMarkets[marketId] = config.get(`markets.market${marketId}`)
  }

  return allMarkets
}

export function isMarketIdValid(marketId: number | string) {
  const marketID = Number.parseInt(marketId as string)
  return getAllMarketIds().includes(marketID)
}

export function getTokenNameUrl({
  marketName,
  tokenName,
}: {
  marketName: string
  tokenName: string
}) {
  let tokenNameUrl = ''
  switch (marketName) {
    case twitterMarketName: {
      tokenNameUrl = `https://twitter.com/${tokenName.slice(1)}`
      break
    }
    case substackMarketName: {
      tokenNameUrl = `https://${tokenName}.substack.com/`
      break
    }
    case showtimeMarketName: {
      tokenNameUrl = `https://tryshowtime.com/${tokenName}`
      break
    }
    case wikipediaMarketName: {
      tokenNameUrl = `https://en.wikipedia.org/wiki/${getActualWikipediaTokenName(
        tokenName
      )}`
      break
    }
    case mindsMarketName: {
      tokenNameUrl = `https://minds.com/${tokenName.slice(1)}`
      break
    }
    default: {
      tokenNameUrl = tokenName
    }
  }

  return decodeURI(tokenNameUrl)
}

/**
 * On wikipedia launch, a few Wikipedia onchain tokens were created with broken names.
 * This function gets correct names for broken tokens.
 *
 * @param tokenName the token name from web3
 * @returns the actual wikipedia page title, matches Wikipedia URL
 */
function getActualWikipediaTokenName(tokenName: string) {
  switch (tokenName) {
    case 'Viktor_schauberger':
      return 'Viktor_Schauberger'
    case 'Ted_kaczynski':
      return 'Ted_Kaczynski'
    case 'Edward_leedskalnin':
      return 'Edward_Leedskalnin'
    case 'Robert_f._kennedy_jr.':
      return 'Robert_F._Kennedy_Jr.'
    case 'Rat_park':
      return 'Rat_Park'
    case 'Jordan_peterson':
      return 'Jordan_Peterson'
    case 'Miracle_of_the_sun':
      return 'Miracle_of_the_Sun'
    case 'Philadelphia_experiment':
      return 'Philadelphia_Experiment'
    default:
      return tokenName
  }
}
