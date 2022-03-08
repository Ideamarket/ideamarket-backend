/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable @typescript-eslint/no-throw-literal */
/* eslint-disable import/no-default-export */
import mongoUriBuilder from 'mongo-uri-builder'

import type {
  MarketConfig,
  TwitchConfig,
  TwitterConfig,
} from '../src/types/verification-config'
import { CHAIN } from '../src/verification-eth'

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
  verification: {
    rpcAvm:
      'https://arbitrum-mainnet.infura.io/v3/98ca28d50f234e618a22a8b0d83c40b2',
    rpcMainnet:
      'https://eth.backend.ideamarket.io/69e8af5dd5912b88aea0bb06bd43d8aa',
    rpcRinkeby:
      'https://eth-rinkeby.backend.ideamarket.io/69e8af5dd5912b88aea0bb06bd43d8aa',
    rpcTest:
      'https://eth-rinkeby.backend.ideamarket.io/69e8af5dd5912b88aea0bb06bd43d8aa',
    rpcTestAvmL2:
      'https://arbitrum-rinkeby.infura.io/v3/98ca28d50f234e618a22a8b0d83c40b2',

    subgraphAvm:
      'https://subgraph.backend.ideamarket.io/subgraphs/name/Ideamarket/Ideamarket',
    subgraphMainnet:
      'https://subgraph.backend.ideamarket.io/subgraphs/name/Ideamarket/Ideamarket',
    subgraphRinkeby:
      'https://subgraph-rinkeby.backend.ideamarket.io/subgraphs/name/Ideamarket/IdeamarketRINKEBY',
    subgraphTest:
      'https://subgraph-test.backend.ideamarket.io/subgraphs/name/Ideamarket/IdeamarketTEST',
    subgraphTestAvmL2:
      'https://subgraph-test-avm-l2.backend.ideamarket.io/subgraphs/name/Ideamarket/IdeamarketTESTAVML2',

    privateKeyAvm:
      '0x91b9d0d2ca55e11bd09eea8239e46833a882d8bdba9a3ae851d5090b695d2058',
    privateKeyMainnet:
      '0x91b9d0d2ca55e11bd09eea8239e46833a882d8bdba9a3ae851d5090b695d2058',
    privateKeyRinkeby:
      '0x3d1d761cafd0b2cf44985af443d46eacc4f44f3d71fea9d5d0ba728645a25b14',
    privateKeyTest:
      '0x3d1d761cafd0b2cf44985af443d46eacc4f44f3d71fea9d5d0ba728645a25b14',
    privateKeyTestAvmL2:
      '0x3d1d761cafd0b2cf44985af443d46eacc4f44f3d71fea9d5d0ba728645a25b14',

    ethGasStationAPIKey:
      '4be402680d193014612e87f4714dbbcc2ba01a0d37e1a43d00999a5deeae',

    contractAddressAvm: '0x15ae05599809AF9D1A04C10beF217bc04060dD81',
    contractAddressMainnet: '0xBe7e6a7cD3BEBC1776e64E988bd1518AA3Ad29A4',
    contractAddressRinkeby: '0x5902aFCBb0fdaB8358be06fe09C13F04dd48749b',
    contractAddressTest: '0x7A408E3d1A5Ed46A23C91045e29F429792F40663',
    contractAddressTestAvmL2: '0xc07efAEF14518008b7D5009d360492C89e09C9Cb',

    twitter: {
      apiKey: 'tkCKFaixE8sssWf5BOU8yTq3b',
      apiSecret: 'cBtqXyKNLp25PdL19QhSCHYMzT8iGNBtUGXIbaqsHfXNvd1NnG',
      bearer:
        'AAAAAAAAAAAAAAAAAAAAAFfPKAEAAAAAat6S8tzrKkk4VhihWfYptopvlN8%3DhICvXQhlGcj0mBNzoBjGwAvCr79e16KwOHytCXcGBtMcCQkXzC',
    },

    twitch: {
      clientID: '4u6pix5vojvk0fif44v47f6kfthign',
      clientSecret: 's5ycic7aof7mgnab4hy81ov3pbu14t',
    },
  },
  verificationMarkets: [
    {
      name: 'Twitter',
      configs: [
        {
          chain: 'avm',
          enabled: true,
          feeEnabled: false,
          skipVerification: false,
        },
        {
          chain: 'mainnet',
          enabled: false,
          feeEnabled: true,
          skipVerification: false,
        },
        {
          chain: 'rinkeby',
          enabled: true,
          feeEnabled: false,
          skipVerification: false,
        },
        {
          chain: 'test',
          enabled: true,
          feeEnabled: true,
          skipVerification: true,
        },
        {
          chain: 'test-avm-l2',
          enabled: true,
          feeEnabled: false,
          skipVerification: true,
        },
      ],
    },
    {
      name: 'Substack',
      configs: [
        {
          chain: 'avm',
          enabled: true,
          feeEnabled: false,
          skipVerification: false,
        },
        {
          chain: 'mainnet',
          enabled: false,
          feeEnabled: true,
          skipVerification: false,
        },
        {
          chain: 'rinkeby',
          enabled: true,
          feeEnabled: false,
          skipVerification: false,
        },
        {
          chain: 'test',
          enabled: true,
          feeEnabled: true,
          skipVerification: true,
        },
        {
          chain: 'test-avm-l2',
          enabled: true,
          feeEnabled: false,
          skipVerification: true,
        },
      ],
    },
    {
      name: 'Showtime',
      configs: [
        {
          chain: 'avm',
          enabled: false,
          feeEnabled: true,
          skipVerification: false,
        },
        {
          chain: 'mainnet',
          enabled: false,
          feeEnabled: true,
          skipVerification: false,
        },
        {
          chain: 'rinkeby',
          enabled: false,
          feeEnabled: false,
          skipVerification: false,
        },
        {
          chain: 'test',
          enabled: true,
          feeEnabled: true,
          skipVerification: false,
        },
        {
          chain: 'test-avm-l2',
          enabled: true,
          feeEnabled: false,
          skipVerification: false,
        },
      ],
    },
    {
      name: 'Twitch',
      configs: [
        {
          chain: 'avm',
          enabled: false,
          feeEnabled: false,
          skipVerification: false,
        },
        {
          chain: 'mainnet',
          enabled: false,
          feeEnabled: true,
          skipVerification: false,
        },
        {
          chain: 'rinkeby',
          enabled: false,
          feeEnabled: false,
          skipVerification: false,
        },
        {
          chain: 'test',
          enabled: false,
          feeEnabled: true,
          skipVerification: false,
        },
        {
          chain: 'test-avm-l2',
          enabled: false,
          feeEnabled: true,
          skipVerification: false,
        },
      ],
    },
    {
      name: 'Minds',
      configs: [
        {
          chain: 'avm',
          enabled: false,
          feeEnabled: false,
          skipVerification: false,
        },
        {
          chain: 'mainnet',
          enabled: false,
          feeEnabled: true,
          skipVerification: false,
        },
        {
          chain: 'rinkeby',
          enabled: true,
          feeEnabled: true,
          skipVerification: false,
        },
        {
          chain: 'test',
          enabled: true,
          feeEnabled: true,
          skipVerification: true,
        },
        {
          chain: 'test-avm-l2',
          enabled: true,
          feeEnabled: false,
          skipVerification: false,
        },
      ],
    },
    {
      name: 'Wikipedia',
      configs: [
        {
          chain: 'avm',
          enabled: false,
          feeEnabled: false,
          skipVerification: false,
        },
        {
          chain: 'mainnet',
          enabled: false,
          feeEnabled: true,
          skipVerification: false,
        },
        {
          chain: 'rinkeby',
          enabled: true,
          feeEnabled: true,
          skipVerification: false,
        },
        {
          chain: 'test',
          enabled: true,
          feeEnabled: true,
          skipVerification: true,
        },
        {
          chain: 'test-avm-l2',
          enabled: true,
          feeEnabled: false,
          skipVerification: false,
        },
      ],
    },
  ],
}

