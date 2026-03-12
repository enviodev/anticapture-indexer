import { DaoIdEnum } from "./enums";

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export enum ProposalStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  CANCELED = "CANCELED",
  DEFEATED = "DEFEATED",
  SUCCEEDED = "SUCCEEDED",
  QUEUED = "QUEUED",
  EXPIRED = "EXPIRED",
  EXECUTED = "EXECUTED",
  NO_QUORUM = "NO_QUORUM",
}

export enum MetricTypesEnum {
  TOTAL_SUPPLY = "TOTAL_SUPPLY",
  DELEGATED_SUPPLY = "DELEGATED_SUPPLY",
  CEX_SUPPLY = "CEX_SUPPLY",
  DEX_SUPPLY = "DEX_SUPPLY",
  LENDING_SUPPLY = "LENDING_SUPPLY",
  CIRCULATING_SUPPLY = "CIRCULATING_SUPPLY",
  TREASURY = "TREASURY",
}

// Contract addresses for each DAO
export const CONTRACT_ADDRESSES: Record<
  DaoIdEnum,
  {
    blockTime: number;
    tokenType?: string;
    token: { address: string; decimals: number };
    governor?: { address: string };
    auction?: { address: string };
  }
> = {
  [DaoIdEnum.UNI]: {
    blockTime: 12,
    tokenType: "ERC20",
    token: { address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", decimals: 18 },
    governor: { address: "0x408ED6354d4973f66138C91495F2f2FCbd8724C3" },
  },
  [DaoIdEnum.ENS]: {
    blockTime: 12,
    tokenType: "ERC20",
    token: { address: "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72", decimals: 18 },
    governor: { address: "0x323a76393544d5ecca80cd6ef2a560c6a395b7e3" },
  },
  [DaoIdEnum.ARB]: {
    blockTime: 0.25,
    tokenType: "ERC20",
    token: { address: "0x912CE59144191C1204E64559FE8253a0e49E6548", decimals: 18 },
  },
  [DaoIdEnum.OP]: {
    blockTime: 2,
    tokenType: "ERC20",
    token: { address: "0x4200000000000000000000000000000000000042", decimals: 18 },
    governor: { address: "0xcDF27F107725988f2261Ce2256bDfCdE8B382B10" },
  },
  [DaoIdEnum.GTC]: {
    blockTime: 12,
    tokenType: "ERC20",
    token: { address: "0xDe30da39c46104798bB5aA3fe8B9e0e1F348163F", decimals: 18 },
    governor: { address: "0x9D4C63565D5618310271bF3F3c01b2954C1D1639" },
  },
  [DaoIdEnum.NOUNS]: {
    blockTime: 12,
    tokenType: "ERC721",
    token: { address: "0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03", decimals: 0 },
    governor: { address: "0x6f3e6272a167e8accb32072d08e0957f9c79223d" },
    auction: { address: "0x830BD73E4184ceF73443C15111a1DF14e495C706" },
  },
  [DaoIdEnum.SCR]: {
    blockTime: 1.5,
    tokenType: "ERC20",
    token: { address: "0xd29687c813D741E2F938F4aC377128810E217b1b", decimals: 18 },
    governor: { address: "0x2f3f2054776bd3c2fc30d750734a8f539bb214f0" },
  },
  [DaoIdEnum.COMP]: {
    blockTime: 12,
    tokenType: "ERC20",
    token: { address: "0xc00e94Cb662C3520282E6f5717214004A7f26888", decimals: 18 },
    governor: { address: "0x309a862bbC1A00e45506cB8A802D1ff10004c8C0" },
  },
  [DaoIdEnum.OBOL]: {
    blockTime: 12,
    tokenType: "ERC20",
    token: { address: "0x0B010000b7624eb9B3DfBC279673C76E9D29D5F7", decimals: 18 },
    governor: { address: "0xcB1622185A0c62A80494bEde05Ba95ef29Fbf85c" },
  },
  [DaoIdEnum.ZK]: {
    blockTime: 1,
    tokenType: "ERC20",
    token: { address: "0x5A7d6b2F92C77FAD6CCaBd7EE0624E64907Eaf3E", decimals: 18 },
    governor: { address: "0xb83FF6501214ddF40C91C9565d095400f3F45746" },
  },
};

// Map token contract addresses (lowercased) to DaoIdEnum
export const TOKEN_ADDRESS_TO_DAO: Record<string, DaoIdEnum> = {};
for (const [daoId, config] of Object.entries(CONTRACT_ADDRESSES)) {
  TOKEN_ADDRESS_TO_DAO[config.token.address.toLowerCase()] = daoId as DaoIdEnum;
}

// Map governor contract addresses (lowercased) to DaoIdEnum
export const GOVERNOR_ADDRESS_TO_DAO: Record<string, DaoIdEnum> = {};
for (const [daoId, config] of Object.entries(CONTRACT_ADDRESSES)) {
  if (config.governor) {
    GOVERNOR_ADDRESS_TO_DAO[config.governor.address.toLowerCase()] = daoId as DaoIdEnum;
  }
}

// Treasury addresses per DAO
export const TreasuryAddresses: Record<DaoIdEnum, Record<string, string>> = {
  [DaoIdEnum.UNI]: {
    timelock: "0x1a9C8182C09F50C8318d769245beA52c32BE35BC",
    treasuryVester1: "0x4750c43867EF5F89869132ecCF19B9b6C4286E1a",
    treasuryVester2: "0xe3953D9d317B834592aB58AB2c7A6aD22b54075D",
    treasuryVester3: "0x4b4e140D1f131fdaD6fb59C13AF796fD194e4135",
    treasuryVester4: "0x3D30B1aB88D487B0F3061F40De76845Bec3F1e94",
  },
  [DaoIdEnum.ENS]: {
    timelock: "0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7",
    endaoment: "0x4F2083f5fBede34C2714aFfb3105539775f7FE64",
    oldEthRegistrarController: "0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5",
    ethRegistrarController: "0x253553366Da8546fC250F225fe3d25d0C782303b",
  },
  [DaoIdEnum.ARB]: {},
  [DaoIdEnum.OP]: {},
  [DaoIdEnum.GTC]: {
    "Gitcoin Timelock": "0x57a8865cfB1eCEf7253c27da6B4BC3dAEE5Be518",
    "Gitcoin CSDO": "0x931896A8A9313F622a2AFCA76d1471B97955e551",
  },
  [DaoIdEnum.NOUNS]: {
    timelock: "0xb1a32fc9f9d8b2cf86c068cae13108809547ef71",
    auction: "0x830BD73E4184ceF73443C15111a1DF14e495C706",
  },
  [DaoIdEnum.SCR]: {
    "DAO Treasury": "0x4cb06982dD097633426cf32038D9f1182a9aDA0c",
    "Foundation Treasury": "0xfF120e015777E9AA9F1417a4009a65d2EdA78C13",
    "Ecosystem Treasury": "0xeE198F4a91E5b05022dc90535729B2545D3b03DF",
  },
  [DaoIdEnum.COMP]: {
    Timelock: "0x6d903f6003cca6255D85CcA4D3B5E5146dC33925",
    Comptroller: "0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B",
  },
  [DaoIdEnum.OBOL]: {
    timelock: "0xCdBf527842Ab04Da548d33EB09d03DB831381Fb0",
  },
  [DaoIdEnum.ZK]: {
    timelock: "0xe5d21A9179CA2E1F0F327d598D464CcF60d89c3d",
  },
};

// CEX addresses per DAO (abbreviated - key addresses only for space)
export const CEXAddresses: Record<DaoIdEnum, Record<string, string>> = {
  [DaoIdEnum.UNI]: {
    BinanceHotWallet: "0x5a52E96BAcdaBb82fd05763E25335261B270Efcb",
    BinanceHotWallet2: "0x28C6c06298d514Db089934071355E5743bf21d60",
    BinanceColdWallet: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
    Robinhood: "0x73AF3bcf944a6559933396c1577B257e2054D935",
    KrakenColdWallet: "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
    CoinbaseColdWallet: "0x6cc8FfF60A60AB0373fB3072f0B846450a8FA443",
    OKXHotWallet: "0x6cC5F688a315f3dC28A7781717a9A798a59fDA7b",
    BybitColdWallet1: "0x88a1493366D48225fc3cEFbdae9eBb23E323Ade3",
    UpbitDeposit: "0xacCFeA7d9e618f60CE1347C52AE206262412AA4a",
    UpbitColdWallet: "0x245445940B317E509002eb682E03f4429184059d",
    MEXCHotWallet: "0x4982085C9e2F89F2eCb8131Eca71aFAD896e89CB",
  },
  [DaoIdEnum.ENS]: {
    BinanceHotWallet: "0x5a52E96BAcdaBb82fd05763E25335261B270Efcb",
    BinanceHotWallet2: "0x28C6c06298d514Db089934071355E5743bf21d60",
    BybitColdWallet1: "0x88a1493366D48225fc3cEFbdae9eBb23E323Ade3",
    CoinbaseHotWallet: "0xA9D1e08C7793af67e9d92fe308d5697FB81d3E43",
    UpbitColdWallet: "0x245445940B317E509002eb682E03f4429184059d",
  },
  [DaoIdEnum.ARB]: {},
  [DaoIdEnum.OP]: {
    "Binance 1": "0xF977814e90dA44bFA03b6295A0616a897441aceC",
    "Binance 2": "0x5a52E96BAcdaBb82fd05763E25335261B270Efcb",
    OKX: "0x611f7bF868a6212f871e89F7e44684045DdFB09d",
    Bybit: "0xf89d7b9c864f589bbF53a82105107622B35EaA40",
    Bithumb: "0xB18fe4B95b7d633c83689B5Ed3ac4ad0a857A2a7",
  },
  [DaoIdEnum.GTC]: {
    "Binance 1": "0xF977814e90dA44bFA03b6295A0616a897441aceC",
    "Binance 2": "0x28C6c06298d514Db089934071355E5743bf21d60",
    "Coinbase 1": "0x237eF9564D74A1056c1A276B03C66055Fa61A700",
    Kraken: "0x310E035d176ccB589511eD16af7aE7BAc4fc7f83",
  },
  [DaoIdEnum.NOUNS]: {},
  [DaoIdEnum.SCR]: {
    Binance: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
    "Binance 2": "0x98ADeF6F2ac8572ec48965509d69A8Dd5E8BbA9D",
    OKX: "0x611f7bF868a6212f871e89F7e44684045DdFB09d",
    Bybit: "0xf89d7b9c864f589bbF53a82105107622B35EaA40",
  },
  [DaoIdEnum.COMP]: {
    Robinhood: "0x73AF3bcf944a6559933396c1577B257e2054D935",
    "Binance 1": "0xF977814e90dA44bFA03b6295A0616a897441aceC",
    "Binance 3": "0x28C6c06298d514Db089934071355E5743bf21d60",
    Kraken: "0x7DAFbA1d69F6C01AE7567Ffd7b046Ca03B706f83",
  },
  [DaoIdEnum.OBOL]: {
    "Bybit Hot Wallet": "0xA31231E727Ca53Ff95f0D00a06C645110c4aB647",
    "Binance Wallet": "0x93dEb693b170d56BdDe1B0a5222B14c0F885d976",
    "MEXC Hot Wallet": "0x9642b23Ed1E01Df1092B92641051881a322F5D4E",
  },
  [DaoIdEnum.ZK]: {
    "Binance 1": "0xf977814e90da44bfa03b6295a0616a897441acec",
    Bybit: "0xacf9a5610cb9e6ec9c84ca7429815e95b6607e9f",
    OKX1: "0x611f7bf868a6212f871e89f7e44684045ddfb09d",
    MEXC: "0xfe4931fb4deabc515f1a48b94b6b17653eeaa34f",
  },
};

// DEX addresses per DAO
export const DEXAddresses: Record<DaoIdEnum, Record<string, string>> = {
  [DaoIdEnum.UNI]: {
    Uniswap_UNI_ETH_V3_03: "0x1d42064Fc4Beb5F8aAF85F4617AE8b3b5B8Bd801",
    Uniswap_UNI_ETH_V3_1: "0x360b9726186C0F62cc719450685ce70280774Dc8",
    Sushi_UNI_ETH_V2_03: "0xDafd66636E2561b0284EDdE37e42d192F2844D40",
  },
  [DaoIdEnum.ENS]: {
    Uniswap_ENS_5: "0x92560C178cE069CC014138eD3C2F5221Ba71f58a",
  },
  [DaoIdEnum.ARB]: {},
  [DaoIdEnum.OP]: {
    "Velodrome Finance": "0x47029bc8f5CBe3b464004E87eF9c9419a48018cd",
    "Uniswap 1": "0x9a13F98Cb987694C9F086b1F5eB990EeA8264Ec3",
  },
  [DaoIdEnum.GTC]: {
    Uniswap: "0xD017617f6F0fD22796E137a8240cc38F52a147B2",
  },
  [DaoIdEnum.NOUNS]: {},
  [DaoIdEnum.SCR]: {
    "Ambient Finance": "0xaaaaAAAACB71BF2C8CaE522EA5fa455571A74106",
    SyncSwap: "0x7160570BB153Edd0Ea1775EC2b2Ac9b65F1aB61B",
  },
  [DaoIdEnum.COMP]: {
    Uniswap: "0x5598931BfBb43EEC686fa4b5b92B5152ebADC2f6",
    "Pancake Swap": "0x0392957571F28037607C14832D16f8B653eDd472",
  },
  [DaoIdEnum.OBOL]: {
    "Uniswap V3 Pool": "0x57F52C9faa6D40c5163D76b8D7dD81ddB7c95434",
  },
  [DaoIdEnum.ZK]: {
    "Pancake Swap": "0xf92b0178bc932a59d45c1c4aac81712aac6a5b61",
    Uniswap: "0x3d7264539E6e3f596bb485E3091f3Ae02Ad01ef8",
  },
};

// Lending addresses per DAO
export const LendingAddresses: Record<DaoIdEnum, Record<string, string>> = {
  [DaoIdEnum.UNI]: {
    AaveEthUni: "0xF6D2224916DDFbbab6e6bd0D1B7034f4Ae0CaB18",
    MorphoBlue: "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb",
    CompoundCUNI: "0x35A18000230DA775CAc24873d00Ff85BccdeD550",
  },
  [DaoIdEnum.ENS]: {
    AaveEthENS: "0x545bD6c032eFdde65A377A6719DEF2796C8E0f2e",
  },
  [DaoIdEnum.ARB]: {},
  [DaoIdEnum.OP]: {
    Aave: "0x513c7E3a9c69cA3e22550eF58AC1C0088e918FFf",
    Moonwell: "0x9fc345a20541Bf8773988515c5950eD69aF01847",
  },
  [DaoIdEnum.GTC]: {},
  [DaoIdEnum.NOUNS]: {},
  [DaoIdEnum.SCR]: {
    Aave: "0x25718130C2a8eb94e2e1FAFB5f1cDd4b459aCf64",
  },
  [DaoIdEnum.COMP]: {
    Compound: "0xc3d688B66703497DAA19211EEdff47f25384cdc3",
  },
  [DaoIdEnum.OBOL]: {},
  [DaoIdEnum.ZK]: {
    Aave: "0xd6cd2c0fc55936498726cacc497832052a9b2d1b",
    Venus: "0x697a70779c1a03ba2bd28b7627a902bff831b616",
  },
};

// Burning addresses per DAO
export const BurningAddresses: Record<DaoIdEnum, Record<string, string>> = {
  [DaoIdEnum.UNI]: {
    ZeroAddress: ZERO_ADDRESS,
    Dead: "0x000000000000000000000000000000000000dEaD",
    TokenContract: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
    Airdrop: "0x090D4613473dEE047c3f2706764f49E0821D256e",
  },
  [DaoIdEnum.ENS]: {
    ZeroAddress: ZERO_ADDRESS,
    Dead: "0x000000000000000000000000000000000000dEaD",
    TokenContract: "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72",
  },
  [DaoIdEnum.ARB]: {
    ZeroAddress: ZERO_ADDRESS,
    Dead: "0x000000000000000000000000000000000000dEaD",
    TokenContract: "0xB50721BCf8d664c30412Cfbc6cf7a15145234ad1",
  },
  [DaoIdEnum.OP]: {
    ZeroAddress: ZERO_ADDRESS,
    Dead: "0x000000000000000000000000000000000000dEaD",
    TokenContract: "0x4200000000000000000000000000000000000042",
  },
  [DaoIdEnum.GTC]: {
    ZeroAddress: ZERO_ADDRESS,
    Dead: "0x0000000000000000000000000000000000000000",
    TokenContract: "0xDe30da39c46104798bB5aA3fe8B9e0e1F348163F",
  },
  [DaoIdEnum.NOUNS]: {
    ZeroAddress: ZERO_ADDRESS,
    Dead: "0x0000000000000000000000000000000000000000",
    TokenContract: "0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03",
  },
  [DaoIdEnum.SCR]: {
    ZeroAddress: ZERO_ADDRESS,
    Dead: "0x0000000000000000000000000000000000000000",
    TokenContract: "0xd29687c813D741E2F938F4aC377128810E217b1b",
  },
  [DaoIdEnum.COMP]: {
    ZeroAddress: ZERO_ADDRESS,
    Dead: "0x0000000000000000000000000000000000000000",
    TokenContract: "0xc00e94Cb662C3520282E6f5717214004A7f26888",
  },
  [DaoIdEnum.OBOL]: {
    ZeroAddress: ZERO_ADDRESS,
    Dead: "0x0000000000000000000000000000000000000000",
    TokenContract: "0x0B010000b7624eb9B3DfBC279673C76E9D29D5F7",
  },
  [DaoIdEnum.ZK]: {
    ZeroAddress: ZERO_ADDRESS,
    Dead: "0x0000000000000000000000000000000000000000",
    TokenContract: "0x5A7d6b2F92C77FAD6CCaBd7EE0624E64907Eaf3E",
  },
};
