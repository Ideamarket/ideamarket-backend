import { gql } from 'graphql-request'

export function getLockedTokensQuery({
  ownerAddress,
  limit,
  skip,
}: {
  ownerAddress: string
  limit: number
  skip: number
}) {
  const where = `{owner:"${ownerAddress.toLowerCase()}"}`

  return gql`
    {
      lockedIdeaTokenAmounts(first: ${limit}, skip: ${skip}, where:${where}) {
        amount
        lockedUntil
        token {
          id
          name
          supply
          tokenOwner
          dayChange
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
    }
  `
}