export function getRPC(chain: string): string {
  switch (chain) {
    case CHAIN.AVM:
      return config.verification.rpcAvm
    case CHAIN.MAINNET:
      return config.verification.rpcMainnet
    case CHAIN.RINKEBY:
      return config.verification.rpcRinkeby
    case CHAIN.TEST:
      return config.verification.rpcTest
    case CHAIN.TEST_AVM_L2:
      return config.verification.rpcTestAvmL2
  }

  throw `Config: getRPC: unknown chain ${chain}`
}

export function getSubgraph(chain: string): string {
  switch (chain) {
    case CHAIN.AVM:
      return config.verification.subgraphAvm
    case CHAIN.MAINNET:
      return config.verification.subgraphMainnet
    case CHAIN.RINKEBY:
      return config.verification.subgraphRinkeby
    case CHAIN.TEST:
      return config.verification.subgraphTest
    case CHAIN.TEST_AVM_L2:
      return config.verification.subgraphTestAvmL2
  }

  throw `Config: getSubgraph: unknown chain ${chain}`
}

export function getPrivateKey(chain: string): string {
  switch (chain) {
    case CHAIN.AVM:
      return config.verification.privateKeyAvm
    case CHAIN.MAINNET:
      return config.verification.privateKeyMainnet
    case CHAIN.RINKEBY:
      return config.verification.privateKeyRinkeby
    case CHAIN.TEST:
      return config.verification.privateKeyTest
    case CHAIN.TEST_AVM_L2:
      return config.verification.privateKeyTestAvmL2
  }

  throw `Config: getPrivateKey: unknown chain ${chain}`
}

export function getETHGasStationAPIKey(): string {
  return config.verification.ethGasStationAPIKey
}

export function getContractAddress(chain: string): string {
  switch (chain) {
    case CHAIN.AVM:
      return config.verification.contractAddressAvm
    case CHAIN.MAINNET:
      return config.verification.contractAddressMainnet
    case CHAIN.RINKEBY:
      return config.verification.contractAddressRinkeby
    case CHAIN.TEST:
      return config.verification.contractAddressTest
    case CHAIN.TEST_AVM_L2:
      return config.verification.contractAddressTestAvmL2
  }

  throw `Config: getContractAddress: unknown chain ${chain}`
}

export function getTwitterConfig(): TwitterConfig {
  return config.verification.twitter
}

export function getTwitchConfig(): TwitchConfig {
  return config.verification.twitch
}

export function getMarketConfig(name: string, chain: string): MarketConfig {
  for (const market of config.verificationMarkets) {
    if (market.name === name) {
      for (const config of market.configs) {
        if (config.chain === chain) {
          return config
        }
      }
    }
  }

  throw 'Config: getMarketConfig: market config not found'
}

export default config
