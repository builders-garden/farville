// import { trace } from "@opentelemetry/api";
// import { NextRequest, NextResponse } from "next/server";

// export function withTracingHook(
//   fn: (req: NextRequest, body: unknown) => Promise<NextResponse>
// ) {
//   return async function handler(req: NextRequest): Promise<NextResponse> {
//     console.log("=== TRACING HOOK DEBUG ===");

//     // Check what spans exist at different points
//     const initialSpan = trace.getActiveSpan();
//     console.log("Initial active span:", initialSpan?.spanContext());

//     // Read the body ONCE here
//     let body: unknown = undefined;
//     let rawBody: string | undefined = undefined;
//     const contentType = req.headers.get("content-type") || "";
//     if (["POST", "PUT", "PATCH"].includes(req.method)) {
//       if (
//         contentType.includes("application/json") ||
//         contentType.includes("text/plain")
//       ) {
//         rawBody = await req.text();
//         try {
//           body = JSON.parse(rawBody);
//         } catch (jsonErr) {
//           console.error("Failed to parse JSON body:", jsonErr);
//           body = rawBody;
//         }
//       }
//     }

//     // Execute the handler and capture the response
//     const response = await fn(req, body);

//     // Check again after handler execution
//     const finalSpan = trace.getActiveSpan();
//     console.log("Final active span:", finalSpan?.spanContext());

//     // Try to add attributes to whatever span is active
//     if (finalSpan) {
//       try {
//         finalSpan.setAttributes({
//           "custom.hook.test": "added after handler",
//           "custom.response.status": response.status,
//         });

//         // Add request body if it's a POST/PUT/PATCH
//         if (["POST", "PUT", "PATCH"].includes(req.method)) {
//           console.log("Adding request body to span");
//           await addRequestBodyToSpanFromParsed(body, contentType, finalSpan);
//         }

//         console.log(
//           "Attributes added to final span:",
//           finalSpan.spanContext().spanId
//         );
//       } catch (error) {
//         console.error("Error adding attributes to final span:", error);
//       }
//     }

//     return response;
//   };
// }

// async function addRequestBodyToSpanFromParsed(
//   body: any,
//   contentType: string,
//   span: any
// ) {
//   try {
//     let safe = {};
//     if (typeof body === "object" && body !== null) {
//       safe = filterSafeBody(body);
//     } else if (typeof body === "string") {
//       safe = { raw: body };
//     }
//     span.setAttributes({
//       "custom.request.body": JSON.stringify(safe),
//       "custom.request.content_type": contentType,
//     });
//     Object.entries(safe).forEach(([key, value]) => {
//       if (value !== null && value !== undefined) {
//         const attrValue =
//           typeof value === "object" ? JSON.stringify(value) : String(value);
//         span.setAttribute(`custom.param.${key}`, attrValue);
//       }
//     });
//   } catch (error) {
//     console.error("Error adding request body to span:", error);
//   }
// }

// function filterSafeBody(body: any): Record<string, any> {
//   if (!body || typeof body !== "object") return {};

//   const allowedKeys = ["crop", "action", "userId", "cells", "mode"];
//   return Object.fromEntries(
//     Object.entries(body).filter(([key]) => allowedKeys.includes(key))
//   );
// }

// import { context, trace } from "@opentelemetry/api";
// import { NextRequest, NextResponse } from "next/server";

// export function withTracing(
//   fn: (req: NextRequest, body: unknown) => Promise<NextResponse>
// ) {
//   return async function handler(req: NextRequest): Promise<NextResponse> {
//     const span = trace.getSpan(context.active());

//     let body: unknown = undefined;
//     if (span && req.method === "POST") {
//       try {
//         const cloned = req.clone(); // Clone before reading the body
//         body = await cloned.json();
//         const safe = filterSafeBody(body);
//         console.log("Passed request body to Signoz:", safe);
//         span.setAttribute("http.request.body", JSON.stringify(safe));
//       } catch (e) {
//         console.error("Failed to read request body:", e);
//         span.setAttribute("http.request.body", "[unreadable]");
//       }
//     }

//     return fn(req, body);
//   };
// }

// function filterSafeBody(body: unknown): Record<string, unknown> {
//   if (!body || typeof body !== "object") return {};
//   const allowedKeys = ["crop", "action", "cells", "itemSlug", "mode"]; // Customize based on your logic
//   return Object.fromEntries(
//     Object.entries(body).filter(([key]) => allowedKeys.includes(key))
//   );
// }

import { trace, context } from "@opentelemetry/api";
import { NextRequest, NextResponse } from "next/server";

export function withTracing(fn: (req: NextRequest) => Promise<NextResponse>) {
  return async function handler(req: NextRequest): Promise<NextResponse> {
    const span = trace.getSpan(context.active());

    if (span && req.method === "POST") {
      try {
        const cloned = req.clone(); // Clone before reading the body
        const json = await cloned.json();
        const safe = filterSafeBody(json);
        span.setAttribute("http.request.body", JSON.stringify(safe));
      } catch (e) {
        console.error("Failed to read request body:", e);
        span.setAttribute("http.request.body", "[unreadable]");
      }
    }

    return fn(req);
  };
}

const allowedKeys = ["crop", "action", "cells", "mode"];

function filterSafeBody(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== "object") return {};
  return Object.fromEntries(
    Object.entries(body).filter(([key]) => allowedKeys.includes(key))
  );
}
