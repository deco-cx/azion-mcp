# Azion MCP Server 🚀

An open-source [Model Context Protocol (MCP)](https://spec.modelcontextprotocol.io/) server that provides AI agents with tools to interact with [Azion's Edge Platform](https://www.azion.com/pt-br/). Built with TypeScript and powered by [deco.chat](https://deco.chat), this MCP server enables seamless automation of edge computing infrastructure through AI.

## 🌐 About Azion

[Azion](https://www.azion.com/pt-br/) is a leading edge computing platform that helps developers build, secure, and scale applications globally. With 100+ edge locations and 10Tb/s capacity, Azion provides:

- **⚡ Edge Applications**: Deploy applications closer to users worldwide
- **🔒 Edge Security**: Advanced protection with programmable security
- **📈 Performance**: Up to 10x faster applications with 15ms response times
- **🛡️ Reliability**: 100% uptime guarantee with global edge infrastructure

## 🤖 What is deco.chat?

[deco.chat](https://deco.chat) is a powerful platform for creating MCP (Model Context Protocol) tools and workflows that can automate any kind of workload. It provides:

- **🔧 Easy Tool Creation**: Build AI-accessible tools with TypeScript
- **🔄 Workflow Orchestration**: Chain tools together for complex automations
- **🌐 Global Deployment**: Deploy on Cloudflare's edge infrastructure
- **🎯 Type Safety**: Full TypeScript support with auto-generated types

## ✨ Features

- **🤖 MCP Server**: AI-accessible tools for Azion platform automation
- **🔐 Certificate Management**: Create and manage SSL/TLS certificates
- **🌍 Domain Configuration**: Set up and configure edge domains
- **🔒 mTLS Support**: Trusted CA certificate management
- **⚛️ React Frontend**: Beautiful web interface for manual operations
- **🎨 Modern UI**: Built with Tailwind CSS and shadcn/ui components
- **🔧 Type Safety**: Full TypeScript support with auto-generated types
- **🚀 Hot Reload**: Live development environment
- **☁️ Edge Deployment**: Deploy to Cloudflare Workers instantly

## 🚀 Quick Start

### Prerequisites

- Node.js ≥22.0.0
- [Deco CLI](https://deco.chat): `npm i -g deco-cli`
- Azion account and API token

### Setup

```bash
# Clone the repository
git clone https://github.com/your-org/azion-mcp-server.git
cd azion-mcp-server

# Install dependencies
npm install

# Configure your app
npm run configure

# Set up your Azion API token (required for tools to work)
# Add your token to the deco.chat workspace configuration

# Start development server
npm run dev
```

The server will start on `http://localhost:8787` serving both MCP endpoints and a React frontend for manual operations.

## 🛠️ Available MCP Tools

This server provides AI agents with the following Azion management capabilities:

### 🔐 Certificate Management
- **`AZION_CREATE_CERTIFICATE`**: Upload SSL/TLS certificates for HTTPS domains
- **`AZION_CREATE_TRUSTED_CA_CERTIFICATE`**: Manage trusted CA certificates for mTLS

### 🌍 Domain Management  
- **`AZION_CREATE_DOMAIN`**: Configure domains with edge applications, certificates, and firewalls

### Example AI Interaction
```
AI: "I need to set up SSL for example.com with Azion"
MCP: [Uses AZION_CREATE_CERTIFICATE to upload certificate]
MCP: [Uses AZION_CREATE_DOMAIN to configure the domain]
AI: "SSL setup complete! Your domain is now secured and configured."
```

## 📁 Project Structure

```
azion-mcp-server/
├── server/                    # MCP Server (Cloudflare Workers + Deco runtime)
│   ├── main.ts               # Server entry point with tools & workflows
│   ├── tools/
│   │   ├── azion.ts          # Azion platform integration tools
│   │   ├── todos.ts          # Example todo management tools
│   │   └── index.ts          # Tool aggregation
│   ├── schema.ts             # Database schema definitions
│   └── deco.gen.ts           # Auto-generated integration types
├── view/                     # React Frontend (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── lib/rpc.ts        # Typed RPC client for server communication
│   │   ├── routes/           # TanStack Router routes
│   │   ├── components/       # UI components with Tailwind CSS
│   │   └── hooks/            # TanStack Query hooks for API calls
│   └── package.json
└── AZION_MCP_TOOLS.md        # Detailed tool documentation
```

## 🛠️ Development Workflow

- **`npm run dev`** - Start development with hot reload
- **`npm run gen`** - Generate types for external integrations  
- **`npm run gen:self`** - Generate types for your own tools/workflows
- **`npm run deploy`** - Deploy to production

## 🔗 Using the MCP Server

### With AI Agents

Connect this MCP server to AI agents like Claude, ChatGPT, or other MCP-compatible clients:

```bash
# The server exposes MCP endpoints at:
# http://localhost:8787/mcp (development)
# https://your-deployed-url.workers.dev/mcp (production)
```

### Frontend Interface

Access the React frontend for manual operations:

```bash
# Local development
http://localhost:8787

# Production
https://your-deployed-url.workers.dev
```

### Programmatic Access

Use the typed RPC client for direct integration:

```typescript
import { createClient } from "@deco/workers-runtime/client";

const client = createClient<YourMCPServerType>();

// Create a certificate
const cert = await client.AZION_CREATE_CERTIFICATE({
  name: "example.com SSL",
  certificate: "-----BEGIN CERTIFICATE-----...",
  private_key: "-----BEGIN RSA PRIVATE KEY-----..."
});

// Create a domain
const domain = await client.AZION_CREATE_DOMAIN({
  name: "example.com",
  cnames: ["example.com"],
  digital_certificate_id: cert.certificate_id,
  edge_application_id: 1234567
});
```

## 🤝 Contributing

We welcome contributions from the community! This project is open source and we believe in the power of collaborative development.

### Ways to Contribute

1. **🐛 Bug Reports**: Found an issue? [Open an issue](https://github.com/your-org/azion-mcp-server/issues)
2. **✨ Feature Requests**: Have an idea? [Start a discussion](https://github.com/your-org/azion-mcp-server/discussions)
3. **🔧 Code Contributions**: Submit pull requests for new features or fixes
4. **📖 Documentation**: Help improve our docs and examples
5. **🧪 Testing**: Add tests or test the server with different AI agents

### Development Setup

```bash
# Fork the repository and clone your fork
git clone https://github.com/your-username/azion-mcp-server.git

# Create a feature branch
git checkout -b feature/amazing-new-tool

# Install dependencies
npm install

# Start development
npm run dev

# Make your changes and test thoroughly

# Commit with conventional commits
git commit -m "feat: add new Azion Edge Functions tool"

# Push and create a pull request
git push origin feature/amazing-new-tool
```

### Adding New Tools

We encourage adding more Azion API integrations! Here's how:

1. **Create the tool** in `server/tools/azion.ts`
2. **Follow our patterns**: Use existing tools as templates
3. **Add documentation** to `AZION_MCP_TOOLS.md`
4. **Test thoroughly** with real Azion APIs
5. **Submit a PR** with clear description

### Coding Standards

- **TypeScript First**: All code must be properly typed
- **Error Handling**: Implement comprehensive error handling
- **Documentation**: Document all public APIs and tools
- **Testing**: Add tests for new functionality
- **Clean Code**: Follow SOLID principles and clean code practices

### Community Guidelines

- Be respectful and inclusive
- Provide constructive feedback
- Help newcomers get started
- Share your use cases and success stories

## 📚 Resources

### Azion Documentation
- [Azion Platform Overview](https://www.azion.com/pt-br/)
- [Azion API Documentation](https://api.azion.com/)
- [Digital Certificates Guide](https://www.azion.com/en/documentation/products/guides/create-a-digital-certificate/)
- [Domains Configuration](https://www.azion.com/en/documentation/products/guides/configure-a-domain/)

### deco.chat Documentation
- [deco.chat Platform](https://deco.chat)
- [MCP Development Guide](https://docs.deco.page)
- [deco.chat GitHub Repository](https://github.com/deco-cx/chat)

### Model Context Protocol
- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [MCP Tools Development](https://docs.anthropic.com/en/docs/build-with-claude/tool-use)

## 🚀 Deployment

Deploy your MCP server to Cloudflare Workers with a single command:

```bash
npm run deploy
```

Your server will be available at a public URL and ready to connect with AI agents worldwide.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 💬 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/your-org/azion-mcp-server/issues)
- **GitHub Discussions**: [Community discussions and help](https://github.com/your-org/azion-mcp-server/discussions)
- **deco.chat Community**: [Join the deco.chat community](https://deco.chat)

---

**Ready to automate your Azion infrastructure with AI? Start contributing today! 🚀**

Built with ❤️ by the community, powered by [Azion](https://www.azion.com/pt-br/) and [deco.chat](https://deco.chat)
