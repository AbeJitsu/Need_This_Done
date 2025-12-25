import type { Config } from '@measured/puck';
import type { ReactNode } from 'react';
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

// ============================================================================
// Layout Component Options
// ============================================================================

const spacerSizeOptions = [
  { label: 'Extra Small (8px)', value: 'xs' },
  { label: 'Small (16px)', value: 'sm' },
  { label: 'Medium (32px)', value: 'md' },
  { label: 'Large (48px)', value: 'lg' },
  { label: 'Extra Large (64px)', value: 'xl' },
  { label: 'Huge (96px)', value: '2xl' },
] as const;

const containerWidthOptions = [
  { label: 'Small (640px)', value: 'sm' },
  { label: 'Medium (768px)', value: 'md' },
  { label: 'Large (1024px)', value: 'lg' },
  { label: 'Extra Large (1280px)', value: 'xl' },
  { label: 'Full Width', value: 'full' },
] as const;

const containerPaddingOptions = [
  { label: 'None', value: 'none' },
  { label: 'Small', value: 'sm' },
  { label: 'Medium', value: 'md' },
  { label: 'Large', value: 'lg' },
] as const;

const columnsLayoutOptions = [
  { label: '2 Equal Columns', value: '2-col' },
  { label: '3 Equal Columns', value: '3-col' },
  { label: '4 Equal Columns', value: '4-col' },
  { label: 'Sidebar Left (1/3 + 2/3)', value: 'sidebar-left' },
  { label: 'Sidebar Right (2/3 + 1/3)', value: 'sidebar-right' },
] as const;

const gapOptions = [
  { label: 'Small (16px)', value: 'sm' },
  { label: 'Medium (24px)', value: 'md' },
  { label: 'Large (32px)', value: 'lg' },
  { label: 'Extra Large (48px)', value: 'xl' },
] as const;

