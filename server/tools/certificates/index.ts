/**
 * Certificate-related tools for Azion Digital Certificates service.
 * 
 * This file contains all tools related to SSL/TLS certificate operations including:
 * - Uploading digital certificates
 * - Managing trusted CA certificates for mTLS
 */
import { createPrivateTool } from "@deco/workers-runtime/mastra";
import { z } from "zod";
import type { Env } from "../../main.ts";

/**
 * Tool to upload a digital certificate to Azion.
 * 
 * This tool uploads a custom SSL/TLS certificate to Azion's Digital Certificates service.
 * The certificate will be used to secure HTTPS connections for domains.
 */
export const uploadDigitalCertificateTool = (env: Env) =>
  createPrivateTool({
    id: "AZION_UPLOAD_CERTIFICATE",
    description: "Upload a digital certificate to Azion for HTTPS domains",
    inputSchema: z.object({
      name: z.string().describe("Name identifier for the certificate"),
      certificate: z.string().describe("The X.509 certificate content (PEM format)"),
      private_key: z.string().describe("The private key content (PEM format)"),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      certificate_id: z.number().optional(),
      name: z.string().optional(),
      validity: z.string().optional(),
      status: z.string().optional(),
      error: z.string().optional(),
    }),
    execute: async ({ context }) => {
      try {
        const response = await fetch("https://api.azionapi.net/digital_certificates", {
          method: "POST",
          headers: {
            "Accept": "application/json; version=3",
            "Content-Type": "application/json",
            "Authorization": `Token ${env.DECO_CHAT_REQUEST_CONTEXT.state.azion_token}`,
          },
          body: JSON.stringify({
            name: context.name,
            certificate: context.certificate,
            private_key: context.private_key,
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
          certificate_id: result.results?.id,
          name: result.results?.name,
          validity: result.results?.validity,
          status: result.results?.status,
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
 * Tool to create a Trusted CA certificate for mTLS in Azion.
 * 
 * This tool uploads a Trusted Certificate Authority certificate for
 * mutual TLS authentication configurations.
 */
export const createTrustedCACertificateTool = (env: Env) =>
  createPrivateTool({
    id: "AZION_CREATE_TRUSTED_CA_CERTIFICATE",
    description: "Create a Trusted CA certificate in Azion for mTLS authentication",
    inputSchema: z.object({
      name: z.string().describe("Name identifier for the Trusted CA certificate"),
      certificate: z.string().describe("The Trusted CA certificate content (PEM format)"),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      certificate_id: z.number().optional(),
      name: z.string().optional(),
      validity: z.string().optional(),
      status: z.string().optional(),
      certificate_type: z.string().optional(),
      error: z.string().optional(),
    }),
    execute: async ({ context }) => {
      try {
        const response = await fetch("https://api.azionapi.net/digital_certificates", {
          method: "POST",
          headers: {
            "Accept": "application/json; version=3",
            "Content-Type": "application/json",
            "Authorization": `Token ${env.DECO_CHAT_REQUEST_CONTEXT.state.azion_token}`,
          },
          body: JSON.stringify({
            name: context.name,
            certificate: context.certificate,
            certificate_type: "trusted_ca_certificate",
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
          certificate_id: result.results?.id,
          name: result.results?.name,
          validity: result.results?.validity,
          status: result.results?.status,
          certificate_type: result.results?.certificate_type,
        };
      } catch (error) {
        return {
          success: false,
          error: `Network error: ${error instanceof Error ? error.message : String(error)}`,
        };
      }
    },
  });

// Export all certificate-related tools
export const certificateTools = [
  uploadDigitalCertificateTool,
  createTrustedCACertificateTool,
];
