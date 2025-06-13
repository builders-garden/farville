import { env } from "./env";

export interface DaimoPayment {
  id: string;
  status: string;
  createdAt: string;
  display: {
    intent: string;
    paymentValue: string;
    currency: string;
  };
  source: {
    payerAddress: string;
    txHash: string;
    chainId: string;
    amountUnits: string;
    tokenSymbol: string;
    tokenAddress: string;
  };
  destination: {
    destinationAddress: string;
    txHash: string;
    chainId: string;
    amountUnits: string;
    tokenSymbol: string;
    tokenAddress: string;
    calldata: string;
  };
  externalId: string;
  metadata: {
    mySystemId: string;
    name: string;
  };
}

export const fetchDaimoPayment = async (id: string): Promise<DaimoPayment> => {
  const response = await fetch(`https://pay.daimo.com/api/payment/${id}`, {
    headers: {
      "Api-Key": env.DAIMO_PAY_API_KEY,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Failed to fetch payment from Daimo: ${JSON.stringify(errorData)}`
    );
  }

  const data = (await response.json()) as DaimoPayment;

  if (!data) {
    throw new Error("No payment found in Daimo response");
  }

  return data;
};
