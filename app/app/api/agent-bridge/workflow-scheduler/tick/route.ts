// Canonical workflow-scheduler route. The original Hermes-named route remains
// as a compatibility alias for already-configured signed workers.
import { POST as legacyPost } from '@/app/api/agent-bridge/hermes-scheduler/tick/route';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // The delegated handler performs verifySignedAgentBridgeRequest(request, signingPath)
  // before it reaches the service-role-only schedule RPC.
  return legacyPost(request);
}
