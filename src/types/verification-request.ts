export const VERIFICATION_STATE = {
  AWAITING_VERIFICATION: `AWAITING_VERIFICATION`,
  AWAITING_FEE_TX_CONFIRMATION: `AWAITING_FEE_TX_CONFIRMATION`,
  VERIFIED: `VERIFIED`,
}

export type VerificationRequest = {
  state: string
  tokenAddress: string
  ownerAddress: string
  chain: string
  uuid: string
  weiFee: string
  feeTx: string
  createdAt: number
}
