import { registerOTel, OTLPHttpJsonTraceExporter } from "@vercel/otel";
// Add otel logging
import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR); // set diaglog level to DEBUG when debugging

import { env } from "@/lib/env";

export function register() {
  registerOTel({
    serviceName: "farville-nextjs",
    traceExporter: new OTLPHttpJsonTraceExporter({
      url: `${env.SIGNOZ_TRACE_URL}/v1/traces`, // Set your own data region or set to http://localhost:4318/v1/traces if using selfhost SigNoz
      headers: { "signoz-ingestion-key": env.SIGNOZ_INGESTION_KEY }, // Set only if you are using SigNoz Cloud
    }),
  });
}
