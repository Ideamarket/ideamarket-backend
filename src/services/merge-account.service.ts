/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import type { AccountDocument } from '../models/account.model'
import { AccountModel } from '../models/account.model'
import { BlacklistedListingModel } from '../models/blacklisted-listings.model'
import { CommentModel } from '../models/comment.model'
import { ListingModel } from '../models/listing.model'
import {
  MergeAccountModel,
  MergeAccountStatus,
} from '../models/merge-account.model'
import { VoteModel } from '../models/vote.model'
import { EntityNotFoundError, InternalServerError } from './errors'

export async function mergeAccounts({
  mergeAccountId,
  currentAccountId,
}: {
  mergeAccountId: string
  currentAccountId: string
}) {
  const mergeAccountDoc = await MergeAccountModel.findById(mergeAccountId)
    .populate('emailAccount')
    .populate('walletAccount')

  // All Validations
  if (!mergeAccountDoc) {
    console.error('MergeAccount doesnot exist')
    throw new EntityNotFoundError(
      null,
      'Merge account doesnot exist for the given id'
    )
  }

  if (mergeAccountDoc.status === MergeAccountStatus.COMPLETE) {
    console.info('Merge was already done')
    return {
      merged: true,
      logoutRequired: false,
    }
  }

  if (!mergeAccountDoc.emailAccount || !mergeAccountDoc.walletAccount) {
    console.error('Either emailAccount/walletAccount is null')
    throw new InternalServerError('Failed to merge the accounts')
  }

  if (
    !mergeAccountDoc.emailAccount.email ||
    mergeAccountDoc.emailAccount.walletAddress
  ) {
    console.error(
      `Invalid emailAccount :: email=${
        mergeAccountDoc.emailAccount.email ?? ''
      }, wallet=${mergeAccountDoc.emailAccount.walletAddress ?? ''}`
    )
    throw new InternalServerError(
      'Failed to merge the accounts - Invalid emailAccount'
    )
  }

  if (
    !mergeAccountDoc.walletAccount.walletAddress ||
    mergeAccountDoc.walletAccount.email
  ) {
    console.error(
      `Invalid walletAccount :: wallet=${
        mergeAccountDoc.walletAccount.walletAddress ?? ''
      }, email=${mergeAccountDoc.walletAccount.email ?? ''}`
    )
    throw new InternalServerError(
      'Failed to merge the accounts - Invalid walletAccount'
    )
  }

  if (
    (mergeAccountDoc.emailAccount.verified &&
      mergeAccountDoc.walletAccount.verified) ||
    (mergeAccountDoc.emailAccount.username &&
      mergeAccountDoc.walletAccount.username)
  ) {
    console.error(
      `Both accounts are verified :: emailAccountUsername=${
        mergeAccountDoc.emailAccount.username ?? ''
      }, walletAccountUsername=${mergeAccountDoc.walletAccount.username ?? ''}`
    )
    throw new InternalServerError(
      'Failed to merge the accounts - Both accounts are verified'
    )
  }
  // ----------------------------

  // TODO : In future, if we add any collection which has account reference (especially for web2 stuff) that needs to be handled here
  // Update all the references of emailAccount to walletAccount
  const blacklistedListings = updateAllBlacklistedListings({
    emailAccount: mergeAccountDoc.emailAccount,
    walletAccount: mergeAccountDoc.walletAccount,
  })
  const listings = updateAllListings({
    emailAccount: mergeAccountDoc.emailAccount,
    walletAccount: mergeAccountDoc.walletAccount,
    walletAccountWalletAddress: mergeAccountDoc.walletAccount.walletAddress,
  })
  const comments = updateAllComments({
    emailAccount: mergeAccountDoc.emailAccount,
    walletAccount: mergeAccountDoc.walletAccount,
  })
  const votes = updateAllVotes({
    emailAccount: mergeAccountDoc.emailAccount,
    walletAccount: mergeAccountDoc.walletAccount,
  })
  await Promise.all([blacklistedListings, listings, comments, votes])

  // Delete emailAccount and update walletAccount
  const {
    email,
    _id: emailAccountId,
    verified: emailAccountVerified,
    username: emailAccountUsername,
    name: emailAccountName,
    bio: emailAccountBio,
  } = mergeAccountDoc.emailAccount
  await AccountModel.findByIdAndDelete(emailAccountId)
  await AccountModel.findByIdAndUpdate(mergeAccountDoc.walletAccount._id, {
    $set: {
      email,
      verified: mergeAccountDoc.walletAccount.verified || emailAccountVerified,
      username: mergeAccountDoc.walletAccount.username || emailAccountUsername,
      name: mergeAccountDoc.walletAccount.name || emailAccountName,
      bio: mergeAccountDoc.walletAccount.bio || emailAccountBio,
    },
  })

  // Update status of the mergeAccountDoc
  mergeAccountDoc.status = MergeAccountStatus.COMPLETE
  await mergeAccountDoc.save()

  return {
    merged: true,
    logoutRequired:
      currentAccountId.toString() !==
      mergeAccountDoc.walletAccount._id.toString(),
  }
}

/**
 * Updates all the emailAccount references to walletAccount
 * in blacklisted-listings collection
 */
async function updateAllBlacklistedListings({
  emailAccount,
  walletAccount,
}: {
  emailAccount: AccountDocument
  walletAccount: AccountDocument
}) {
  const allBlacklistedListings = await BlacklistedListingModel.find({
    ghostListedByAccount: emailAccount,
  })

  for await (const blacklistedListing of allBlacklistedListings) {
    blacklistedListing.blacklistedBy = walletAccount
    await blacklistedListing.save()
  }
}

/**
 * Updates all the emailAccount references to walletAccount
 * in listings collection
 */
async function updateAllListings({
  emailAccount,
  walletAccount,
  walletAccountWalletAddress,
}: {
  emailAccount: AccountDocument
  walletAccount: AccountDocument
  walletAccountWalletAddress: string
}) {
  const allListings = await ListingModel.find({
    ghostListedByAccount: emailAccount,
  })

  for await (const listing of allListings) {
    listing.ghostListedByAccount = walletAccount
    listing.ghostListedBy = walletAccountWalletAddress
    await listing.save()
  }
}

/**
 * Updates all the emailAccount references to walletAccount
 * in comments collection
 */
async function updateAllComments({
  emailAccount,
  walletAccount,
}: {
  emailAccount: AccountDocument
  walletAccount: AccountDocument
}) {
  const allComments = await CommentModel.find({ account: emailAccount })

  for await (const comment of allComments) {
    comment.account = walletAccount
    await comment.save()
  }
}

/**
 * Updates all the emailAccount references to walletAccount
 * in votes collection
 */
async function updateAllVotes({
  emailAccount,
  walletAccount,
}: {
  emailAccount: AccountDocument
  walletAccount: AccountDocument
}) {
  const allVotes = await VoteModel.find({ account: emailAccount })

  for await (const vote of allVotes) {
    vote.account = walletAccount
    await vote.save()
  }
}
