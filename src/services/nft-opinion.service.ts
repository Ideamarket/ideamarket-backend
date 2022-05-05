import { NFTOpinionModel } from '../models/nft-opinion.model'
import { PostModel } from '../models/post.model'
import type { Web3NFTOpinionData } from '../types/nft-opinion.types'
import { web3 } from '../web3/contract'
import {
  getAllNFTsOpinionsOfAddress,
  getOpinionsSummaryOfNFT,
} from '../web3/opinions/nft-opinions'
import { InternalServerError } from './errors'
import {
  calculateCompositeRatingAndMarketInterest,
  getIdeamarketPostsContractAddress,
} from './post.service'

export async function syncOpinionsOfAllNFTsInWeb2() {
  try {
    const contractAddress = getIdeamarketPostsContractAddress()
    if (!contractAddress) {
      console.error('Deployed address is missing for ideamarket posts')
      throw new InternalServerError(
        'Contract address is missing for ideamamrket posts '
      )
    }

    const allOpinions = await getAllNFTsOpinionsOfAddress(contractAddress)
    for await (const opinion of allOpinions) {
      const block = await web3.eth.getBlock(opinion.blockHeight)
      await updateNFTOpinionInWeb2({
        contractAddress: (opinion.contractAddress as string).toLowerCase(),
        tokenID: opinion.tokenID,
        author: (opinion.author as string).toLowerCase(),
        timestamp: block.timestamp.toString(),
        rating: opinion.rating,
        comment: opinion.comment,
      })
    }
  } catch (error) {
    console.error(
      'Error occurred while copying opinions of all NFTs from web3 to web2',
      error
    )
    throw new InternalServerError(
      'Failed to copy opinions of all NFTs from web3 to web2'
    )
  }
  return null
}

export async function syncOpinionsOfNFTInWeb2(tokenID: number) {
  try {
    const contractAddress = getIdeamarketPostsContractAddress()
    if (!contractAddress) {
      console.error('Deployed address is missing for ideamarket posts')
      throw new InternalServerError(
        'Contract address is missing for ideamamrket posts '
      )
    }

    const opinionsSummary = await getOpinionsSummaryOfNFT({
      contractAddress,
      tokenID,
    })
    const {
      allOpinions,
      averageRating,
      totalRatingsCount,
      latestRatingsCount,
      totalCommentsCount,
      latestCommentsCount,
    } = opinionsSummary

    console.log(`Calculating composite rating for tokenID=${tokenID}`)
    const latestOpinions = opinionsSummary.latestOpinions.map(
      async (opinion: any) => {
        const block = await web3.eth.getBlock(opinion.blockHeight)
        return {
          contractAddress: (opinion.contractAddress as string).toLowerCase(),
          tokenID: opinion.tokenID,
          author: (opinion.author as string).toLowerCase(),
          timestamp: block.timestamp.toString(),
          rating: opinion.rating,
          comment: opinion.comment,
        }
      }
    )
    const { compositeRating, marketInterest } =
      await calculateCompositeRatingAndMarketInterest(latestOpinions)

    console.log(
      `Updating opinions summary of NFT with contractAddress=${contractAddress} and tokenId=${tokenID}`
    )
    await PostModel.findOneAndUpdate(
      { contractAddress, tokenID },
      {
        $set: {
          contractAddress,
          tokenID,
          averageRating,
          compositeRating,
          marketInterest,
          totalRatingsCount,
          latestRatingsCount,
          totalCommentsCount,
          latestCommentsCount,
        },
      }
    )
    console.log(
      `Syncing all opinions of the NFT with contractAddress=${contractAddress} and tokenId=${tokenID}`
    )
    for await (const opinion of allOpinions) {
      const block = await web3.eth.getBlock(opinion.blockHeight)
      await updateNFTOpinionInWeb2({
        contractAddress: (opinion.contractAddress as string).toLowerCase(),
        tokenID: opinion.tokenID,
        author: (opinion.author as string).toLowerCase(),
        timestamp: block.timestamp.toString(),
        rating: opinion.rating,
        comment: opinion.comment,
      })
    }
  } catch (error) {
    console.error(
      'Error occurred while copying opinions of an NFT from web3 to web2',
      error
    )
    throw new InternalServerError(
      'Failed to copy opinions of an NFT from web3 to web2'
    )
  }
}

async function updateNFTOpinionInWeb2(opinion: Web3NFTOpinionData) {
  try {
    const ratedAt = new Date(Number.parseInt(opinion.timestamp) * 1000)
    console.log(
      `Handling NFT opinion of ${opinion.contractAddress} - ${opinion.tokenID} rated by ${opinion.author} at ${opinion.timestamp}`
    )

    const web2NFTOpinionExists = await NFTOpinionModel.exists({
      contractAddress: opinion.contractAddress,
      tokenID: opinion.tokenID,
      ratedBy: opinion.author,
      ratedAt,
      rating: opinion.rating,
      comment: opinion.comment,
    })
    if (web2NFTOpinionExists) {
      return await Promise.resolve(null)
    }

    console.log(
      `Updating NFT opinion of ${opinion.contractAddress} - ${opinion.tokenID} rated by ${opinion.author} at ${opinion.timestamp}`
    )
    const web2NFTOpinionDoc = NFTOpinionModel.build({
      contractAddress: opinion.contractAddress,
      tokenID: opinion.tokenID,
      ratedBy: opinion.author,
      ratedAt,
      rating: Number.parseInt(opinion.rating),
      comment: opinion.comment,
    })
    return await NFTOpinionModel.create(web2NFTOpinionDoc)
  } catch (error) {
    console.error(
      'Error occurred while syncing the nft opinion from web3 to web2',
      error
    )
    return Promise.resolve(null)
  }
}
