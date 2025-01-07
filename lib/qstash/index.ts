import { Client } from "@upstash/qstash";

if (!process.env.QSTASH_TOKEN) {
  throw new Error("QSTASH_TOKEN is required");
}

const qstashClient = new Client({
  token: process.env.QSTASH_TOKEN,
});

export type QStashPublishJSONRequest = {
  url: string;
  body: {
    [key: string]: string; // TODO: this will be replaced with the actual type
  };
  headers?: {
    [key: string]: string;
  };
  delay?: number | `${bigint}s` | `${bigint}m` | `${bigint}h` | `${bigint}d`; // this is a string folliwng the format "1s", "1m", "1h"
};

export const qstashPublishJSON = async (req: QStashPublishJSONRequest) => {
  const res = await qstashClient.publishJSON({
    url: req.url,
    body: req.body,
    headers: {
      ...req.headers,
      Authorization: `Bearer ${process.env.QSTASH_TOKEN}`,
    },
    delay: req.delay,
  });

  return res;
};
