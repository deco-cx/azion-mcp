# Azion MCP Tools Documentation

This document describes the Azion Model Context Protocol (MCP) tools that have been integrated into the server. These tools provide programmatic access to Azion's Digital Certificates and Domains APIs.

## Overview

The Azion MCP tools follow the **Single Responsibility Principle** and implement a **3-layer architecture**:
- **Presentation Layer**: MCP tool interfaces with Zod schema validation
- **Application Layer**: Business logic for API interactions
- **Data Layer**: HTTP API calls to Azion services

### Design Patterns Used

- **Facade Pattern**: Each tool provides a simplified interface to complex Azion API operations
- **Factory Pattern**: Tools are created using factory functions that accept environment context
- **Error Handling Pattern**: Consistent error handling with descriptive messages

## Available Tools

### 1. AZION_CREATE_CERTIFICATE

Creates a digital certificate in Azion for HTTPS domains.

**Purpose**: Upload custom SSL/TLS certificates to secure domain connections.

**Input Parameters**:
- `name` (string): Name identifier for the certificate
- `certificate` (string): X.509 certificate content in PEM format
- `private_key` (string): Private key content in PEM format  
- `token` (string): Azion API authentication token

**Output**:
- `success` (boolean): Operation success status
- `certificate_id` (number): Generated certificate ID
- `name` (string): Certificate name
- `validity` (string): Certificate validity period
- `status` (string): Certificate status
- `error` (string): Error message if operation fails

**Example Usage**:
```typescript
// The certificate and private key should be in PEM format
const result = await AZION_CREATE_CERTIFICATE({
  name: "example.com SSL Certificate",
  certificate: "-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----",
  private_key: "-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----",
  token: "your-azion-api-token"
});
```

### 2. AZION_CREATE_DOMAIN

Creates a domain configuration in Azion.

**Purpose**: Configure domains to work with Azion's edge infrastructure, associating them with applications, certificates, and firewalls.

**Input Parameters**:
- `name` (string): Domain name identifier
- `cnames` (string[]): List of CNAME records for the domain
- `cname_access_only` (boolean, default: true): Restrict access to CNAMEs only
- `digital_certificate_id` (number, optional): Associated certificate ID
- `edge_application_id` (number): Associated edge application ID
- `edge_firewall_id` (number, optional): Associated edge firewall ID
- `is_active` (boolean, default: true): Domain active status
- `token` (string): Azion API authentication token

**Output**:
- `success` (boolean): Operation success status
- `domain_id` (number): Generated domain ID
- `name` (string): Domain name
- `domain_name` (string): Azion-generated domain name
- `cnames` (string[]): Configured CNAME records
- `is_active` (boolean): Domain active status
- `error` (string): Error message if operation fails

**Example Usage**:
```typescript
const result = await AZION_CREATE_DOMAIN({
  name: "storefront.deco.site",
  cnames: ["storefront.deco.site"],
  cname_access_only: true,
  digital_certificate_id: 130389,
  edge_application_id: 1750766941,
  edge_firewall_id: 37766,
  is_active: true,
  token: "your-azion-api-token"
});
```

### 3. AZION_CREATE_TRUSTED_CA_CERTIFICATE

Creates a Trusted CA certificate for mTLS authentication.

**Purpose**: Upload Trusted Certificate Authority certificates for mutual TLS authentication configurations.

**Input Parameters**:
- `name` (string): Name identifier for the Trusted CA certificate
- `certificate` (string): Trusted CA certificate content in PEM format
- `token` (string): Azion API authentication token

**Output**:
- `success` (boolean): Operation success status
- `certificate_id` (number): Generated certificate ID
- `name` (string): Certificate name
- `validity` (string): Certificate validity period
- `status` (string): Certificate status
- `certificate_type` (string): Type of certificate
- `error` (string): Error message if operation fails

**Example Usage**:
```typescript
const result = await AZION_CREATE_TRUSTED_CA_CERTIFICATE({
  name: "TCA example.com",
  certificate: "-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----",
  token: "your-azion-api-token"
});
```

## Implementation Details

### Code Quality Principles

The implementation follows these software engineering principles:

1. **KISS (Keep It Simple, Stupid)**: Each tool has a single, clear purpose
2. **SOLID Principles**:
   - **Single Responsibility**: Each tool handles one Azion API operation
   - **Open/Closed**: Tools can be extended without modification
   - **Interface Segregation**: Clean, focused interfaces for each operation
   - **Dependency Inversion**: Tools depend on abstractions (Env interface)

3. **DRY (Don't Repeat Yourself)**: Common patterns extracted into reusable structures
4. **Clean Code**: Descriptive names, proper error handling, comprehensive documentation

### Error Handling

All tools implement consistent error handling:
- Network errors are caught and returned with descriptive messages
- HTTP errors include status codes and response text
- All errors are returned in a structured format for easy processing

### Authentication

All tools require an Azion API token for authentication. The token should be passed as a parameter to each tool call.

## API References

- [Azion Digital Certificates API](https://api.azion.com/v3#c6dd68ee-0648-485d-9d4b-7c33da8de187)
- [Azion Domains API](https://api.azion.com/v3#a258eabc-b419-47e6-be68-45c2ce0150dd)
- [Azion Digital Certificate Guide](https://www.azion.com/en/documentation/products/guides/create-a-digital-certificate/)

## Common Workflows

### 1. Complete SSL Setup for a New Domain

```typescript
// 1. First, create a digital certificate
const certResult = await AZION_CREATE_CERTIFICATE({
  name: "example.com SSL",
  certificate: "...",
  private_key: "...",
  token: "your-token"
});

// 2. Then create the domain using the certificate ID
const domainResult = await AZION_CREATE_DOMAIN({
  name: "example.com",
  cnames: ["example.com", "www.example.com"],
  digital_certificate_id: certResult.certificate_id,
  edge_application_id: your_app_id,
  token: "your-token"
});
```

### 2. Setting up mTLS Authentication

```typescript
// Create a Trusted CA certificate for client authentication
const trustedCaResult = await AZION_CREATE_TRUSTED_CA_CERTIFICATE({
  name: "Client CA Certificate",
  certificate: "...",
  token: "your-token"
});
```

## Security Considerations

- **Token Security**: Never hardcode API tokens. Use environment variables or secure configuration
- **Certificate Security**: Ensure private keys are properly secured and not logged
- **Input Validation**: All inputs are validated using Zod schemas
- **Error Information**: Error messages don't expose sensitive information

## Future Enhancements

The tool architecture supports easy extension for additional Azion APIs:
- Edge Applications management
- Edge Firewall rules
- WAF configurations
- Real-time metrics
- Edge Functions deployment

Each new tool should follow the same patterns established in the current implementation.
