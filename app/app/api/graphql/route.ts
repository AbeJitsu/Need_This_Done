export const dynamic = 'force-dynamic';

// ============================================================================
// GraphQL API Route - /api/graphql
// ============================================================================
// A simple GraphQL endpoint exposing service data.
// Why GraphQL here: Demonstrates the technology while providing a flexible
// query interface for service information.
//
// Usage:
//   POST /api/graphql with query body
//   GET /api/graphql for GraphiQL playground (dev only)

import { createSchema, createYoga } from 'graphql-yoga';
import {
  serviceFullContentMap,
  ServiceFullContent,
  ServiceType,
} from '@/lib/service-modal-content';

// ============================================================================
// GraphQL Schema Definition
// ============================================================================

const typeDefs = /* GraphQL */ `
  """
  Call-to-action button with text and destination
  """
  type CTA {
    text: String!
    href: String!
  }

  """
  Primary and secondary call-to-action buttons
  """
  type CTAs {
    primary: CTA!
    secondary: CTA!
  }

  """
  Example work items for a service
  """
  type Examples {
    title: String!
    items: [String!]!
  }

  """
  A service offered by Need This Done
  """
  type Service {
    id: ID!
    title: String!
    headline: String!
    subtitle: String!
    bulletPoints: [String!]!
    examples: Examples!
    reassurance: String!
    ctas: CTAs!
  }

  """
  Root query type
  """
  type Query {
    """
    Get all available services
    """
    services: [Service!]!

    """
    Get a specific service by ID (virtual-assistant, data-documents, website-services)
    """
    service(id: ID!): Service
  }
`;

// ============================================================================
// Resolvers - Connect Schema to Data
// ============================================================================

// Transform our service data to include the ID
function serviceToGraphQL(id: ServiceType, data: ServiceFullContent) {
  return {
    id,
    ...data,
  };
}

const resolvers = {
  Query: {
    // Return all services
    services: () => {
      return Object.entries(serviceFullContentMap).map(([id, data]) =>
        serviceToGraphQL(id as ServiceType, data)
      );
    },

    // Return a specific service by ID
    service: (_: unknown, { id }: { id: string }) => {
      const data = serviceFullContentMap[id as ServiceType];
      if (!data) return null;
      return serviceToGraphQL(id as ServiceType, data);
    },
  },
};

// ============================================================================
// Create Yoga Server Instance
// ============================================================================

const schema = createSchema({
  typeDefs,
  resolvers,
});

const { handleRequest } = createYoga({
  schema,
  graphqlEndpoint: '/api/graphql',
  // Enable GraphiQL playground in development
  graphiql: process.env.NODE_ENV === 'development',
  fetchAPI: { Response },
});

// ============================================================================
// Next.js Route Handlers
// ============================================================================

// Keep Yoga's framework-neutral handler behind Next's route-handler shape.
// Next 16 validates the optional second argument as a route context, while
// Yoga uses its own context type.
export async function GET(request: Request) {
  return handleRequest(request, {});
}

export async function POST(request: Request) {
  return handleRequest(request, {});
}
