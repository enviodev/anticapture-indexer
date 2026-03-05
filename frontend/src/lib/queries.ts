import { gql } from "graphql-request";

// ============================================================
// Dashboard / Global Stats
// ============================================================

export const GLOBAL_STATS = gql`
  query GlobalStats {
    Orderbook(limit: 1) {
      id
      tradesQuantity
      buysQuantity
      sellsQuantity
      collateralVolume
      scaledCollateralVolume
      collateralBuyVolume
      scaledCollateralBuyVolume
      collateralSellVolume
      scaledCollateralSellVolume
    }
    OrdersMatchedGlobal(limit: 1) {
      id
      tradesQuantity
      buysQuantity
      sellsQuantity
      collateralVolume
      scaledCollateralVolume
    }
    GlobalOpenInterest(limit: 1) {
      id
      amount
    }
    GlobalUSDCBalance(limit: 1) {
      id
      balance
    }
  }
`;

// ============================================================
// Recent Order Fills (indexed on timestamp)
// ============================================================

export const RECENT_ORDER_FILLS = gql`
  query RecentOrderFills($limit: Int!, $offset: Int!) {
    OrderFilledEvent(order_by: { timestamp: desc }, limit: $limit, offset: $offset) {
      id
      transactionHash
      timestamp
      orderHash
      maker
      taker
      makerAssetId
      takerAssetId
      makerAmountFilled
      takerAmountFilled
      fee
    }
  }
`;

export const ORDER_FILLS_BY_MAKER = gql`
  query OrderFillsByMaker($maker: String!, $limit: Int!, $offset: Int!) {
    OrderFilledEvent(
      where: { maker: { _eq: $maker } }
      order_by: { timestamp: desc }
      limit: $limit
      offset: $offset
    ) {
      id
      transactionHash
      timestamp
      orderHash
      maker
      taker
      makerAssetId
      takerAssetId
      makerAmountFilled
      takerAmountFilled
      fee
    }
  }
`;

export const ORDER_FILLS_BY_TAKER = gql`
  query OrderFillsByTaker($taker: String!, $limit: Int!, $offset: Int!) {
    OrderFilledEvent(
      where: { taker: { _eq: $taker } }
      order_by: { timestamp: desc }
      limit: $limit
      offset: $offset
    ) {
      id
      transactionHash
      timestamp
      orderHash
      maker
      taker
      makerAssetId
      takerAssetId
      makerAmountFilled
      takerAmountFilled
      fee
    }
  }
`;

// ============================================================
// Orders Matched Events
// ============================================================

export const RECENT_ORDERS_MATCHED = gql`
  query RecentOrdersMatched($limit: Int!, $offset: Int!) {
    OrdersMatchedEvent(order_by: { timestamp: desc }, limit: $limit, offset: $offset) {
      id
      timestamp
      makerAssetID
      takerAssetID
      makerAmountFilled
      takerAmountFilled
    }
  }
`;

// ============================================================
// Sports Oracle: Games & Markets
// ============================================================

export const GAMES_LIST = gql`
  query GamesList($limit: Int!, $offset: Int!, $state: String) {
    Game(
      where: { state: { _eq: $state } }
      limit: $limit
      offset: $offset
    ) {
      id
      ancillaryData
      ordering
      state
      homeScore
      awayScore
    }
  }
`;

export const GAMES_ALL = gql`
  query GamesAll($limit: Int!, $offset: Int!) {
    Game(limit: $limit, offset: $offset) {
      id
      ancillaryData
      ordering
      state
      homeScore
      awayScore
    }
  }
`;

export const MARKETS_BY_GAME = gql`
  query MarketsByGame($gameId: String!) {
    Market(where: { gameId: { _eq: $gameId } }) {
      id
      gameId
      state
      marketType
      underdog
      line
      payouts
    }
  }
`;

export const MARKETS_BY_STATE = gql`
  query MarketsByState($state: String!, $limit: Int!, $offset: Int!) {
    Market(where: { state: { _eq: $state } }, limit: $limit, offset: $offset) {
      id
      gameId
      state
      marketType
      underdog
      line
      payouts
    }
  }
`;

// ============================================================
// Wallets
// ============================================================

export const WALLET_BY_SIGNER = gql`
  query WalletBySigner($signer: String!) {
    Wallet(where: { signer: { _eq: $signer } }) {
      id
      signer
      type
      balance
      lastTransfer
      createdAt
    }
  }
`;

