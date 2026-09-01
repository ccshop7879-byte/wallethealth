import { NextResponse } from "next/server";

const BSC_CHAIN_ID = "0x38";
const DEFAULT_BSC_RPC_URL = "https://bsc-dataseed.binance.org";
const BSC_USDT_CONTRACT = "0x55d398326f99059fF775485246999027B3197955";
const ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/;

type JsonRpcResponse<T> = {
  result?: T;
  error?: {
    code: number;
    message: string;
  };
};

function isValidAddress(value: unknown): value is string {
  return typeof value === "string" && ADDRESS_PATTERN.test(value);
}

async function callBscRpc<T>(method: string, params: unknown[]): Promise<T> {
  const rpcUrl = process.env.BSC_RPC_URL || DEFAULT_BSC_RPC_URL;
  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method,
      params,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`BSC RPC request failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as JsonRpcResponse<T>;
  if (payload.error) {
    throw new Error(`BSC RPC error ${payload.error.code}: ${payload.error.message}`);
  }
  if (payload.result === undefined) {
    throw new Error("BSC RPC returned no result.");
  }

  return payload.result;
}

function formatUnits(value: bigint, decimals: number): string {
  const divisor = BigInt(10) ** BigInt(decimals);
  const whole = value / divisor;
  const fraction = (value % divisor).toString().padStart(decimals, "0").replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : whole.toString();
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const address =
    typeof body === "object" && body !== null && "address" in body
      ? (body as { address?: unknown }).address
      : undefined;

  if (!isValidAddress(address)) {
    return NextResponse.json(
      { error: "A valid EVM wallet address is required." },
      { status: 400 },
    );
  }

  const paddedAddress = address.slice(2).toLowerCase().padStart(64, "0");
  const balanceOfCall = `0x70a08231${paddedAddress}`;

  try {
    const [chainId, bnbBalance, usdtBalance] = await Promise.all([
      callBscRpc<string>("eth_chainId", []),
      callBscRpc<string>("eth_getBalance", [address, "latest"]),
      callBscRpc<string>("eth_call", [
        { to: BSC_USDT_CONTRACT, data: balanceOfCall },
        "latest",
      ]),
    ]);

    if (chainId.toLowerCase() !== BSC_CHAIN_ID) {
      throw new Error(`Configured RPC returned chain ${chainId}, expected BNB Smart Chain (${BSC_CHAIN_ID}).`);
    }

    return NextResponse.json({
      chainId: BSC_CHAIN_ID,
      network: "BNB Smart Chain",
      address,
      balances: {
        bnb: formatUnits(BigInt(bnbBalance), 18),
        usdt: formatUnits(BigInt(usdtBalance), 18),
      },
      token: {
        symbol: "USDT",
        contract: BSC_USDT_CONTRACT,
        decimals: 18,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to read BSC balances.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
