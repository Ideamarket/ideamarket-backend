import minds from './minds'
import showtime from './showtime'
import substack from './substack'
import twitch from './twitch'
import twitter from './twitter'
import wikipedia from './wikipedia'

export const providers = new Set([
  'twitter',
  'substack',
  'showtime',
  'twitch',
  'wikipedia',
  'minds',
])

export function getProvider(providerName: string) {
  switch (providerName) {
    case 'twitter': {
      return twitter
    }
    case 'substack': {
      return substack
    }
    case 'showtime': {
      return showtime
    }
    case 'twitch': {
      return twitch
    }
    case 'wikipedia': {
      return wikipedia
    }
    case 'minds': {
      return minds
    }
    default: {
      return null
    }
  }
}

export const isValidProvider = (providerName: string) =>
  providers.has(providerName)
