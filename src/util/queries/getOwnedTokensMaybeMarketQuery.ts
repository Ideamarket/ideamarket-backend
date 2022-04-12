import { gql } from 'graphql-request'

export function getOwnedTokensMaybeMarketQuery({
  owner,
  limit,
  skip,
}: {
  owner: string
  limit: number
  skip: number
}): string {
  const where = `{holder:"${owner.toLowerCase()}", amount_gt:0}`

  return gql`
    {
      ideaTokenBalances(first: ${limit}, skip: ${skip}, where:${where}) {
        amount
        token {
          id
          tokenID
          name
          supply
          holders
          marketCap
          tokenOwner
          daiInToken
          invested
          listedAt
          dayChange
        }
        market {
          marketID
          name
          baseCost
          priceRise
          hatchTokens
          tradingFeeRate
          platformFeeRate
          platformOwner
          platformFeeInvested
          nameVerifier
        }
      }
    }
  `
}
