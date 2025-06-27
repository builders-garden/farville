import { registerOTel, OTLPHttpJsonTraceExporter } from "@vercel/otel";
import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";
import { env } from "@/lib/env";

export function register() {
  // Skip OTEL registration in development mode
  if (env.NEXT_PUBLIC_APP_ENV === "development") {
    console.log("OTEL instrumentation skipped in development mode");
    return;
  }

  // Add otel logging only in production
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR); // set diaglog level to DEBUG when debugging

  registerOTel({
    serviceName: env.OTEL_SERVICE_NAME,
    traceExporter: new OTLPHttpJsonTraceExporter({
      url: `${env.SIGNOZ_TRACE_URL}/v1/traces`, // Set your own data region or set to http://localhost:4318/v1/traces if using self hosted SigNoz
      // headers: { "signoz-ingestion-key": env.SIGNOZ_INGESTION_KEY }, // Set only if you are using SigNoz Cloud
    }),
  });
}
