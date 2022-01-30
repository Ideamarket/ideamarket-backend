/* eslint-disable import/no-default-export */
import mongoUriBuilder from 'mongo-uri-builder'

const HOUR_SECONDS = 3600
const DAY_SECONDS = 24 * HOUR_SECONDS

const config = {
  server: {
    port: process.env.PORT ? Number.parseInt(process.env.PORT) : 3300,
  },
  mongodb: {
    uri:
      process.env.MONGODB_URI ??
      mongoUriBuilder({
        username: process.env.MONGODB_USERNAME ?? undefined,
        password: process.env.MONGODB_PASSWORD ?? undefined,
        host: process.env.MONGODB_HOST ?? 'localhost',
        port: process.env.MONGODB_PORT
          ? Number.parseInt(process.env.MONGODB_PORT)
          : 27_017,
        database: process.env.MONGODB_DATABASE ?? 'ideamarket',
      }),
  },
  jwt: {
    secretKey: process.env.JWT_SECRET_KEY ?? undefined,
    expiry: process.env.JWT_TOKEN_EXPIRY
      ? Number.parseInt(process.env.JWT_TOKEN_EXPIRY)
      : 30 * DAY_SECONDS,
  },
  aws: {
    accessKey: process.env.AWS_ACCESS_KEY ?? '',
    secretKey: process.env.AWS_SECRET_KEY ?? '',
    region: process.env.AWS_REGION ?? '',
  },
  account: {
    s3Bucket: process.env.ACCOUNTS_S3_BUCKET ?? '',
    cloudFrontDomain: process.env.ACCOUNTS_CLOUDFRONT_DOMAIN ?? '',
  },
  web3: {
    network: process.env.NETWORK ?? 'test-avm-l2',
    rpcUrls: {
      avm: process.env.RPC_URL_AVM ?? '',
      mainnet: process.env.RPC_URL_MAINNET ?? '',
      rinkeby: process.env.RPC_URL_RINKEBY ?? '',
      'test-avm-l1': process.env.RPC_URL_TEST_AVM_L1 ?? '',
      'test-avm-l2': process.env.RPC_URL_TEST_AVM_L2 ?? '',
      test: process.env.RPC_URL_TEST ?? '',
    },
    subgraphUrls: {
      avm: process.env.SUBGRAPH_URL_AVM ?? '',
      mainnet: process.env.SUBGRAPH_URL_MAINNET ?? '',
      rinkeby: process.env.SUBGRAPH_URL_RINKEBY ?? '',
      'test-avm-l1': process.env.SUBGRAPH_URL_TEST_AVM_L1 ?? '',
      'test-avm-l2': process.env.SUBGRAPH_URL_TEST_AVM_L2 ?? '',
      test: process.env.SUBGRAPH_URL_TEST ?? '',
    },
  },
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY ?? '',
    fromEmail: 'admin@ideamarket.io',
    emailVerificationTemplateId:
      process.env.SENDGRID_EMAIL_VERIFICATION_TEMPLATE_ID ?? '',
  },
  markets: {
    validMarketIds: process.env.VALID_MARKET_IDS ?? '1,2,3,4,5,6',
    market1: process.env.MARKET1 ?? '',
    market2: process.env.MARKET2 ?? '',
    market3: process.env.MARKET3 ?? '',
    market4: process.env.MARKET4 ?? '',
    market5: process.env.MARKET5 ?? '',
    market6: process.env.MARKET6 ?? '',
  },
}

export default config
