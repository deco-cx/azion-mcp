/**
 * Central export point for all tools organized by subject.
 * 
 * This file aggregates all tools from different subjects into a single
 * export, making it easy to import all tools in main.ts while keeping
 * the subject separation for better organization.
 */
import { certificateTools } from "./certificates/index.ts";
import { domainTools } from "./domains/index.ts";
import { firewallTools } from "./firewall/index.ts";

// Export all tools from all subjects
export const tools = [
  ...certificateTools,
  ...domainTools,
  ...firewallTools,
];

// Re-export subject-specific tools for direct access if needed
export { certificateTools } from "./certificates/index.ts";
export { domainTools } from "./domains/index.ts";
export { firewallTools } from "./firewall/index.ts";
