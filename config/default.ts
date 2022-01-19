/* eslint-disable sonarjs/no-duplicate-string */
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
      avm:
        process.env.RPC_URL_AVM ??
        'https://arbitrum-mainnet.infura.io/v3/98ca28d50f234e618a22a8b0d83c40b2',
      mainnet:
        process.env.RPC_URL_MAINNET ??
        'https://mainnet.infura.io/v3/98ca28d50f234e618a22a8b0d83c40b2',
      rinkeby:
        process.env.RPC_URL_RINKEBY ??
        'https://rinkeby.infura.io/v3/98ca28d50f234e618a22a8b0d83c40b2',
      'test-avm-l1':
        process.env.RPC_URL_TEST_AVM_L1 ??
        'https://rinkeby.infura.io/v3/98ca28d50f234e618a22a8b0d83c40b2',
      'test-avm-l2':
        process.env.RPC_URL_TEST_AVM_L2 ??
        'https://arbitrum-rinkeby.infura.io/v3/98ca28d50f234e618a22a8b0d83c40b2',
      test:
        process.env.RPC_URL_TEST ??
        'https://rinkeby.infura.io/v3/98ca28d50f234e618a22a8b0d83c40b2',
    },
  },
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY ?? '',
    fromEmail: 'admin@ideamarket.io',
    emailVerificationTemplateId:
      process.env.SENDGRID_EMAIL_VERIFICATION_TEMPLATE_ID ?? '',
  },
}

export default config
