/* eslint-disable import/no-default-export */
import mongoUriBuilder from 'mongo-uri-builder'

const HOUR_SECONDS = 3600
const DAY_SECONDS = 24 * HOUR_SECONDS

const config = {
  client: {
    hostUrl: process.env.CLIENT_HOST_URL ?? 'http://localhost:3000',
  },
  server: {
    hostUrl: process.env.SERVER_HOST_URL ?? 'http://localhost:3300',
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
  lockingDatabaseName: process.env.LOCKING_MONGODB_DATABASE,
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
  auth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
    },
    twitter: {
      consumerKey: process.env.TWITTER_CONSUMER_KEY ?? '',
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET ?? '',
      accessToken: process.env.TWITTER_ACCESS_TOKEN ?? '',
      accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET ?? '',
      bearerToken: process.env.TWITTER_BEARER_TOKEN ?? '',
      callbackSuffix: '/twitterVerification',
    },
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
    privateKeys: {
      avm: process.env.PRIVATE_KEY_AVM ?? '',
      mainnet: process.env.PRIVATE_KEY_MAINNET ?? '',
      rinkeby: process.env.PRIVATE_KEY_RINKEBY ?? '',
      'test-avm-l1': process.env.PRIVATE_KEY_TEST_AVM_L1 ?? '',
      'test-avm-l2': process.env.PRIVATE_KEY_TEST_AVM_L2 ?? '',
      test: process.env.PRIVATE_KEY_TEST ?? '',
    },
    contractAddresses: {
      avm: process.env.CONTRACT_ADDRESS_AVM ?? '',
      mainnet: process.env.CONTRACT_ADDRESS_MAINNET ?? '',
      rinkeby: process.env.CONTRACT_ADDRESS_RINKEBY ?? '',
      'test-avm-l1': process.env.CONTRACT_ADDRESS_TEST_AVM_L1 ?? '',
      'test-avm-l2': process.env.CONTRACT_ADDRESS_TEST_AVM_L2 ?? '',
      test: process.env.CONTRACT_ADDRESS_TEST ?? '',
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
    names: {
      twitterMarketName: 'Twitter',
      substackMarketName: 'Substack',
      showtimeMarketName: 'Showtime',
      wikipediaMarketName: 'Wikipedia',
      mindsMarketName: 'Minds',
      urlMarketName: 'URL',
    },
    market1: process.env.MARKET1 ?? '',
    market2: process.env.MARKET2 ?? '',
    market3: process.env.MARKET3 ?? '',
    market4: process.env.MARKET4 ?? '',
    market5: process.env.MARKET5 ?? '',
    market6: process.env.MARKET6 ?? '',
  },
}

export default config
