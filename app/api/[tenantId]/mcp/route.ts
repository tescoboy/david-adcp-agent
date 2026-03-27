export const dynamic = 'force-dynamic';

import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { queryTenant } from '@/lib/db';
import { createMcpServer } from '@/lib/mcp';

async function handleMcpRequest(
  req: Request,
  params: { tenantId: string }
): Promise<Response> {
  const { tenantId } = params;

  // Verify tenant exists
  const tenant = await queryTenant(tenantId);
  if (!tenant) {
    return new Response(JSON.stringify({ error: 'Tenant not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Log request body for debugging (clone so transport can still read it)
  const bodyText = await req.clone().text().catch(() => '');
  console.log('[MCP]', req.method, tenantId, bodyText);

  // Deep-log update_media_buy arguments before SDK touches them
  try {
    const parsed = JSON.parse(bodyText);
    if (parsed?.params?.name === 'update_media_buy') {
      console.log('[PRE-ZOD update_media_buy]', JSON.stringify(parsed.params.arguments, null, 2));
    }
  } catch {}

  const server = createMcpServer(tenantId);
  // Stateless mode: sessionIdGenerator is undefined so no session tracking
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  await server.connect(transport);
  return transport.handleRequest(req);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  return handleMcpRequest(req, await params);
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  return handleMcpRequest(req, await params);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  return handleMcpRequest(req, await params);
}
