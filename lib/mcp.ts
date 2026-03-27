import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { handleGetAdcpCapabilities } from './tools/get_adcp_capabilities';
import { handleGetProducts } from './tools/get_products';
import { handleCreateMediaBuy } from './tools/create_media_buy';
import { handleGetMediaBuy } from './tools/get_media_buy';
import { handleUpdateMediaBuy } from './tools/update_media_buy';

export function createMcpServer(tenantId: string): McpServer {
  const server = new McpServer({
    name: 'adcp-sales-agent',
    version: '1.0.0',
  });

  // get_adcp_capabilities — no input
  server.registerTool(
    'get_adcp_capabilities',
    { description: 'Returns AdCP capabilities for this seller' },
    async () => handleGetAdcpCapabilities()
  );

  // get_products — optional brief and buying_mode
  server.registerTool(
    'get_products',
    {
      description: 'Returns available advertising products',
      inputSchema: {
        buying_mode: z.enum(['brief', 'wholesale', 'refine']).optional(),
        brief: z.string().optional().nullable(),
      },
    },
    async () => handleGetProducts(tenantId)
  );

  // create_media_buy
  const packageRequestSchema = z.object({
    product_id: z.string(),
    pricing_option_id: z.string(),
    budget: z.number(),
    format_ids: z.array(z.object({ agent_url: z.string(), id: z.string() })).optional(),
    start_time: z.string().optional().nullable(),
    end_time: z.string().optional().nullable(),
    paused: z.boolean().optional(),
  }).passthrough();

  server.registerTool(
    'create_media_buy',
    {
      description: 'Creates a new media buy',
      inputSchema: {
        packages: z.array(packageRequestSchema).optional().nullable(),
        brand: z.object({ domain: z.string(), brand_id: z.string().optional().nullable() }).optional().nullable(),
        account: z.object({ account_id: z.string() }).optional().nullable(),
        start_time: z.union([z.string(), z.object({}).passthrough()]).optional().nullable(),
        end_time: z.string().optional().nullable(),
      },
    },
    async (args) => handleCreateMediaBuy(tenantId, args as never)
  );

  // get_media_buy
  server.registerTool(
    'get_media_buy',
    {
      description: 'Retrieves a media buy by ID',
      inputSchema: {
        media_buy_id: z.string(),
      },
    },
    async (args) => handleGetMediaBuy(tenantId, args)
  );

  // update_media_buy — no automatic inputSchema so we can log before Zod rejects
  const packageUpdateSchema = z.object({
    package_id: z.string(),
    paused: z.boolean().optional(),
    canceled: z.boolean().optional(),
    cancellation_reason: z.string().optional(),
    budget: z.number().optional(),
    start_time: z.string().optional(),
    end_time: z.string().optional(),
    creative_assignments: z.array(z.any()).optional(),
    targeting_overlay: z.any().optional(),
  }).passthrough();

  const updateMediaBuySchema = z.object({
    media_buy_id: z.string(),
    paused: z.boolean().optional(),
    canceled: z.boolean().optional(),
    cancellation_reason: z.string().optional(),
    packages: z.array(packageUpdateSchema).optional(),
    new_packages: z.array(z.any()).optional(),
    start_time: z.string().optional(),
    end_time: z.string().optional(),
    revision: z.number().optional(),
  }).passthrough();

  server.registerTool(
    'update_media_buy',
    {
      description: 'Updates an existing media buy',
      inputSchema: {
        media_buy_id: z.string(),
        paused: z.boolean().optional(),
        canceled: z.boolean().optional(),
        cancellation_reason: z.string().optional(),
        packages: z.array(packageUpdateSchema).optional(),
        new_packages: z.array(z.any()).optional(),
        start_time: z.string().optional(),
        end_time: z.string().optional(),
        revision: z.number().optional(),
      },
    },
    async (args) => {
      console.log('[update_media_buy] args:', JSON.stringify(args));
      return handleUpdateMediaBuy(tenantId, args as never);
    }
  );

  return server;
}
