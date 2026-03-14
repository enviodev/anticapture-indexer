import { NounsAuction } from "generated";
import { truncateTimestampToMidnight } from "../lib/utils";

// ============================================================
// AuctionSettled - Records Noun price from auction
// ============================================================
NounsAuction.AuctionSettled.handler(async ({ event, context }) => {
  const timestamp = truncateTimestampToMidnight(Number(event.block.timestamp));
  const timestampStr = timestamp.toString();

  context.TokenPrice.set({
    id: timestampStr,
    price: event.params.amount,
    timestamp: BigInt(timestamp),
  });
});