const dividerStyleOptions = [
  { label: 'Solid', value: 'solid' },
  { label: 'Dashed', value: 'dashed' },
  { label: 'Gradient', value: 'gradient' },
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

    // ========================================================================
    // LAYOUT COMPONENTS
    // ========================================================================

    // ========================================================================
    // Spacer - Vertical breathing room between sections
    // ========================================================================
    Spacer: {
      fields: {
        size: {
          type: 'select',
          label: 'Size',
          options: spacerSizeOptions,
        },
      },
      defaultProps: {
        size: 'md',
      },
      render: ({ size }) => {
        const sizeMap: Record<string, string> = {
          xs: 'h-2',
          sm: 'h-4',
          md: 'h-8',
          lg: 'h-12',
          xl: 'h-16',
          '2xl': 'h-24',
        };
        return <div className={`w-full ${sizeMap[size] || 'h-8'}`} aria-hidden="true" />;
      },
    },

    // ========================================================================
    // Container - Centers content with max-width and optional padding
    // ========================================================================
    Container: {
      fields: {
        maxWidth: {
          type: 'select',
          label: 'Max Width',
          options: containerWidthOptions,
        },
        padding: {
          type: 'radio',
          label: 'Padding',
          options: containerPaddingOptions,
        },
        children: {
          type: 'textarea',
          label: 'Content',
        },
      },
      defaultProps: {
        maxWidth: 'lg',
        padding: 'md',
        children: 'Add your content here...',
      },
      render: ({ maxWidth, padding, children }) => {
        const widthMap: Record<string, string> = {
          sm: 'max-w-screen-sm',
          md: 'max-w-screen-md',
          lg: 'max-w-screen-lg',
          xl: 'max-w-screen-xl',
          full: 'max-w-full',
        };
        const paddingMap: Record<string, string> = {
          none: '',
          sm: 'px-4 py-4',
          md: 'px-6 py-6',
          lg: 'px-8 py-8',
        };
        return (
          <div className={`mx-auto w-full ${widthMap[maxWidth] || 'max-w-screen-lg'} ${paddingMap[padding] || ''}`}>
            <div className="text-gray-700 dark:text-gray-300">{children}</div>
          </div>
        );
      },
    },

    // ========================================================================
    // Columns - Multi-column responsive grid layouts
    // ========================================================================
    Columns: {
      fields: {
        layout: {
          type: 'select',
          label: 'Layout',
          options: columnsLayoutOptions,
        },
        gap: {
          type: 'radio',
          label: 'Gap Between Columns',
          options: gapOptions,
        },
        column1: {
          type: 'textarea',
          label: 'Column 1 Content',
        },
        column2: {
          type: 'textarea',
          label: 'Column 2 Content',
        },
        column3: {
          type: 'textarea',
          label: 'Column 3 Content (if applicable)',
        },
        column4: {
          type: 'textarea',
          label: 'Column 4 Content (if applicable)',
        },
      },
      defaultProps: {
        layout: '2-col',
        gap: 'md',
        column1: 'Column 1 content...',
        column2: 'Column 2 content...',
        column3: '',
        column4: '',
      },
      render: ({ layout, gap, column1, column2, column3, column4 }) => {
        const gapMap: Record<string, string> = {
          sm: 'gap-4',
          md: 'gap-6',
          lg: 'gap-8',
          xl: 'gap-12',
        };

        const layoutMap: Record<string, string> = {
          '2-col': 'grid-cols-1 md:grid-cols-2',
          '3-col': 'grid-cols-1 md:grid-cols-3',
          '4-col': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
          'sidebar-left': 'grid-cols-1 md:grid-cols-3',
          'sidebar-right': 'grid-cols-1 md:grid-cols-3',
        };

        const renderColumns = () => {
          switch (layout) {
            case '2-col':
              return (
                <>
                  <div className="text-gray-700 dark:text-gray-300">{column1}</div>
                  <div className="text-gray-700 dark:text-gray-300">{column2}</div>
                </>
              );
            case '3-col':
              return (
                <>
                  <div className="text-gray-700 dark:text-gray-300">{column1}</div>
                  <div className="text-gray-700 dark:text-gray-300">{column2}</div>
                  <div className="text-gray-700 dark:text-gray-300">{column3}</div>
                </>
              );
            case '4-col':
              return (
                <>
                  <div className="text-gray-700 dark:text-gray-300">{column1}</div>
                  <div className="text-gray-700 dark:text-gray-300">{column2}</div>
                  <div className="text-gray-700 dark:text-gray-300">{column3}</div>
                  <div className="text-gray-700 dark:text-gray-300">{column4}</div>
                </>
              );
            case 'sidebar-left':
              return (
                <>
                  <div className="md:col-span-1 text-gray-700 dark:text-gray-300">{column1}</div>
                  <div className="md:col-span-2 text-gray-700 dark:text-gray-300">{column2}</div>
                </>
              );
            case 'sidebar-right':
              return (
                <>
                  <div className="md:col-span-2 text-gray-700 dark:text-gray-300">{column1}</div>
                  <div className="md:col-span-1 text-gray-700 dark:text-gray-300">{column2}</div>
                </>
              );
            default:
              return null;
          }
        };

        return (
          <div className={`grid ${layoutMap[layout] || 'grid-cols-2'} ${gapMap[gap] || 'gap-6'}`}>
            {renderColumns()}
          </div>
        );
      },
    },

    // ========================================================================
    // Divider - Visual separation between sections
    // ========================================================================
    Divider: {
      fields: {
        style: {
          type: 'radio',
          label: 'Style',
          options: dividerStyleOptions,
        },
        color: {
          type: 'select',
          label: 'Color',
          options: colorOptions,
        },
      },
      defaultProps: {
        style: 'solid',
        color: 'gray' as AccentVariant,
      },
      render: ({ style, color }) => {
        const colorMap: Record<string, { border: string; gradient: string }> = {
          purple: {
            border: 'border-purple-300 dark:border-purple-700',
            gradient: 'from-transparent via-purple-400 to-transparent',
          },
          blue: {
            border: 'border-blue-300 dark:border-blue-700',
            gradient: 'from-transparent via-blue-400 to-transparent',
          },
          green: {
            border: 'border-green-300 dark:border-green-700',
            gradient: 'from-transparent via-green-400 to-transparent',
          },
          orange: {
            border: 'border-orange-300 dark:border-orange-700',
            gradient: 'from-transparent via-orange-400 to-transparent',
          },
          teal: {
            border: 'border-teal-300 dark:border-teal-700',
            gradient: 'from-transparent via-teal-400 to-transparent',
          },
          gray: {
            border: 'border-gray-300 dark:border-gray-600',
            gradient: 'from-transparent via-gray-400 to-transparent',
          },
        };

        const colors = colorMap[color] || colorMap.gray;

        if (style === 'gradient') {
          return (
            <div className="py-4" aria-hidden="true">
              <div className={`h-px bg-gradient-to-r ${colors.gradient}`} />
            </div>
          );
        }

        return (
          <div className="py-4" aria-hidden="true">
            <hr
              className={`border-t ${style === 'dashed' ? 'border-dashed' : 'border-solid'} ${colors.border}`}
            />
          </div>
        );
      },
    },

    // ========================================================================
    // Text Block - Rich text content with styling options
    // ========================================================================
    TextBlock: {
      fields: {
        content: {
          type: 'textarea',
          label: 'Content',
        },
        size: {
          type: 'radio',
          label: 'Text Size',
          options: [
            { label: 'Small', value: 'sm' },
            { label: 'Base', value: 'base' },
            { label: 'Large', value: 'lg' },
            { label: 'Extra Large', value: 'xl' },
          ],
        },
        align: {
          type: 'radio',
          label: 'Alignment',
          options: [
            { label: 'Left', value: 'left' },
            { label: 'Center', value: 'center' },
            { label: 'Right', value: 'right' },
          ],
        },
      },
      defaultProps: {
        content: 'Your text content goes here. Write something amazing!',
        size: 'base',
        align: 'left',
      },
      render: ({ content, size, align }) => {
        const sizeMap: Record<string, string> = {
          sm: 'text-sm',
          base: 'text-base',
          lg: 'text-lg',
          xl: 'text-xl',
        };
        const alignMap: Record<string, string> = {
          left: 'text-left',
          center: 'text-center',
          right: 'text-right',
        };
        return (
          <p
            className={`text-gray-700 dark:text-gray-300 leading-relaxed ${sizeMap[size] || 'text-base'} ${alignMap[align] || 'text-left'}`}
          >
            {content}
          </p>
        );
      },
    },
  },

  // ============================================================================
  // Component Categories for Better Organization in Editor
  // ============================================================================
  categories: {
    layout: {
      title: 'Layout',
      components: ['Spacer', 'Container', 'Columns', 'Divider'],
    },
    content: {
      title: 'Content',
      components: ['TextBlock', 'PageHeader', 'CTASection'],
    },
    interactive: {
      title: 'Interactive',
      components: ['Button', 'Card', 'CircleBadge'],
    },
  },
};
