import { BlockModel } from '../models/block-model'
import { PostCitedByModel } from '../models/post-citedby-model'
import { NETWORK } from '../util/web3Util'
import { web3 } from '../web3/contract'
import { getDeployedAddresses } from '../web3/deployedAddresses'
import { getPastEvents } from '../web3/opinions/nft-opinions'
import { EntityNotFoundError, InternalServerError } from './errors'

export async function syncAllCitedByPostsInWeb2() {
  const contractAddress = getNFTOpinionBaseContractAddress()
  if (!contractAddress) {
    console.error('Deployed address is missing for nft opinion base')
    throw new InternalServerError(
      'Contract address is missing for nft opinion base '
    )
  }

  try {
    console.error(`Fetching block for contractAddress = ${contractAddress}`)
    const block = await BlockModel.findOne({ contractAddress })
    if (!block) {
      console.error(
        `Block does not exist for contractAddress = ${contractAddress}`
      )
      throw new EntityNotFoundError(
        null,
        'Block does not exist for the current contract address'
      )
    }

    // 14_168_794
    const startBlock = block.endBlock ?? block.startBlock
    const endBlock = await web3.eth.getBlockNumber()
    console.log(
      `Fetching all the events from startBlock=${startBlock} to endBlock=${endBlock}`
    )
    const events = await getPastEvents({ startBlock, endBlock })
    for await (const event of events) {
      console.log(`Syncing event - ${JSON.stringify(event)}`)
      const { citations, tokenID } = event.returnValues
      for await (const citation of citations) {
        console.log(`Handling citation=${citation as number}`)
        const postCitedBy = await PostCitedByModel.findOne({
          contractAddress,
          tokenID: citation,
        })

        if (!postCitedBy) {
          await PostCitedByModel.create({
            contractAddress,
            tokenID: citation,
            citedBy: [tokenID],
          })
          continue
        }

        if (!postCitedBy.citedBy.includes(tokenID)) {
          postCitedBy.citedBy = [...postCitedBy.citedBy, tokenID]
          await postCitedBy.save()
        }
      }
    }

    console.log(`Updating the endBlock for contractAddress=${contractAddress}`)
    block.endBlock = endBlock
    await block.save()
  } catch (error) {
    console.error('Error occurred while syncing citedBy posts', error)
    throw new InternalServerError('Failed to sync citedBy posts')
  }
}

export function getNFTOpinionBaseContractAddress() {
  const nftOpinionBaseDeployedAddress =
    getDeployedAddresses(NETWORK)?.nftOpinionBase

  return nftOpinionBaseDeployedAddress
    ? nftOpinionBaseDeployedAddress.toLowerCase()
    : undefined
}
