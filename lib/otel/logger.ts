import {
  LoggerProvider,
  BatchLogRecordProcessor,
} from "@opentelemetry/sdk-logs";
import { resourceFromAttributes } from "@opentelemetry/resources";
import pino from "pino";
import { env } from "../env";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";

// Set up OpenTelemetry Log Exporter
const resource = resourceFromAttributes({
  [ATTR_SERVICE_NAME]: "farville-manual-nextjs", // Set your service name
});

// 👇 Configure OpenTelemetry exporter for logs
const exporter = new OTLPLogExporter({
  url: `${env.SIGNOZ_TRACE_URL}/v1/logs`, // Set your own data region or set to http://localhost:4318/v1/logs if using selfhost SigNoz
  headers: { "signoz-ingestion-key": env.SIGNOZ_INGESTION_KEY }, // Set only if you are using SigNoz Cloud
});

export const loggerProvider = new LoggerProvider({
  resource,
  processors: [new BatchLogRecordProcessor(exporter)],
});

// Create a pino logger instance
export const logger = pino({
  name: "farville-app",
  level: "info",
});
