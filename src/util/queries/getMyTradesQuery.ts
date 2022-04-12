import { gql } from 'graphql-request'

export function getMyTradesQuery({
  ownerAddress,
  first,
  skip,
}: {
  ownerAddress: string
  first: number
  skip: number
}) {
  const where = `{owner:"${ownerAddress.toLowerCase()}"}`

  return gql`
    {
      ideaTokenTrades(first: ${first}, skip: ${skip}, where:${where}) {
        id
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
        ideaTokenAmount
        owner
        isBuy
        timestamp
        ideaTokenAmount
        daiAmount
      }
    }
  `
}
