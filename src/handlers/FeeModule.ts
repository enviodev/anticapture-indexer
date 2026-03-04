import { FeeModule } from "generated";
import { NEG_RISK_FEE_MODULE } from "../utils/constants.js";
import { isExcludedAddress, getOrCreateTraderProfile } from "../utils/trader.js";

FeeModule.FeeRefunded.handler(async ({ event, context }) => {
  const negRisk =
    event.srcAddress.toLowerCase() === NEG_RISK_FEE_MODULE.toLowerCase();

  context.FeeRefunded.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    orderHash: event.params.orderHash,
    tokenId: event.params.id.toString(),
    timestamp: BigInt(event.block.timestamp),
    refundee: event.params.to,
    feeRefunded: event.params.refund,
    feeCharged: event.params.feeCharged,
    negRisk,
  });

  // Wrapped: Increment fee refund counter on trader profile
  const refundee = event.params.to;
  if (!isExcludedAddress(refundee)) {
    const profile = await getOrCreateTraderProfile(context, refundee);
    context.TraderProfile.set({
      ...profile,
      totalFeeRefunds: profile.totalFeeRefunds + 1n,
    });
  }
});
