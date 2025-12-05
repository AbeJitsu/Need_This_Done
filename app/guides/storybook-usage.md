# Storybook Usage Guide

This guide covers using Storybook with Next.js App Router for component documentation and testing.

## Next.js App Router Configuration

For components using `next/navigation`, the configuration is already enabled:

```javascript
// .storybook/preview.js
export const parameters = {
  nextjs: {
    appDirectory: true,
  },
};
```

## Writing Stories (TypeScript)

Basic story structure:

```typescript
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import Button from './Button';

const meta: Meta<typeof Button> = {
  component: Button,
  parameters: {
    nextjs: {
      appDirectory: true,
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'purple',
    children: 'Click me',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'blue',
    children: 'Secondary',
  },
};
```

## Mocking Next.js Navigation

When components use `useRouter` or `redirect`:

```typescript
import { expect, userEvent, within } from '@storybook/test';
import { redirect, getRouter } from '@storybook/nextjs/navigation.mock';

import MyComponent from './MyComponent';

export default {
  component: MyComponent,
  parameters: {
    nextjs: {
      appDirectory: true,
    },
  },
};

export const TestsRedirect = {
  async play() {
    await expect(redirect).toHaveBeenCalledWith('/login', 'replace');
  },
};

export const TestsBackButton = {
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    const backBtn = await canvas.findByText('Go back');
    await userEvent.click(backBtn);
    await expect(getRouter().back).toHaveBeenCalled();
  },
};
```

## Mocking Navigation Segments

For components using `useSelectedLayoutSegment` or `useParams`:

```typescript
export default {
  component: NavigationComponent,
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/dashboard',
        query: { id: '123' },
        segments: ['dashboard', 'analytics'],
      },
    },
  },
};
```

## Deploying as Static Site

Build Storybook for deployment:

```bash
npm run build-storybook
```

This outputs to `storybook-static/`. Configure Nginx to serve at `/design`:

```nginx
location /design {
    alias /path/to/storybook-static;
    try_files $uri $uri/ /design/index.html;
}
```

## Development Workflow

1. Build component in Next.js
2. Use Claude Code + context7 for fresh Storybook syntax
3. Create story file with variants (loading, error, success)
4. Run `npm run storybook` to verify
5. Component is now documented and available to Puck

## Context7 Reference

For latest Storybook docs via Claude Code:

```
Library ID: /websites/storybook_js
```

---

*See also: [Roadmap.md](../../Roadmap.md) for architecture overview*
