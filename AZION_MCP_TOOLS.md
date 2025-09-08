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

### 1. AZION_UPLOAD_CERTIFICATE

Uploads a digital certificate to Azion for HTTPS domains.

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
const result = await AZION_UPLOAD_CERTIFICATE({
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

### 4. AZION_CREATE_WAF_RULE

Creates a WAF (Web Application Firewall) rule in Azion Edge Firewall for traffic control and security.

**Purpose**: Create custom firewall rules to filter, block, or allow traffic based on specific criteria such as request URI, host, method, headers, etc.

**Input Parameters**:
- `firewall_id` (number): ID of the edge firewall to add the rule to
- `name` (string): Name identifier for the WAF rule
- `is_active` (boolean): Whether the rule should be active (default: true)
- `behaviors` (array): Array of behaviors to execute when criteria match
  - `name` (enum): Behavior type. Options:
    - **Security**: `deny` (403 error), `drop` (connection drop), `bypass` (allow), `rate_limit` (throttle)
    - **Redirects**: `redirect_to_301`, `redirect_to_302`
    - **Custom**: `custom_response` (custom status/body)
    - **Headers**: `add_request_header`, `remove_request_header`, `add_response_header`, `remove_response_header`
    - **Advanced**: `set_waf_ruleset_mode`, `set_waf_ruleset_sensitivity`, `set_cache_policy`, `set_origin`, `run_function`
  - `argument` (string, optional): Required for specific behaviors:
    - `redirect_to_301/302`: Target URL
    - `custom_response`: Format: `status_code|body|content_type`
    - `rate_limit`: Format: `requests_per_second|burst_size|action`
    - `add_*_header`: Format: `header_name:header_value`
    - `remove_*_header`: Header name to remove
    - `set_waf_ruleset_mode`: `off`, `counting`, or `blocking`
    - `set_waf_ruleset_sensitivity`: `low`, `medium`, or `high`
- `criteria` (array): Array of criterion groups (each group uses AND logic, groups use OR logic)
  - `variable` (enum): Variable to evaluate. Options:
    - **Request**: `request_uri`, `request_method`, `request_args`, `request_headers`, `host`, `user_agent`, `referer`, `scheme`, `server_protocol`, `request_body`, `cookie`
    - **Network**: `remote_addr`, `network`, `server_port`, `ssl_cipher`, `ssl_protocol`
    - **Geolocation**: `geoip_country_code`, `geoip_country_name`, `geoip_region`, `geoip_region_name`, `geoip_city`, `geoip_continent_code`, `geoip_asn`
    - **Security**: `query_string`, `file_extension`, `raw_body`, `args_names`, `args_values`
  - `operator` (enum): Comparison operator. Options:
    - **Equality**: `is_equal`, `is_not_equal`
    - **Pattern**: `starts_with`, `does_not_start_with`, `contains`, `does_not_contain`
    - **Regex**: `matches`, `does_not_match`
    - **Lists**: `is_in_list`, `is_not_in_list`
    - **Existence**: `exists`, `does_not_exist`
    - **Numeric**: `between`, `is_greater_than`, `is_less_than`
  - `conditional` (enum): Logic operator: `if` (first condition), `and` (all must be true), `or` (any can be true)
  - `argument` (string): Value to compare against:
    - For `matches`/`does_not_match`: Use regex patterns
    - For `is_in_list`/`is_not_in_list`: Use comma-separated values
    - For `between`: Use `min,max` format
    - For `exists`/`does_not_exist`: Optional
- `order` (number): Execution order of the rule (lower numbers execute first)

**Output**:
- `success` (boolean): Operation success status
- `rule_id` (number): Generated rule ID
- `name` (string): Rule name
- `is_active` (boolean): Rule active status
- `order` (number): Rule execution order
- `error` (string): Error message if operation fails

**Example Usage**:
```typescript
// Example 1: Block specific URIs
const blockRule = await AZION_CREATE_WAF_RULE({
  firewall_id: 37766,
  name: "Block Test Endpoints",
  is_active: true,
  behaviors: [
    {
      name: "deny"
    }
  ],
  criteria: [
    [
      {
        variable: "request_uri",
        operator: "is_in_list",
        conditional: "if",
        argument: "/test,/admin,/debug"
      }
    ]
  ],
  order: 1
});

// Example 2: Rate limit by country with custom response
const rateLimitRule = await AZION_CREATE_WAF_RULE({
  firewall_id: 37766,
  name: "Rate Limit High Risk Countries",
  is_active: true,
  behaviors: [
    {
      name: "rate_limit",
      argument: "10|20|deny"  // 10 req/sec, burst 20, then deny
    }
  ],
  criteria: [
    [
      {
        variable: "geoip_country_code",
        operator: "is_in_list",
        conditional: "if",
        argument: "CN,RU,IR"
      }
    ]
  ],
  order: 2
});

// Example 3: Redirect mobile users with User-Agent pattern
const mobileRedirect = await AZION_CREATE_WAF_RULE({
  firewall_id: 37766,
  name: "Mobile Redirect",
  is_active: true,
  behaviors: [
    {
      name: "redirect_to_301",
      argument: "https://m.example.com"
    }
  ],
  criteria: [
    [
      {
        variable: "user_agent",
        operator: "matches",
        conditional: "if",
        argument: ".*(Mobile|Android|iPhone|iPad).*"
      }
    ]
  ],
  order: 3
});

// Example 4: Complex rule with multiple conditions (AND logic within group)
const complexRule = await AZION_CREATE_WAF_RULE({
  firewall_id: 37766,
  name: "Block Suspicious API Access",
  is_active: true,
  behaviors: [
    {
      name: "custom_response",
      argument: "429|Rate limited|application/json"
    }
  ],
  criteria: [
    [
      {
        variable: "request_uri",
        operator: "starts_with",
        conditional: "if",
        argument: "/api/"
      },
      {
        variable: "request_method",
        operator: "is_equal",
        conditional: "and",
        argument: "POST"
      },
      {
        variable: "request_headers",
        operator: "does_not_contain",
        conditional: "and",
        argument: "Authorization"
      }
    ]
  ],
  order: 4
});
```

### Behavior Argument Formats

For behaviors that require arguments, use these specific formats:

- **Rate Limiting**: `"requests_per_second|burst_size|action"`
  - Example: `"10|20|deny"` (10 req/sec, burst of 20, then deny)
  - Action options: `deny`, `drop`, `custom_response`

- **Custom Response**: `"status_code|body|content_type"`
  - Example: `"429|Rate limited|application/json"`
  - Example: `"503|Service unavailable|text/plain"`

- **Headers**: 
  - Add: `"header_name:header_value"`
  - Remove: `"header_name"`
  - Example: `"X-Custom-Header:my-value"`

- **Redirects**: Full URL
  - Example: `"https://example.com/new-path"`
  - Example: `"https://m.example.com"` (mobile redirect)

- **WAF Settings**:
  - Mode: `"off"`, `"counting"`, or `"blocking"`
  - Sensitivity: `"low"`, `"medium"`, or `"high"`

- **Advanced**: Resource IDs
  - Cache Policy: `"policy_id"` (numeric)
  - Origin: `"origin_id"` (numeric) 
  - Function: `"function_id"` (numeric)

## API References

- [Azion Digital Certificates API](https://api.azion.com/v3#c6dd68ee-0648-485d-9d4b-7c33da8de187)
- [Azion Domains API](https://api.azion.com/v3#a258eabc-b419-47e6-be68-45c2ce0150dd)
- [Azion Edge Firewall API](https://api.azion.com/v3#7c8e3b35-7b95-4f5e-9eb7-4b4e9c8f9a5f)
- [Azion Digital Certificate Guide](https://www.azion.com/en/documentation/products/guides/create-a-digital-certificate/)

## Common Workflows

### 1. Complete SSL Setup for a New Domain

```typescript
// 1. First, upload a digital certificate
const certResult = await AZION_UPLOAD_CERTIFICATE({
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
