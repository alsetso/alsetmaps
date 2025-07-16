import { useParams } from "react-router-dom";
import { DocumentLayout } from "@/components/DocumentLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

// Documentation content
const docsContent = {
  "quickstart": {
    title: "Quick Start Guide",
    description: "Get up and running with alset in minutes",
    category: "Getting Started",
    readTime: "5 min",
    lastUpdated: "2 days ago",
    content: `# Quick Start Guide

Welcome to alset! This guide will help you get started with our platform quickly and efficiently.

## Overview

alset is a comprehensive automation platform that helps you build intelligent workflows, create AI assistants, and manage data endpoints seamlessly.

## Getting Started

### Step 1: Create Your Account
First, sign up for an alset account and verify your email address.

### Step 2: Set Up Your First Endpoint
Endpoints are the foundation of your automation workflows. They receive data from external sources and trigger your automations.

1. Navigate to the Dashboard
2. Click on "API Endpoints"
3. Create your first endpoint
4. Configure your webhook settings

### Step 3: Build Your First Workflow
Once you have an endpoint, you can create workflows that respond to incoming data.

### Step 4: Deploy an AI Assistant
Create intelligent assistants that can handle tasks autonomously.

## Next Steps

- Explore the [Platform Overview](/docs/overview)
- Learn about [Account Setup](/docs/setup)
- Check out our [API Reference](/docs/auth)`
  },
  "overview": {
    title: "Platform Overview",
    description: "Understanding alset's core components and architecture",
    category: "Getting Started", 
    readTime: "8 min",
    lastUpdated: "3 days ago",
    content: `# Platform Overview

alset is designed to simplify complex automation and AI integration workflows. Our platform consists of several key components that work together seamlessly.

## Core Components

### Endpoints
Universal data intake layer that can receive inputs from any system, format, or source.

### Workflows  
Automation engine with low-code logic builder for creating intelligent sequences.

### AI Assistants
Voice and text-based digital agents that can engage, respond, and execute actions.

### Intelligence
Real-time analytics and insights across your entire platform.

### Memory
Persistent knowledge graph tracking every action and event.

## Architecture

Our platform follows a microservices architecture that ensures scalability, reliability, and security.

## Integration Capabilities

Connect with hundreds of third-party services and APIs through our integration framework.`
  },
  "setup": {
    title: "Account Setup",
    description: "Configure your account and initial settings",
    category: "Getting Started",
    readTime: "4 min", 
    lastUpdated: "1 week ago",
    content: `# Account Setup

Complete your alset account configuration to get the most out of our platform.

## Profile Configuration

### Personal Information
Update your profile with relevant information for better personalization.

### Organization Settings
If you're part of an organization, configure your role and permissions.

## Security Settings

### Two-Factor Authentication
Enable 2FA for enhanced security of your account.

### API Keys
Generate and manage API keys for programmatic access.

## Notification Preferences

Configure how and when you want to receive notifications about your automations.

## Billing Setup

Set up your billing information and choose the plan that works best for you.`
  },
  "auth": {
    title: "Authentication",
    description: "Secure authentication methods and API access",
    category: "API Reference",
    readTime: "6 min",
    lastUpdated: "1 day ago", 
    content: `# Authentication

alset uses secure authentication methods to protect your data and ensure authorized access.

## API Authentication

### API Keys
Use API keys for server-to-server authentication:

\`\`\`bash
curl -H "Authorization: Bearer YOUR_API_KEY" \\
     https://api.alset.com/v1/endpoints
\`\`\`

### OAuth 2.0
For applications requiring user authorization, use OAuth 2.0 flow.

## Authentication Headers

All API requests must include proper authentication headers:

\`\`\`
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
\`\`\`

## Rate Limiting

API calls are rate limited to ensure fair usage:
- 1000 requests per hour for free tier
- 10,000 requests per hour for pro tier
- Custom limits for enterprise

## Security Best Practices

- Store API keys securely
- Use HTTPS for all requests
- Rotate keys regularly
- Monitor API usage`
  },
  "endpoints-api": {
    title: "Endpoints API",
    description: "Complete reference for the Endpoints API",
    category: "API Reference",
    readTime: "10 min",
    lastUpdated: "2 days ago",
    content: `# Endpoints API

The Endpoints API allows you to manage your data intake endpoints programmatically.

## Base URL
\`\`\`
https://api.alset.com/v1/endpoints
\`\`\`

## Endpoints

### List Endpoints
\`\`\`http
GET /endpoints
\`\`\`

Returns a list of all your endpoints.

### Create Endpoint
\`\`\`http
POST /endpoints
\`\`\`

Create a new endpoint for data intake.

**Request Body:**
\`\`\`json
{
  "name": "My Endpoint",
  "description": "Handles customer data",
  "settings": {
    "auto_process": true,
    "format": "json"
  }
}
\`\`\`

### Get Endpoint
\`\`\`http
GET /endpoints/{id}
\`\`\`

Retrieve details for a specific endpoint.

### Update Endpoint
\`\`\`http
PUT /endpoints/{id}
\`\`\`

Update an existing endpoint.

### Delete Endpoint
\`\`\`http
DELETE /endpoints/{id}
\`\`\`

Delete an endpoint (this action cannot be undone).

## Response Format

All API responses follow this format:
\`\`\`json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully"
}
\`\`\``
  },
  "webhooks": {
    title: "Webhooks",
    description: "Setting up and managing webhook integrations",
    category: "API Reference", 
    readTime: "7 min",
    lastUpdated: "5 days ago",
    content: `# Webhooks

Webhooks allow external services to notify your alset endpoints when events occur.

## Webhook Setup

### 1. Create an Endpoint
First, create an endpoint in your alset dashboard.

### 2. Configure Webhook URL
Use your endpoint URL in the external service:
\`\`\`
https://api.alset.com/v1/webhooks/YOUR_ENDPOINT_ID
\`\`\`

### 3. Set Webhook Secret
For security, configure a webhook secret in both alset and the external service.

## Webhook Security

### Signature Verification
Verify webhook signatures to ensure authenticity:

\`\`\`javascript
const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return signature === expectedSignature;
}
\`\`\`

## Common Webhook Patterns

### Event Processing
Process incoming webhook data and trigger workflows.

### Data Transformation  
Transform webhook data into your desired format.

### Error Handling
Implement proper error handling and retry logic.

## Testing Webhooks

Use tools like ngrok for local webhook testing during development.`
  },
  "first-agent": {
    title: "Building Your First Agent",
    description: "Step-by-step guide to creating an AI agent",
    category: "Guides & Tutorials",
    readTime: "12 min",
    lastUpdated: "3 days ago",
    content: `# Building Your First Agent

Learn how to create your first AI agent in alset with this comprehensive guide.

## Overview

AI Agents in alset are intelligent assistants that can perform tasks autonomously based on triggers and conditions you define.

## Step 1: Agent Planning

Before creating your agent, plan its purpose:
- What tasks will it perform?
- What triggers will activate it?
- How will it respond to different scenarios?

## Step 2: Create the Agent

### Basic Configuration
1. Navigate to AI Agents in your dashboard
2. Click "Create New Agent"
3. Choose a name and description
4. Select the agent type (voice, text, or both)

### Personality Setup
Configure your agent's personality:
- Tone of voice
- Response style
- Expertise areas
- Conversation limits

## Step 3: Define Triggers

Set up conditions that will activate your agent:
- Incoming data from endpoints
- Time-based schedules
- User interactions
- External API events

## Step 4: Configure Actions

Define what your agent can do:
- Send messages
- Make API calls
- Update databases
- Trigger workflows
- Create tasks

## Step 5: Testing

Test your agent thoroughly:
- Simulate different scenarios
- Check response accuracy
- Verify integrations work
- Monitor performance

## Step 6: Deployment

Deploy your agent and monitor its performance:
- Enable the agent
- Set up monitoring
- Configure logging
- Plan maintenance

## Best Practices

- Start simple and iterate
- Test extensively before deployment
- Monitor agent performance
- Keep training data updated
- Regular maintenance and updates`
  },
  "integration-patterns": {
    title: "Data Integration Patterns", 
    description: "Common patterns for integrating data sources",
    category: "Guides & Tutorials",
    readTime: "9 min",
    lastUpdated: "1 week ago",
    content: `# Data Integration Patterns

Learn proven patterns for integrating various data sources with alset.

## Common Integration Patterns

### 1. Webhook Integration
Direct real-time data flow from external services.

**Use Cases:**
- CRM updates
- Payment notifications
- Form submissions
- API events

**Implementation:**
\`\`\`javascript
// Webhook handler example
app.post('/webhook', (req, res) => {
  const data = req.body;
  
  // Process and forward to alset
  alset.endpoints.send(data);
  
  res.status(200).send('OK');
});
\`\`\`

### 2. Scheduled Polling
Regular data fetching from APIs that don't support webhooks.

**Use Cases:**
- Database synchronization
- File monitoring
- API polling
- Batch processing

### 3. File Upload Processing
Handle file uploads and extract data automatically.

**Use Cases:**
- Document processing
- Image analysis
- Data import
- Report generation

### 4. Email Integration
Process incoming emails and extract structured data.

**Use Cases:**
- Support ticket creation
- Order processing
- Document receipt
- Communication tracking

## Advanced Patterns

### Event-Driven Architecture
Build reactive systems that respond to events across your infrastructure.

### Data Transformation Pipelines
Clean, validate, and transform data before processing.

### Multi-Source Aggregation
Combine data from multiple sources for comprehensive insights.

## Best Practices

- Design for idempotency
- Implement proper error handling
- Use appropriate retry strategies
- Monitor data quality
- Maintain data lineage`
  },
  "best-practices": {
    title: "Best Practices",
    description: "Proven strategies for successful automation",
    category: "Guides & Tutorials",
    readTime: "11 min", 
    lastUpdated: "4 days ago",
    content: `# Best Practices

Follow these best practices to build robust and maintainable automation workflows.

## Workflow Design

### Keep It Simple
Start with simple workflows and add complexity gradually.

### Single Responsibility
Each workflow should have a clear, single purpose.

### Error Handling
Always plan for failure scenarios:
- Network timeouts
- API errors
- Data validation failures
- Resource limitations

### Testing Strategy
- Unit test individual components
- Integration test full workflows
- Load test under realistic conditions
- Monitor in production

## Data Management

### Data Validation
Validate all incoming data:
\`\`\`javascript
function validateData(data) {
  if (!data.email || !isValidEmail(data.email)) {
    throw new Error('Invalid email address');
  }
  
  if (!data.timestamp || isNaN(Date.parse(data.timestamp))) {
    throw new Error('Invalid timestamp');
  }
  
  return true;
}
\`\`\`

### Data Privacy
- Encrypt sensitive data
- Implement access controls
- Follow GDPR/CCPA requirements
- Regular data audits

## Security

### Authentication
- Use strong authentication methods
- Rotate credentials regularly
- Implement least privilege access
- Monitor authentication events

### API Security
- Rate limiting
- Input validation
- Output sanitization
- HTTPS everywhere

## Performance

### Optimization Strategies
- Cache frequently accessed data
- Use async processing where possible
- Implement circuit breakers
- Monitor resource usage

### Scaling Considerations
- Design for horizontal scaling
- Use message queues for decoupling
- Implement proper monitoring
- Plan capacity requirements

## Monitoring and Maintenance

### Observability
- Comprehensive logging
- Metrics collection
- Error tracking
- Performance monitoring

### Maintenance
- Regular updates
- Security patches
- Performance tuning
- Documentation updates

## Documentation

### Keep Documentation Current
- Update with code changes
- Include examples
- Document edge cases
- Provide troubleshooting guides`
  }
};

