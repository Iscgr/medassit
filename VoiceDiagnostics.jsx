export function recordInit() {
  const now = Date.now();
  const diag = (window.__voiceDiag = window.__voiceDiag || {
    inits: [],
    cleanups: [],
    warnings: [],
  });
  diag.inits.push(now);
  prune(diag);
  maybeWarn(diag);
}

export function recordCleanup() {
  const now = Date.now();
  const diag = (window.__voiceDiag = window.__voiceDiag || {
    inits: [],
    cleanups: [],
    warnings: [],
  });
  diag.cleanups.push(now);
  prune(diag);
  maybeWarn(diag);
}

export function getStats() {
  const diag = window.__voiceDiag || { inits: [], cleanups: [], warnings: [] };
  return {
    initCount: diag.inits.length,
    cleanupCount: diag.cleanups.length,
    lastInit: diag.inits[diag.inits.length - 1] || null,
    lastCleanup: diag.cleanups[diag.cleanups.length - 1] || null,
    warnings: diag.warnings.slice(-5),
  };
}

function prune(diag) {
  const cutoff = Date.now() - 60_000; // last 60s
  diag.inits = diag.inits.filter((t) => t >= cutoff);
  diag.cleanups = diag.cleanups.filter((t) => t >= cutoff);
}

function maybeWarn(diag) {
  // if more than 4 init/cleanup operations in 10s => warn (possible mount churn)
  const windowMs = 10_000;
  const now = Date.now();
  const churn = [...diag.inits, ...diag.cleanups].filter((t) => now - t <= windowMs).length;
  if (churn >= 4) {
    const msg = `[VoiceDiagnostics] High churn detected: ${churn} init/cleanup events in last ${windowMs / 1000}s`;
    if (!diag.warnings.includes(msg)) {
      diag.warnings.push(msg);
      // eslint-disable-next-line no-console
      console.warn(msg);
    }
  }
}