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
 * Utility function to decode base64-encoded certificate data.
 * 
 * This function handles the conversion from base64 to raw PEM format
 * that the Azion API expects.
 */
function decodeBase64Certificate(base64Data: string): string {
  try {
    // Decode base64 to get the raw certificate content
    const decoded = atob(base64Data);
    return decoded;
  } catch (error) {
    throw new Error(`Invalid base64 certificate data: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Tool to upload a digital certificate to Azion.
 * 
 * This tool uploads a custom SSL/TLS certificate to Azion's Digital Certificates service.
 * The certificate will be used to secure HTTPS connections for domains.
 * 
 * Now accepts base64-encoded certificate and private key data.
 */
export const uploadDigitalCertificateTool = (env: Env) =>
  createPrivateTool({
    id: "AZION_UPLOAD_CERTIFICATE",
    description: "Upload a digital certificate to Azion for HTTPS domains",
    inputSchema: z.object({
      name: z.string().describe("Name identifier for the certificate"),
      certificate: z.string().describe("The X.509 certificate content (base64-encoded PEM format)"),
      private_key: z.string().describe("The private key content (base64-encoded PEM format)"),
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
        // Decode base64-encoded certificate and private key
        const decodedCertificate = decodeBase64Certificate(context.certificate);
        const decodedPrivateKey = decodeBase64Certificate(context.private_key);

        const response = await fetch("https://api.azionapi.net/digital_certificates", {
          method: "POST",
          headers: {
            "Accept": "application/json; version=3",
            "Content-Type": "application/json",
            "Authorization": `Token ${env.DECO_CHAT_REQUEST_CONTEXT.state.azion_token}`,
          },
          body: JSON.stringify({
            name: context.name,
            certificate: decodedCertificate,
            private_key: decodedPrivateKey,
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
 * Tool to update/patch an existing digital certificate in Azion.
 * 
 * This tool allows updating certificate details such as name and certificate content.
 * Useful for certificate renewal or updating certificate information.
 * 
 * Accepts base64-encoded certificate data.
 */
export const patchDigitalCertificateTool = (env: Env) =>
  createPrivateTool({
    id: "AZION_PATCH_CERTIFICATE",
    description: "Update an existing digital certificate in Azion",
    inputSchema: z.object({
      certificate_id: z.number().describe("The ID of the certificate to update"),
      name: z.string().optional().describe("New name identifier for the certificate"),
      certificate: z.string().optional().describe("New certificate content (base64-encoded PEM format)"),
      private_key: z.string().optional().describe("New private key content (base64-encoded PEM format)"),
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
        // Build the update payload dynamically based on provided fields
        const updatePayload: Record<string, string> = {};
        
        if (context.name) {
          updatePayload.name = context.name;
        }
        
        if (context.certificate) {
          // Decode base64-encoded certificate
          const decodedCertificate = decodeBase64Certificate(context.certificate);
          updatePayload.certificate = decodedCertificate;
        }

        if (context.private_key) {
          // Decode base64-encoded private key
          const decodedPrivateKey = decodeBase64Certificate(context.private_key);
          updatePayload.private_key = decodedPrivateKey;
        }

        // Ensure at least one field is being updated
        if (Object.keys(updatePayload).length === 0) {
          return {
            success: false,
            error: "At least one field (name, certificate, or private_key) must be provided for update",
          };
        }

        const response = await fetch(
          `https://api.azionapi.net/digital_certificates/${context.certificate_id}`,
          {
            method: "PATCH",
            headers: {
              "Accept": "application/json; version=3",
              "Content-Type": "application/json",
              "Authorization": `Token ${env.DECO_CHAT_REQUEST_CONTEXT.state.azion_token}`,
            },
            body: JSON.stringify(updatePayload),
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
 * 
 * Now accepts base64-encoded certificate data.
 */
export const createTrustedCACertificateTool = (env: Env) =>
  createPrivateTool({
    id: "AZION_CREATE_TRUSTED_CA_CERTIFICATE",
    description: "Create a Trusted CA certificate in Azion for mTLS authentication",
    inputSchema: z.object({
      name: z.string().describe("Name identifier for the Trusted CA certificate"),
      certificate: z.string().describe("The Trusted CA certificate content (base64-encoded PEM format)"),
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
        // Decode base64-encoded certificate
        const decodedCertificate = decodeBase64Certificate(context.certificate);

        const response = await fetch("https://api.azionapi.net/digital_certificates", {
          method: "POST",
          headers: {
            "Accept": "application/json; version=3",
            "Content-Type": "application/json",
            "Authorization": `Token ${env.DECO_CHAT_REQUEST_CONTEXT.state.azion_token}`,
          },
          body: JSON.stringify({
            name: context.name,
            certificate: decodedCertificate,
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
  patchDigitalCertificateTool,
  createTrustedCACertificateTool,
];
