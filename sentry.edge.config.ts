import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://e4fd7d03e7d3e8b1681c6ea61f741f7c@o4511066511114240.ingest.us.sentry.io/4511066531168256",

  tracesSampleRate: 1.0,

  enabled: process.env.NODE_ENV === "production",
});
