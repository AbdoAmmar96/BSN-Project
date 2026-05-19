/**
 * Sentry init — optional. Becomes a no-op unless:
 *   1. `@sentry/react` is installed   (npm i @sentry/react)
 *   2. `VITE_SENTRY_DSN` is set in `.env`
 *
 * That way the project builds and runs without Sentry, and lighting it up
 * later is just `npm i` + setting the env var.
 */

export async function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;

  try {
    // Indirect specifier so Vite/Rollup don't try to resolve it at build time
    // when the package isn't installed. The bundler only complains about
    // *static* import targets it can't find.
    const pkg = /* @vite-ignore */ '@sentry/react';
    const Sentry = await import(/* @vite-ignore */ pkg);
    Sentry.init({
      dsn,
      environment: import.meta.env.MODE,
      release: import.meta.env.VITE_APP_VERSION || 'bsn@local',
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 1.0,
    });
  } catch (err) {
    // package not installed — silently skip
    if (import.meta.env.DEV) {
      console.warn('[sentry] DSN set but @sentry/react is not installed. Run `npm i @sentry/react` to enable.');
    }
  }
}
