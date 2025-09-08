/**
 * Domain-related tools for Azion Domains service.
 * 
 * This file contains all tools related to domain configuration including:
 * - Creating domains
 * - Associating domains with edge applications and certificates
 */
import { createPrivateTool } from "@deco/workers-runtime/mastra";
import { z } from "zod";
import type { Env } from "../../main.ts";

/**
 * Tool to create a domain in Azion.
 * 
 * This tool creates a new domain configuration in Azion, associating it with
 * an edge application, digital certificate, and optionally an edge firewall.
 */
export const createDomainTool = (env: Env) =>
  createPrivateTool({
    id: "AZION_CREATE_DOMAIN",
    description: "Create a domain configuration in Azion",
    inputSchema: z.object({
      name: z.string().describe("Domain name identifier"),
      cnames: z.array(z.string()).describe("List of CNAME records for the domain"),
      cname_access_only: z.boolean().default(true).describe("Whether to restrict access to CNAMEs only"),
      digital_certificate_id: z.number().optional().describe("ID of the digital certificate to associate"),
      edge_application_id: z.number().describe("ID of the edge application to associate"),
      edge_firewall_id: z.number().optional().describe("ID of the edge firewall to associate"),
      is_active: z.boolean().default(true).describe("Whether the domain should be active"),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      domain_id: z.number().optional(),
      name: z.string().optional(),
      domain_name: z.string().optional(),
      cnames: z.array(z.string()).optional(),
      is_active: z.boolean().optional(),
      error: z.string().optional(),
    }),
    execute: async ({ context }) => {
      try {
        const requestBody: Record<string, any> = {
          name: context.name,
          cnames: context.cnames,
          cname_access_only: context.cname_access_only,
          edge_application_id: context.edge_application_id,
          is_active: context.is_active,
        };

        // Add optional fields only if provided
        if (context.digital_certificate_id !== undefined) {
          requestBody.digital_certificate_id = context.digital_certificate_id;
        }
        if (context.edge_firewall_id !== undefined) {
          requestBody.edge_firewall_id = context.edge_firewall_id;
        }

        const response = await fetch("https://api.azionapi.net/domains", {
          method: "POST",
          headers: {
            "Accept": "application/json; version=3",
            "Content-Type": "application/json",
            "Authorization": `Token ${env.DECO_CHAT_REQUEST_CONTEXT.state.azion_token}`,
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorText = await response.text();
          return {
            success: false,
            error: `HTTP ${response.status}: ${errorText}`,
          };
        }

        const result = await response.json();
        
        return {
          success: true,
          domain_id: result.results?.id,
          name: result.results?.name,
          domain_name: result.results?.domain_name,
          cnames: result.results?.cnames,
          is_active: result.results?.is_active,
        };
      } catch (error) {
        return {
          success: false,
          error: `Network error: ${error instanceof Error ? error.message : String(error)}`,
        };
      }
    },
  });

// Export all domain-related tools
export const domainTools = [
  createDomainTool,
];
