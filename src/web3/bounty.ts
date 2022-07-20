import { getOpinionBountiesContract } from './contract'

export type Bounty = {
  bountyID: number
  tokenID: number
  user: string
  depositor: string
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

export async function getBounty(
  tokenID: number,
  userAddress: string,
  token: string
) {
  const opinionBountiesContract = getOpinionBountiesContract()
  const bounty = await opinionBountiesContract.methods
    .getBountyInfo(tokenID, userAddress, token)
    .call()

  return mapWeb3Bounty(bounty)
}

export async function getBountyAmountPayable(
  tokenID: number,
  user: string,
  token: string
) {
  const opinionBountiesContract = getOpinionBountiesContract()
  // eslint-disable-next-line sonarjs/prefer-immediate-return
  const amount = await opinionBountiesContract.methods
    .getBountyAmountPayable(tokenID, user, token)
    .call()

  return amount
}

function mapWeb3Bounty(bounty: any): Bounty {
  return {
    bountyID: Number.parseInt(bounty.bountyID),
    tokenID: bounty.tokenID,
    user: bounty.user,
    depositor: bounty.depositor,
    token: bounty.token,
    amount: bounty.amount,
    status: bounty.status,
    blockHeight: bounty.blockHeight,
  }
}
