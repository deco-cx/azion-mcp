/**
 * Firewall-related tools for Azion Edge Firewall service.
 * 
 * This file contains all tools related to firewall and WAF operations including:
 * - Creating WAF rules
 * - Managing edge firewall configurations
 */
import { createPrivateTool } from "@deco/workers-runtime/mastra";
import { z } from "zod";
import type { Env } from "../../main.ts";

// Schema for WAF rule criteria with comprehensive field definitions
const CriterionSchema = z.object({
  variable: z.enum([
    // Request variables
    "request_uri",
    "request_method", 
    "request_args",
    "request_headers",
    "host",
    "user_agent",
    "referer",
    "scheme",
    "server_protocol",
    "request_body",
    "cookie",
    // Network variables
    "remote_addr",
    "network",
    "server_port",
    "ssl_cipher",
    "ssl_protocol",
    // Geolocation variables
    "geoip_country_code",
    "geoip_country_name", 
    "geoip_region",
    "geoip_region_name",
    "geoip_city",
    "geoip_continent_code",
    "geoip_asn",
    // Security variables
    "query_string",
    "file_extension",
    "raw_body",
    // Custom variables
    "args_names",
    "args_values"
  ]).describe("The request variable to evaluate. Available options include request properties (request_uri, request_method, host, user_agent), network info (remote_addr, server_port), geolocation (geoip_country_code, geoip_city), and security features (query_string, file_extension)"),
  
  operator: z.enum([
    "is_equal",
    "is_not_equal", 
    "starts_with",
    "does_not_start_with",
    "matches",
    "does_not_match",
    "contains",
    "does_not_contain",
    "is_in_list",
    "is_not_in_list",
    "exists",
    "does_not_exist",
    "between",
    "is_greater_than",
    "is_less_than"
  ]).describe("Comparison operator to use. Options: is_equal (exact match), is_not_equal (not equal), starts_with (begins with), does_not_start_with, matches (regex), does_not_match, contains (substring), does_not_contain, is_in_list (whitelist), is_not_in_list (blacklist), exists (has value), does_not_exist (no value), between (numeric range), is_greater_than, is_less_than"),
  
  conditional: z.enum(["if", "and", "or"]).describe("Conditional logic operator: 'if' for first condition, 'and' for additional conditions that must all be true, 'or' for alternative conditions"),
  
  argument: z.string().describe("The value to compare against. For 'matches'/'does_not_match' use regex patterns. For 'is_in_list'/'is_not_in_list' use comma-separated values. For 'between' use 'min,max' format. For 'exists'/'does_not_exist' this field is optional."),
});

// Schema for WAF rule behaviors with comprehensive options
const BehaviorSchema = z.object({
  name: z.enum([
    "deny",
    "drop", 
    "redirect_to_301",
    "redirect_to_302",
    "custom_response",
    "bypass",
    "rate_limit",
    "set_waf_ruleset_mode",
    "set_waf_ruleset_sensitivity",
    "add_request_header",
    "remove_request_header",
    "add_response_header", 
    "remove_response_header",
    "set_cache_policy",
    "set_origin",
    "run_function"
  ]).describe("Action to execute when criteria match. Security: deny (403 error), drop (connection drop), redirect_to_301/302 (redirects), custom_response (custom status/body), bypass (allow), rate_limit (throttle). Headers: add_request_header, remove_request_header, add_response_header, remove_response_header. Advanced: set_waf_ruleset_mode, set_waf_ruleset_sensitivity, set_cache_policy, set_origin, run_function"),
  
  argument: z.string().optional().describe("Required argument for specific behaviors: redirect_to_301/302 (target URL), custom_response (status_code|body|content_type), rate_limit (requests_per_second|burst_size|action), add_*_header (header_name:header_value), remove_*_header (header_name), set_waf_ruleset_mode (off|counting|blocking), set_waf_ruleset_sensitivity (low|medium|high), set_cache_policy (policy_id), set_origin (origin_id), run_function (function_id)")
});

/**
 * Tool to create a WAF rule in Azion Edge Firewall.
 * 
 * This tool creates a new WAF (Web Application Firewall) rule within an existing
 * edge firewall to control traffic based on specified criteria and behaviors.
 */
export const createWafRuleTool = (env: Env) =>
  createPrivateTool({
    id: "AZION_CREATE_WAF_RULE",
    description: "Create a WAF rule in Azion Edge Firewall for traffic control",
    inputSchema: z.object({
      firewall_id: z.number().describe("ID of the edge firewall to add the rule to"),
      name: z.string().describe("Name identifier for the WAF rule"),
      is_active: z.boolean().default(true).describe("Whether the rule should be active"),
      behaviors: z.array(BehaviorSchema).describe("Array of behaviors to execute when criteria match"),
      criteria: z.array(z.array(CriterionSchema)).describe("Array of criterion groups (each group uses AND logic, groups use OR logic)"),
      order: z.number().describe("Execution order of the rule (lower numbers execute first)"),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      rule_id: z.number().optional(),
      name: z.string().optional(),
      is_active: z.boolean().optional(),
      order: z.number().optional(),
      error: z.string().optional(),
    }),
    execute: async ({ context }) => {
      try {
        const response = await fetch(`https://api.azionapi.net/edge_firewall/${context.firewall_id}/rules_engine`, {
          method: "POST",
          headers: {
            "Accept": "application/json; version=3",
            "Content-Type": "application/json",
            "Authorization": `Token ${env.DECO_CHAT_REQUEST_CONTEXT.state.azion_token}`,
          },
          body: JSON.stringify({
            name: context.name,
            is_active: context.is_active,
            behaviors: context.behaviors,
            criteria: context.criteria,
            order: context.order,
          }),
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
          rule_id: result.results?.id,
          name: result.results?.name,
          is_active: result.results?.is_active,
          order: result.results?.order,
        };
      } catch (error) {
        return {
          success: false,
          error: `Network error: ${error instanceof Error ? error.message : String(error)}`,
        };
      }
    },
  });

// Export all firewall-related tools
export const firewallTools = [
  createWafRuleTool,
];
