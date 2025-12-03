# Puck Setup Guide

This guide covers integrating Puck visual page builder with Next.js for drag-and-drop page composition.

## Overview

Puck enables non-developers to compose layouts dynamically using your existing React components, without touching code.

## Installation

```bash
npm install @measured/puck
```

## Creating the Config File

Define which components are available in the editor:

```typescript
// puck.config.tsx
import type { Config } from '@measured/puck';

// Import your existing components
import Button from '@/components/Button';
import Card from '@/components/Card';
import PageHeader from '@/components/PageHeader';

type Components = {
  PageHeader: { title: string; description?: string };
  Card: { children: string; hoverColor?: string };
  Button: { text: string; variant: string; href: string };
};

export const config: Config<Components> = {
  components: {
    PageHeader: {
      fields: {
        title: { type: 'text' },
        description: { type: 'textarea' },
      },
      defaultProps: {
        title: 'Page Title',
      },
      render: ({ title, description }) => (
        <PageHeader title={title} description={description} />
      ),
    },
    Card: {
      fields: {
        children: { type: 'textarea' },
        hoverColor: {
          type: 'select',
          options: [
            { label: 'Purple', value: 'purple' },
            { label: 'Blue', value: 'blue' },
            { label: 'Orange', value: 'orange' },
          ],
        },
      },
      render: ({ children, hoverColor }) => (
        <Card hoverColor={hoverColor}>{children}</Card>
      ),
    },
    Button: {
      fields: {
        text: { type: 'text' },
        variant: {
          type: 'select',
          options: [
            { label: 'Purple', value: 'purple' },
            { label: 'Orange', value: 'orange' },
            { label: 'Teal', value: 'teal' },
          ],
        },
        href: { type: 'text' },
      },
      defaultProps: {
        text: 'Click me',
        variant: 'purple',
        href: '/',
      },
      render: ({ text, variant, href }) => (
        <Button variant={variant} href={href}>{text}</Button>
      ),
    },
  },
};
```

## Root Component (Layout Wrapper)

Configure a root component that wraps all content:

```typescript
// In puck.config.tsx
export const config: Config = {
  root: {
    render: ({ children }) => (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        {children}
      </main>
    ),
  },
  components: {
    // ... your components
  },
};
```

## Server-Side Rendering

Render Puck pages on the server:

```typescript
// app/[...puckPath]/page.tsx
import { Render } from '@measured/puck';
import { config } from '@/puck.config';

async function getData(path: string) {
  // Fetch page data from your database/CMS
  // Return the Puck data structure
}

export default async function Page({ params }: { params: { puckPath: string[] } }) {
  const path = params.puckPath?.join('/') || '';
  const data = await getData(path);

  return <Render data={data} config={config} />;
}

// Optional: Force static generation
export const dynamic = 'force-static';
```

## Editor Page (Admin Only)

Create an editor route for content creators:

```typescript
// app/puck/[...puckPath]/page.tsx
// IMPORTANT: Protect this route with authentication

'use client';

import { Puck } from '@measured/puck';
import { config } from '@/puck.config';

export default function Editor() {
  return (
    <Puck
      config={config}
      data={{}} // Load existing data here
      onPublish={async (data) => {
        // Save to database
        console.log('Publishing:', data);
      }}
    />
  );
}
```

## Dynamic Routes Configuration

```typescript
// app/[...puckPath]/page.tsx
export const dynamic = 'force-static'; // Strips headers/cookies
// Remove this line if you need dynamic content
```

## Making Components Available to Puck

To expose an existing component to Puck:

1. Add it to `puck.config.tsx` with field definitions
2. Define `defaultProps` for a sensible starting state
3. Map the `render` function to your component

Example with existing ServiceCard:

```typescript
import ServiceCard from '@/components/ServiceCard';

// In config.components:
ServiceCard: {
  fields: {
    title: { type: 'text' },
    description: { type: 'textarea' },
    icon: { type: 'text' },
    color: {
      type: 'select',
      options: [
        { label: 'Purple', value: 'purple' },
        { label: 'Blue', value: 'blue' },
      ],
    },
  },
  defaultProps: {
    title: 'Service',
    description: 'Description here',
    icon: 'star',
    color: 'purple',
  },
  render: (props) => <ServiceCard {...props} />,
},
```

## Context7 Reference

For latest Puck docs via Claude Code:

```
Library ID: /measuredco/puck
```

---

*See also: [Roadmap.md](../../Roadmap.md) for architecture overview*
