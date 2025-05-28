"use strict";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import {
  ParentBasedSampler,
  TraceIdRatioBasedSampler,
} from "@opentelemetry/sdk-trace-node";
import { NodeSDK } from "@opentelemetry/sdk-node";

import process from "process";
import { env } from "@/lib/env";

// Add otel logging when debugging
import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

const traceExporter = new OTLPTraceExporter({
  url: env.SIGNOZ_TRACE_URL, // Set your own data region https://ingest.[region].signoz.cloud:443/v1/traces or set to http://localhost:4318/v1/traces if using selfhost SigNoz
  headers: {
    "signoz-access-token": env.SIGNOZ_INGESTION_KEY,
    "signoz-ingestion-key": env.SIGNOZ_INGESTION_KEY,
  },
});
const sampler = new ParentBasedSampler({
  root: new TraceIdRatioBasedSampler(0.1), // Sample 10% of traces
});
const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: "farville",
  }),
  instrumentations: [getNodeAutoInstrumentations()],
  sampler,
  traceExporter,
});

// initialize the SDK and register with the OpenTelemetry API
// this enables the API to record telemetry
sdk.start();

// gracefully shut down the SDK on process exit
process.on("SIGTERM", () => {
  sdk
    .shutdown()
    .then(() => console.log("Tracing terminated"))
    .catch((error) => console.log("Error terminating tracing", error))
    .finally(() => process.exit(0));
});