// ============================================================
// Activity: Splits, Merges, Redemptions
// ============================================================

export const RECENT_SPLITS = gql`
  query RecentSplits($limit: Int!, $offset: Int!) {
    Split(order_by: { timestamp: desc }, limit: $limit, offset: $offset) {
      id
      timestamp
      stakeholder
      condition
      amount
    }
  }
`;

export const RECENT_MERGES = gql`
  query RecentMerges($limit: Int!, $offset: Int!) {
    Merge(order_by: { timestamp: desc }, limit: $limit, offset: $offset) {
      id
      timestamp
      stakeholder
      condition
      amount
    }
  }
`;

export const RECENT_REDEMPTIONS = gql`
  query RecentRedemptions($limit: Int!, $offset: Int!) {
    Redemption(order_by: { timestamp: desc }, limit: $limit, offset: $offset) {
      id
      timestamp
      redeemer
      condition
      indexSets
      payout
    }
  }
`;

export const SPLITS_BY_STAKEHOLDER = gql`
  query SplitsByStakeholder($stakeholder: String!, $limit: Int!, $offset: Int!) {
    Split(
      where: { stakeholder: { _eq: $stakeholder } }
      order_by: { timestamp: desc }
      limit: $limit
      offset: $offset
    ) {
      id
      timestamp
      stakeholder
      condition
      amount
    }
  }
`;

export const SPLITS_BY_CONDITION = gql`
  query SplitsByCondition($condition: String!, $limit: Int!, $offset: Int!) {
    Split(
      where: { condition: { _eq: $condition } }
      order_by: { timestamp: desc }
      limit: $limit
      offset: $offset
    ) {
      id
      timestamp
      stakeholder
      condition
      amount
    }
  }
`;

// ============================================================
// Neg Risk Conversions
// ============================================================

export const RECENT_CONVERSIONS = gql`
  query RecentConversions($limit: Int!, $offset: Int!) {
    NegRiskConversion(order_by: { timestamp: desc }, limit: $limit, offset: $offset) {
      id
      timestamp
      stakeholder
      negRiskMarketId
      amount
      indexSet
      questionCount
    }
  }
`;

// ============================================================
// User Positions (PnL)
// ============================================================

export const POSITIONS_BY_USER = gql`
  query PositionsByUser($user: String!, $limit: Int!, $offset: Int!) {
    UserPosition(
      where: { user: { _eq: $user } }
      limit: $limit
      offset: $offset
    ) {
      id
      user
      tokenId
      amount
      avgPrice
      realizedPnl
      totalBought
    }
  }
`;

// ============================================================
// FPMM Data
// ============================================================

export const RECENT_FPMM_TRANSACTIONS = gql`
  query RecentFpmmTransactions($limit: Int!, $offset: Int!) {
    FpmmTransaction(order_by: { timestamp: desc }, limit: $limit, offset: $offset) {
      id
      type
      timestamp
      market_id
      user
      tradeAmount
      feeAmount
      outcomeIndex
      outcomeTokensAmount
    }
  }
`;

export const FPMM_TRANSACTIONS_BY_MARKET = gql`
  query FpmmTransactionsByMarket($marketId: String!, $limit: Int!, $offset: Int!) {
    FpmmTransaction(
      where: { market_id: { _eq: $marketId } }
      order_by: { timestamp: desc }
      limit: $limit
      offset: $offset
    ) {
      id
      type
      timestamp
      market_id
      user
      tradeAmount
      feeAmount
      outcomeIndex
      outcomeTokensAmount
    }
  }
`;

export const FPMM_TRANSACTIONS_BY_USER = gql`
  query FpmmTransactionsByUser($user: String!, $limit: Int!, $offset: Int!) {
    FpmmTransaction(
      where: { user: { _eq: $user } }
      order_by: { timestamp: desc }
      limit: $limit
      offset: $offset
    ) {
      id
      type
      timestamp
      market_id
      user
      tradeAmount
      feeAmount
      outcomeIndex
      outcomeTokensAmount
    }
  }
`;

// ============================================================
// FPMM Pool Data
// ============================================================

export const FPMM_FUNDING_BY_POOL = gql`
  query FpmmFundingByPool($fpmmId: String!, $limit: Int!, $offset: Int!) {
    FpmmFundingAddition(
      where: { fpmm_id: { _eq: $fpmmId } }
      order_by: { timestamp: desc }
      limit: $limit
      offset: $offset
    ) {
      id
      timestamp
      fpmm_id
      funder
      amountsAdded
      amountsRefunded
      sharesMinted
    }
    FpmmFundingRemoval(
      where: { fpmm_id: { _eq: $fpmmId } }
      order_by: { timestamp: desc }
      limit: $limit
      offset: $offset
    ) {
      id
      timestamp
      fpmm_id
      funder
      amountsRemoved
      collateralRemoved
      sharesBurnt
    }
  }
`;

