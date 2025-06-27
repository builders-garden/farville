import {
  LoggerProvider,
  BatchLogRecordProcessor,
} from "@opentelemetry/sdk-logs";
import { resourceFromAttributes } from "@opentelemetry/resources";
import pino from "pino";
import { env } from "../env";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";

// Conditionally set up OpenTelemetry Log Exporter only in production
let loggerProvider: LoggerProvider | null = null;

if (env.NEXT_PUBLIC_APP_ENV !== "development") {
  // Set up OpenTelemetry Log Exporter for production
  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: `${env.OTEL_SERVICE_NAME}-manual`,
  });

  // 👇 Configure OpenTelemetry exporter for logs
  const exporter = new OTLPLogExporter({
    url: `${env.SIGNOZ_TRACE_URL}/v1/logs`, // Set your own data region or set to http://localhost:4318/v1/logs if using selfhost SigNoz
    // headers: { "signoz-ingestion-key": env.SIGNOZ_INGESTION_KEY }, // Set only if you are using SigNoz Cloud
  });

  loggerProvider = new LoggerProvider({
    resource,
    processors: [new BatchLogRecordProcessor(exporter)],
  });
} else {
  console.log("OTEL logger provider skipped in development mode");
}

export { loggerProvider };

// Create a pino logger instance
const logger = pino({
  name: "farville-app",
  level: "info",
});

// Logger class for project-wide logging
// Use types compatible with OpenTelemetry AnyValueMap
export type LogAttributes = Record<
  string,
  string | number | boolean | null | undefined
>;

class Logger {
  static otelLogger = loggerProvider?.getLogger("farville") || null;

  static info(message: string, attributes: LogAttributes = {}) {
    // Only emit to OTEL if logger provider is available (production mode)
    if (this.otelLogger) {
      this.otelLogger.emit({
        body: message,
        severityText: "INFO",
        attributes,
      });
    }
    logger.info({ ...attributes, msg: message });
  }

  static warn(message: string, attributes: LogAttributes = {}) {
    // Only emit to OTEL if logger provider is available (production mode)
    if (this.otelLogger) {
      this.otelLogger.emit({
        body: message,
        severityText: "WARN",
        attributes,
      });
    }
    logger.warn({ ...attributes, msg: message });
  }

  static error(message: string, attributes: LogAttributes = {}) {
    // Only emit to OTEL if logger provider is available (production mode)
    if (this.otelLogger) {
      this.otelLogger.emit({
        body: message,
        severityText: "ERROR",
        attributes,
      });
    }
    logger.error({ ...attributes, msg: message });
  }

  static debug(message: string, attributes: LogAttributes = {}) {
    // Only emit to OTEL if logger provider is available (production mode)
    if (this.otelLogger) {
      this.otelLogger.emit({
        body: message,
        severityText: "DEBUG",
        attributes,
      });
    }
    logger.debug({ ...attributes, msg: message });
  }

  // For backward compatibility with logTest
  static logTest(message: string, attributes: LogAttributes = {}) {
    this.info(message, attributes);
  }
}

export default Logger;
