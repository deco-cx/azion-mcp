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
    // HTTP Headers
    "header_accept",
    "header_accept_encoding", 
    "header_accept_language",
    "header_cookie",
    "header_origin",
    "header_referer",
    "header_user_agent",
    // Request Properties
    "host",
    "network",
    "request_args",
    "request_method", 
    "request_uri",
    "scheme",
    // Security & SSL
    "client_certificate_validation",
    "ssl_verification_status"
  ]).describe("The request variable to evaluate. HTTP Headers: header_accept, header_accept_encoding, header_accept_language, header_cookie, header_origin, header_referer, header_user_agent. Request Properties: host (hostname), network (IP addresses/CIDR/ASN/Country), request_args (query string), request_method (HTTP method), request_uri (normalized URI), scheme (request scheme). Security: client_certificate_validation (client cert auth), ssl_verification_status (cert validation result)"),
  
  operator: z.enum([
    "is_equal",
    "is_not_equal", 
    "starts_with",
    "does_not_start_with",
    "matches",
    "does_not_match",
    "exists",
    "does_not_exist",
    "is_in_list",
    "is_not_in_list"
  ]).describe("Comparison operator to use. Basic: is_equal (exact match), is_not_equal (not equal), starts_with (begins with), does_not_start_with. Pattern: matches (regex), does_not_match (not regex). Existence: exists (has value), does_not_exist (no value). Network Lists: is_in_list (IP in network list), is_not_in_list (IP not in network list)"),
  
  conditional: z.enum(["if", "and", "or"]).describe("Conditional logic operator: 'if' for first condition, 'and' for additional conditions that must all be true, 'or' for alternative conditions"),
  
  argument: z.string().describe("The value to compare against. For 'matches'/'does_not_match' use regex patterns. For 'is_in_list'/'is_not_in_list' use Network List ID in string format. For 'exists'/'does_not_exist' this field is optional. For 'header_user_agent' use regex format."),
});

// Schema for WAF rule behaviors with comprehensive options
const BehaviorSchema = z.object({
  name: z.enum([
    "deny",
    "drop", 
    "set_rate_limit",
    "set_waf_ruleset",
    "run_function",
    "tag_event",
    "set_custom_response"
  ]).describe("Action to execute when criteria match. Security: deny (403 Forbidden), drop (Close Without Response). Rate Control: set_rate_limit (apply rate limiting). WAF: set_waf_ruleset (apply WAF rule set). Advanced: run_function (execute function), tag_event (tag event for logging), set_custom_response (send custom response)"),
  
  argument: z.object({
    // Rate limit arguments
    type: z.enum(["second", "minute"]).optional().describe("Time unit for rate limiting"),
    limit_by: z.enum(["client_ip", "global"]).optional().describe("How to apply rate limit"),
    average_rate_limit: z.string().optional().describe("Average rate limit as string"),
    maximum_burst_size: z.string().optional().describe("Maximum burst size as string (required only when type='second')"),
    
    // WAF ruleset arguments
    waf_id: z.number().optional().describe("WAF ID for ruleset"),
    mode: z.enum(["Learning", "Blocking"]).optional().describe("WAF mode"),
    
    // Custom response arguments
    status_code: z.string().optional().describe("HTTP status code (200-499)"),
    content_body: z.string().optional().describe("Response body (max 500 characters)"),
    content_type: z.string().optional().describe("Content type header"),
    
    // Function and tag arguments (extensible)
    function_id: z.string().optional().describe("Function ID for run_function"),
    tag_name: z.string().optional().describe("Tag name for tag_event"),
    tag_value: z.string().optional().describe("Tag value for tag_event")
  }).optional().describe("Behavior arguments object. Required for set_rate_limit, set_waf_ruleset, set_custom_response, run_function, and tag_event behaviors.")
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

        console.log("body = ", JSON.stringify({
          name: context.name,
          is_active: context.is_active,
          behaviors: context.behaviors,
          criteria: context.criteria,
          order: context.order,
        }));
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
