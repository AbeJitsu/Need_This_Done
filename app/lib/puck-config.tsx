import type { Config } from '@measured/puck';
import Button from '@/components/Button';
import Card from '@/components/Card';
import PageHeader from '@/components/PageHeader';
import CTASection from '@/components/CTASection';
import CircleBadge from '@/components/CircleBadge';
import type { AccentVariant } from '@/lib/colors';

// ============================================================================
// Puck Configuration - Visual Editor Component Library
// ============================================================================
// What: Maps our Tier 1 React components to Puck's drag-and-drop editor
// Why: Enables visual page building without code changes
// How: Defines field types (text, textarea, select, etc.) for each component

const colorOptions = [
  { label: 'Purple', value: 'purple' },
  { label: 'Blue', value: 'blue' },
  { label: 'Green', value: 'green' },
  { label: 'Orange', value: 'orange' },
  { label: 'Teal', value: 'teal' },
  { label: 'Gray', value: 'gray' },
] as const;

const buttonSizeOptions = [
  { label: 'Small', value: 'sm' },
  { label: 'Medium', value: 'md' },
  { label: 'Large', value: 'lg' },
] as const;

const badgeSizeOptions = [
  { label: 'Small', value: 'sm' },
  { label: 'Medium', value: 'md' },
  { label: 'Large', value: 'lg' },
] as const;

const hoverEffectOptions = [
  { label: 'Lift', value: 'lift' },
  { label: 'Glow', value: 'glow' },
  { label: 'Tint', value: 'tint' },
  { label: 'None', value: 'none' },
] as const;

export const puckConfig: Config = {
  components: {
    // ========================================================================
    // Button Component
    // ========================================================================
    Button: {
      fields: {
        children: {
          type: 'text',
          label: 'Button Text',
        },
        variant: {
          type: 'select',
          label: 'Color',
          options: colorOptions,
        },
        size: {
          type: 'radio',
          label: 'Size',
          options: buttonSizeOptions,
        },
        href: {
          type: 'text',
          label: 'Link URL (optional)',
        },
      },
      defaultProps: {
        children: 'Click me',
        variant: 'blue' as AccentVariant,
        size: 'md',
      },
      render: ({ children, variant, size, href }) => (
        <Button variant={variant as AccentVariant} size={size as 'sm' | 'md' | 'lg'} href={href}>
          {children}
        </Button>
      ),
    },

    // ========================================================================
    // Card Component
    // ========================================================================
    Card: {
      fields: {
        children: {
          type: 'textarea',
          label: 'Content',
        },
        hoverColor: {
          type: 'select',
          label: 'Hover Color',
          options: colorOptions,
        },
        hoverEffect: {
          type: 'radio',
          label: 'Hover Effect',
          options: hoverEffectOptions,
        },
      },
      defaultProps: {
        children: 'Card content goes here',
        hoverColor: 'purple' as AccentVariant,
        hoverEffect: 'lift',
      },
      render: ({ children, hoverColor, hoverEffect }) => (
        <Card
          hoverColor={hoverColor as AccentVariant}
          hoverEffect={hoverEffect as 'lift' | 'glow' | 'tint' | 'none'}
        >
          <div className="p-6">{children}</div>
        </Card>
      ),
    },

    // ========================================================================
    // PageHeader Component
    // ========================================================================
    PageHeader: {
      fields: {
        title: {
          type: 'text',
          label: 'Title',
        },
        description: {
          type: 'textarea',
          label: 'Description (optional)',
        },
      },
      defaultProps: {
        title: 'Page Title',
      },
      render: ({ title, description }) => (
        <PageHeader title={title} description={description} />
      ),
    },

    // ========================================================================
    // CTASection Component
    // ========================================================================
    CTASection: {
      fields: {
        title: {
          type: 'text',
          label: 'Title',
        },
        description: {
          type: 'textarea',
          label: 'Description (optional)',
        },
        buttons: {
          type: 'array',
          label: 'Buttons',
          arrayFields: {
            text: {
              type: 'text',
              label: 'Button Text',
            },
            variant: {
              type: 'select',
              label: 'Color',
              options: colorOptions,
            },
            href: {
              type: 'text',
              label: 'Link URL',
            },
            size: {
              type: 'radio',
              label: 'Size',
              options: buttonSizeOptions,
            },
          },
          defaultItemProps: {
            text: 'Button',
            variant: 'blue' as AccentVariant,
            size: 'md',
            href: '#',
          },
        },
        hoverColor: {
          type: 'select',
          label: 'Card Hover Color',
          options: colorOptions,
        },
      },
      defaultProps: {
        title: 'Ready to get started?',
        buttons: [],
        hoverColor: 'orange' as AccentVariant,
      },
      render: ({ title, description, buttons, hoverColor }) => (
        <CTASection
          title={title}
          description={description}
          buttons={buttons}
          hoverColor={hoverColor as AccentVariant}
        />
      ),
    },

    // ========================================================================
    // CircleBadge Component
    // ========================================================================
    CircleBadge: {
      fields: {
        number: {
          type: 'number',
          label: 'Number',
        },
        color: {
          type: 'select',
          label: 'Color',
          options: colorOptions,
        },
        size: {
          type: 'radio',
          label: 'Size',
          options: badgeSizeOptions,
        },
      },
      defaultProps: {
        number: 1,
        color: 'purple' as AccentVariant,
        size: 'md',
      },
      render: ({ number, color, size }) => (
        <CircleBadge number={number} color={color as AccentVariant} size={size as 'sm' | 'md' | 'lg'} />
      ),
    },
  },
};
