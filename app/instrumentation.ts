// ============================================================================
// Next.js Instrumentation — Server Startup Hook
// ============================================================================
// What: Runs once when a new Node.js server instance starts
// Why: Initialize background services (workflow engine) that need to run
//      for the lifetime of the server process
// How: Next.js calls register() automatically on server boot
//
// Only runs in Node.js runtime (not Edge) since BullMQ requires Node APIs

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initWorkflowEngine } = await import('./lib/workflow-engine');
    initWorkflowEngine();
  }
}
