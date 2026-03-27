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
