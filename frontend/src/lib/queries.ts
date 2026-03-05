import { gql } from "urql";

// ── Dashboard Stats ──
export const GLOBAL_STATS_QUERY = gql`
  query GlobalStats {
    Orderbook(limit: 1) {
      id
      tradesQuantity
      buysQuantity
      sellsQuantity
      collateralVolume
      scaledCollateralVolume
      collateralBuyVolume
      collateralSellVolume
    }
    OrdersMatchedGlobal(limit: 1) {
      id
      tradesQuantity
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

// ── Recent Order Fills (indexed by timestamp) ──
export const RECENT_ORDER_FILLS_QUERY = gql`
  query RecentOrderFills($limit: Int!, $offset: Int) {
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

// ── Orders Matched (indexed by timestamp) ──
export const RECENT_ORDERS_MATCHED_QUERY = gql`
  query RecentOrdersMatched($limit: Int!) {
    OrdersMatchedEvent(order_by: { timestamp: desc }, limit: $limit) {
      id
      timestamp
      makerAssetID
      takerAssetID
      makerAmountFilled
      takerAmountFilled
    }
  }
`;

// ── Markets (Sports Oracle) ──
export const MARKETS_QUERY = gql`
  query Markets($limit: Int!, $offset: Int, $state: String) {
    Market(
      limit: $limit
      offset: $offset
      where: { state: { _eq: $state } }
      order_by: { id: asc }
    ) {
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

export const ALL_MARKETS_QUERY = gql`
  query AllMarkets($limit: Int!, $offset: Int) {
    Market(limit: $limit, offset: $offset, order_by: { id: asc }) {
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

export const GAMES_QUERY = gql`
  query Games($limit: Int!, $state: String) {
    Game(limit: $limit, where: { state: { _eq: $state } }, order_by: { id: asc }) {
      id
      ancillaryData
      ordering
      state
      homeScore
      awayScore
    }
  }
`;

export const ALL_GAMES_QUERY = gql`
  query AllGames($limit: Int!) {
    Game(limit: $limit, order_by: { id: asc }) {
      id
      ancillaryData
      ordering
      state
      homeScore
      awayScore
    }
  }
`;

// ── FPMM Markets ──
export const FPMM_MARKETS_QUERY = gql`
  query FPMMMarkets($limit: Int!, $offset: Int) {
    FixedProductMarketMaker(limit: $limit, offset: $offset) {
      id
      creator
      creationTimestamp
      collateralToken
      conditions
      fee
      tradesQuantity
      buysQuantity
      sellsQuantity
      collateralVolume
      scaledCollateralVolume
      scaledCollateralBuyVolume
      scaledCollateralSellVolume
      scaledFeeVolume
      scaledLiquidityParameter
      outcomeTokenAmounts
      outcomeTokenPrices
      outcomeSlotCount
      lastActiveDay
      totalSupply
    }
  }
`;

export const FPMM_MARKET_DETAIL_QUERY = gql`
  query FPMMMarketDetail($id: ID!) {
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
      scaledCollateralBuyVolume
      scaledCollateralSellVolume
      scaledFeeVolume
      scaledLiquidityParameter
      outcomeTokenAmounts
      outcomeTokenPrices
      outcomeSlotCount
      lastActiveDay
      totalSupply
    }
  }
`;

// ── FPMM Transactions (indexed by timestamp, market_id, user) ──
export const FPMM_TRANSACTIONS_QUERY = gql`
  query FPMMTransactions($limit: Int!, $market_id: String) {
    FpmmTransaction(
      order_by: { timestamp: desc }
      limit: $limit
      where: { market_id: { _eq: $market_id } }
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

// ── Wallet Queries ──
export const WALLET_BY_SIGNER_QUERY = gql`
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

export const USER_POSITIONS_QUERY = gql`
  query UserPositions($user: String!, $limit: Int!) {
    UserPosition(where: { user: { _eq: $user } }, limit: $limit) {
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

// ── Activity Feed (splits, merges, redemptions indexed by timestamp) ──
export const RECENT_SPLITS_QUERY = gql`
  query RecentSplits($limit: Int!) {
    Split(order_by: { timestamp: desc }, limit: $limit) {
      id
      timestamp
      stakeholder
      condition
      amount
    }
  }
`;

export const RECENT_MERGES_QUERY = gql`
  query RecentMerges($limit: Int!) {
    Merge(order_by: { timestamp: desc }, limit: $limit) {
      id
      timestamp
      stakeholder
      condition
      amount
    }
  }
`;

export const RECENT_REDEMPTIONS_QUERY = gql`
  query RecentRedemptions($limit: Int!) {
    Redemption(order_by: { timestamp: desc }, limit: $limit) {
      id
      timestamp
      redeemer
      condition
      payout
    }
  }
`;

export const RECENT_CONVERSIONS_QUERY = gql`
  query RecentConversions($limit: Int!) {
    NegRiskConversion(order_by: { timestamp: desc }, limit: $limit) {
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

// ── Wallet Activity ──
export const WALLET_FILLS_QUERY = gql`
  query WalletFills($address: String!, $limit: Int!) {
    maker: OrderFilledEvent(
      where: { maker: { _eq: $address } }
      order_by: { timestamp: desc }
      limit: $limit
    ) {
      id
      timestamp
      orderHash
      maker
      taker
      makerAmountFilled
      takerAmountFilled
      fee
    }
    taker: OrderFilledEvent(
      where: { taker: { _eq: $address } }
      order_by: { timestamp: desc }
      limit: $limit
    ) {
      id
      timestamp
      orderHash
      maker
      taker
      makerAmountFilled
      takerAmountFilled
      fee
    }
  }
`;

export const WALLET_FPMM_TXNS_QUERY = gql`
  query WalletFpmmTxns($user: String!, $limit: Int!) {
    FpmmTransaction(
      where: { user: { _eq: $user } }
      order_by: { timestamp: desc }
      limit: $limit
    ) {
      id
      type
      timestamp
      market_id
      tradeAmount
      feeAmount
      outcomeIndex
      outcomeTokensAmount
    }
  }
`;

// ── Fee Refunds ──
export const FEE_REFUNDS_QUERY = gql`
  query FeeRefunds($limit: Int!) {
    FeeRefunded(order_by: { id: desc }, limit: $limit) {
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

// ── Conditions ──
export const CONDITIONS_QUERY = gql`
  query Conditions($limit: Int!) {
    Condition(limit: $limit) {
      id
      positionIds
      payoutNumerators
      payoutDenominator
    }
  }
`;

// ── Market Open Interest ──
export const MARKET_OPEN_INTEREST_QUERY = gql`
  query MarketOpenInterest($id: ID!) {
    MarketOpenInterest_by_pk(id: $id) {
      id
      amount
    }
  }
`;

// ── NegRisk Events ──
export const NEG_RISK_EVENTS_QUERY = gql`
  query NegRiskEvents($limit: Int!) {
    NegRiskEvent(limit: $limit) {
      id
      feeBps
      questionCount
    }
  }
`;

// ── Positions by Condition ──
export const POSITIONS_BY_CONDITION_QUERY = gql`
  query PositionsByCondition($condition: String!) {
    Position(where: { condition: { _eq: $condition } }) {
      id
      condition
      outcomeIndex
    }
  }
`;
