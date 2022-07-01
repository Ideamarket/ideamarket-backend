import { getOpinionBountiesContract } from './contract'

export type Bounty = {
  bountyID: number
  tokenID: number
  user: string
  depositer: string
  token: string
  amount: number
  status: string
  blockHeight: string
}

export async function getAllBounties() {
  const opinionBountiesContract = getOpinionBountiesContract()
  const allBounties = await opinionBountiesContract.methods
    .getAllBounties()
    .call()

  return (allBounties as any[]).map((bounty: any) => mapWeb3Bounty(bounty))
}

export async function getBounty(bountyID: number) {
  const opinionBountiesContract = getOpinionBountiesContract()
  const bounty = await opinionBountiesContract.methods
    .getBounty(bountyID)
    .call()

  return mapWeb3Bounty(bounty)
}

function mapWeb3Bounty(bounty: any): Bounty {
  return {
    bountyID: bounty.bountyID,
    tokenID: bounty.tokenID,
    user: bounty.user,
    depositer: bounty.depositer,
    token: bounty.token,
    amount: bounty.amount,
    status: bounty.status,
    blockHeight: bounty.blockHeight,
  }
}