export default function DocsTemplate() {
  const { id } = useParams<{ id: string }>();
  
  if (!id || !docsContent[id as keyof typeof docsContent]) {
    return (
      <DocumentLayout currentPage="docs">
        <div className="max-w-4xl mx-auto py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold mb-4">Documentation Not Found</h1>
              <p className="text-muted-foreground mb-6">The requested documentation page could not be found.</p>
              <Button asChild>
                <Link to="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </DocumentLayout>
    );
  }

  const doc = docsContent[id as keyof typeof docsContent];

  return (
    <DocumentLayout currentPage="docs">
      <div className="max-w-4xl mx-auto py-8">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          
          <div className="space-y-4">
            <Badge variant="secondary">{doc.category}</Badge>
            <h1 className="text-4xl font-bold tracking-tight">{doc.title}</h1>
            <p className="text-xl text-muted-foreground">{doc.description}</p>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{doc.readTime} read</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Updated {doc.lastUpdated}</span>
              </div>
            </div>
          </div>
        </div>

        <Card>
          <CardContent className="p-8">
            <div className="prose prose-gray max-w-none dark:prose-invert">
              <div dangerouslySetInnerHTML={{ 
                __html: doc.content
                  .replace(/^# /gm, '<h1 class="text-3xl font-bold mt-8 mb-4">')
                  .replace(/^## /gm, '<h2 class="text-2xl font-semibold mt-6 mb-3">')
                  .replace(/^### /gm, '<h3 class="text-xl font-medium mt-4 mb-2">')
                  .replace(/\n\n/g, '</p><p class="mb-4">')
                  .replace(/^\*\*(.*?)\*\*/gm, '<strong>$1</strong>')
                  .replace(/^- (.*)/gm, '<li class="mb-1">$1</li>')
                  .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-muted p-4 rounded-lg overflow-x-auto mb-4"><code class="text-sm">$2</code></pre>')
                  .replace(/`([^`]+)`/g, '<code class="bg-muted px-2 py-1 rounded text-sm">$1</code>')
                  .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline">$1</a>')
                  .split('\n')
                  .map(line => {
                    if (line.startsWith('<li')) {
                      return line;
                    }
                    if (line.startsWith('<h') || line.startsWith('<pre') || line.startsWith('<code')) {
                      return line;
                    }
                    if (line.trim() === '') {
                      return '';
                    }
                    return `<p class="mb-4">${line}</p>`;
                  })
                  .join('')
                  .replace(/(<li.*?<\/li>\s*)+/g, '<ul class="list-disc pl-6 mb-4">$&</ul>')
              }} 
            />
            </div>
          </CardContent>
        </Card>
      </div>
    </DocumentLayout>
  );
}