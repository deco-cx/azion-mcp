/**
 * Edge Application-related tools for Azion Edge Applications service.
 * 
 * This file contains all tools related to edge application operations including:
 * - Retrieving rule engines (request rules)
 * - Updating rule engine criteria and behaviors
 */
import { createPrivateTool } from "@deco/workers-runtime/mastra";
import { z } from "zod";
import type { Env } from "../../main.ts";

/**
 * Schema for rule engine criteria conditions.
 * Each condition defines a logical check (if/and/or) with a variable, operator, and argument.
 */
const criteriaConditionSchema = z.object({
  conditional: z.enum(["if", "and", "or"]).describe("Logical operator for the condition"),
  variable: z.string().describe("Variable to evaluate (e.g., ${host}, ${uri})"),
  operator: z.string().describe("Comparison operator (e.g., is_equal, matches, starts_with)"),
  argument: z.string().describe("Value to compare against"),
});

/**
 * Schema for rule engine criteria.
 * Criteria is an array of condition groups, where each group is evaluated together.
 */
const criteriaSchema = z.array(
  z.array(criteriaConditionSchema)
).describe("Array of condition groups for the rule engine");

/**
 * Tool to get all rule engines (request rules) for an edge application.
 * 
 * This tool retrieves all rule engines configured for a specific edge application,
 * including their criteria and behaviors.
 */
export const getAllRuleEnginesTool = (env: Env) =>
  createPrivateTool({
    id: "AZION_GET_ALL_RULE_ENGINES",
    description: "Get all rule engines (request rules) for an Azion edge application",
    inputSchema: z.object({
      application_id: z.number().describe("The edge application ID"),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      rules: z.array(z.any()).optional().describe("Array of rule engines"),
      count: z.number().optional().describe("Total number of rules"),
      error: z.string().optional(),
    }),
    execute: async ({ context }) => {
      try {
        const response = await fetch(
          `https://console.azion.com/v4/workspace/applications/${context.application_id}/request_rules`,
          {
            method: "GET",
            headers: {
              "Authorization": `Token ${env.DECO_CHAT_REQUEST_CONTEXT.state.azion_token}`,
            },
          }
        );

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
          rules: result.results || [],
          count: result.count || result.results?.length || 0,
        };
      } catch (error) {
        return {
          success: false,
          error: `Network error: ${error instanceof Error ? error.message : String(error)}`,
        };
      }
    },
  });

/**
 * Tool to update (PATCH) a rule engine for an edge application.
 * 
 * This tool updates the criteria and/or behaviors of a specific rule engine.
 * The criteria define when the rule should be applied, and behaviors define
 * what actions should be taken.
 */
export const updateRuleEngineTool = (env: Env) =>
  createPrivateTool({
    id: "AZION_UPDATE_RULE_ENGINE",
    description: "Update a rule engine (request rule) for an Azion edge application",
    inputSchema: z.object({
      application_id: z.number().describe("The edge application ID"),
      rule_id: z.number().describe("The rule engine ID to update"),
      criteria: criteriaSchema.optional().describe("Rule criteria conditions to update"),
      behaviors: z.array(z.any()).optional().describe("Rule behaviors to update (optional)"),
      name: z.string().optional().describe("Rule name (optional)"),
      description: z.string().optional().describe("Rule description (optional)"),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      rule: z.any().optional().describe("Updated rule engine data"),
      error: z.string().optional(),
    }),
    execute: async ({ context }) => {
      try {
        // Build the request body with only provided fields
        const body: Record<string, any> = {};
        
        if (context.criteria !== undefined) {
          body.criteria = context.criteria;
        }
        if (context.behaviors !== undefined) {
          body.behaviors = context.behaviors;
        }
        if (context.name !== undefined) {
          body.name = context.name;
        }
        if (context.description !== undefined) {
          body.description = context.description;
        }

        const response = await fetch(
          `https://console.azion.com/v4/workspace/applications/${context.application_id}/request_rules/${context.rule_id}`,
          {
            method: "PATCH",
            headers: {
              "Accept": "application/json; version=3",
              "Authorization": `Token ${env.DECO_CHAT_REQUEST_CONTEXT.state.azion_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          }
        );

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
          rule: result.results || result,
        };
      } catch (error) {
        return {
          success: false,
          error: `Network error: ${error instanceof Error ? error.message : String(error)}`,
        };
      }
    },
  });

// Export all edge application-related tools
export const edgeApplicationTools = [
  getAllRuleEnginesTool,
  updateRuleEngineTool,
];