export const POOL_MEMBERSHIPS_BY_POOL = gql`
  query PoolMembershipsByPool($poolId: String!, $limit: Int!, $offset: Int!) {
    FpmmPoolMembership(
      where: { pool_id: { _eq: $poolId } }
      limit: $limit
      offset: $offset
    ) {
      id
      pool_id
      funder
      amount
    }
  }
`;

export const POOL_MEMBERSHIPS_BY_FUNDER = gql`
  query PoolMembershipsByFunder($funder: String!, $limit: Int!, $offset: Int!) {
    FpmmPoolMembership(
      where: { funder: { _eq: $funder } }
      limit: $limit
      offset: $offset
    ) {
      id
      pool_id
      funder
      amount
    }
  }
`;

// ============================================================
// Fee Refunds
// ============================================================

export const RECENT_FEE_REFUNDS = gql`
  query RecentFeeRefunds($limit: Int!, $offset: Int!) {
    FeeRefunded(limit: $limit, offset: $offset) {
      id
      orderHash
      tokenId
      timestamp
      refundee
      feeRefunded
      feeCharged
      negRisk
    }
  }
`;

export const FEE_REFUNDS_BY_REFUNDEE = gql`
  query FeeRefundsByRefundee($refundee: String!, $limit: Int!, $offset: Int!) {
    FeeRefunded(
      where: { refundee: { _eq: $refundee } }
      limit: $limit
      offset: $offset
    ) {
      id
      orderHash
      tokenId
      timestamp
      refundee
      feeRefunded
      feeCharged
      negRisk
    }
  }
`;

// ============================================================
// Market Data & Conditions
// ============================================================

export const MARKET_DATA_BY_CONDITION = gql`
  query MarketDataByCondition($condition: String!) {
    MarketData(where: { condition: { _eq: $condition } }) {
      id
      condition
      outcomeIndex
    }
  }
`;

export const CONDITION_BY_ID = gql`
  query ConditionById($id: String!) {
    Condition_by_pk(id: $id) {
      id
      positionIds
      payoutNumerators
      payoutDenominator
    }
  }
`;

export const POSITIONS_BY_CONDITION = gql`
  query PositionsByCondition($condition: String!, $limit: Int!) {
    Position(where: { condition: { _eq: $condition } }, limit: $limit) {
      id
      condition
      outcomeIndex
    }
  }
`;

// ============================================================
// Open Interest
// ============================================================

export const NEG_RISK_EVENTS = gql`
  query NegRiskEvents($limit: Int!) {
    NegRiskEvent(limit: $limit) {
      id
      feeBps
      questionCount
    }
  }
`;

// ============================================================
// FPMMs (Fixed Product Market Makers)
// ============================================================

export const FPMM_LIST = gql`
  query FpmmList($limit: Int!, $offset: Int!) {
    FixedProductMarketMaker(limit: $limit, offset: $offset) {
      id
      creator
      creationTimestamp
      fee
      tradesQuantity
      buysQuantity
      sellsQuantity
      collateralVolume
      scaledCollateralVolume
      liquidityParameter
      scaledLiquidityParameter
      outcomeTokenPrices
      outcomeSlotCount
      lastActiveDay
      totalSupply
    }
  }
`;

export const FPMM_DETAIL = gql`
  query FpmmDetail($id: String!) {
    FixedProductMarketMaker_by_pk(id: $id) {
      id
      creator
      creationTimestamp
      creationTransactionHash
      collateralToken
      conditionalTokenAddress
      conditions
      fee
      tradesQuantity
      buysQuantity
      sellsQuantity
      liquidityAddQuantity
      liquidityRemoveQuantity
      collateralVolume
      scaledCollateralVolume
      collateralBuyVolume
      scaledCollateralBuyVolume
      collateralSellVolume
      scaledCollateralSellVolume
      feeVolume
      scaledFeeVolume
      liquidityParameter
      scaledLiquidityParameter
      outcomeTokenAmounts
      outcomeTokenPrices
      outcomeSlotCount
      lastActiveDay
      totalSupply
    }
  }
`;
