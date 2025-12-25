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

    // ========================================================================
    // MEDIA COMPONENTS
    // ========================================================================

    // ========================================================================
    // Image - Single image with caption and link
    // ========================================================================
    Image: {
      fields: {
        src: {
          type: 'text',
          label: 'Image URL (paste from Media Library)',
        },
        alt: {
          type: 'text',
          label: 'Alt Text (for accessibility)',
        },
        caption: {
          type: 'text',
          label: 'Caption (optional)',
        },
        size: {
          type: 'select',
          label: 'Size',
          options: [
            { label: 'Small (300px)', value: 'sm' },
            { label: 'Medium (500px)', value: 'md' },
            { label: 'Large (800px)', value: 'lg' },
            { label: 'Full Width', value: 'full' },
          ],
        },
        rounded: {
          type: 'radio',
          label: 'Corners',
          options: [
            { label: 'None', value: 'none' },
            { label: 'Rounded', value: 'rounded' },
            { label: 'Circle', value: 'circle' },
          ],
        },
        href: {
          type: 'text',
          label: 'Link URL (optional)',
        },
      },
      defaultProps: {
        src: '',
        alt: 'Image description',
        size: 'md',
        rounded: 'rounded',
      },
      render: ({ src, alt, caption, size, rounded, href }) => {
        const sizeMap: Record<string, string> = {
          sm: 'max-w-[300px]',
          md: 'max-w-[500px]',
          lg: 'max-w-[800px]',
          full: 'w-full',
        };
        const roundedMap: Record<string, string> = {
          none: '',
          rounded: 'rounded-xl',
          circle: 'rounded-full',
        };

        if (!src) {
          return (
            <div className={`${sizeMap[size]} mx-auto bg-gray-100 dark:bg-gray-800 ${roundedMap[rounded]} aspect-video flex items-center justify-center`}>
              <span className="text-gray-400 text-sm">Add image URL</span>
            </div>
          );
        }

        const image = (
          <figure className={`${sizeMap[size]} mx-auto`}>
            <img
              src={src}
              alt={alt || ''}
              className={`w-full h-auto ${roundedMap[rounded]} shadow-md`}
            />
            {caption && (
              <figcaption className="mt-2 text-sm text-center text-gray-500 dark:text-gray-400">
                {caption}
              </figcaption>
            )}
          </figure>
        );

        if (href) {
          return (
            <a href={href} className="block hover:opacity-90 transition-opacity">
              {image}
            </a>
          );
        }

        return image;
      },
    },

    // ========================================================================
    // Hero - Full-width banner with overlay text
    // ========================================================================
    Hero: {
      fields: {
        backgroundImage: {
          type: 'text',
          label: 'Background Image URL',
        },
        title: {
          type: 'text',
          label: 'Title',
        },
        subtitle: {
          type: 'textarea',
          label: 'Subtitle',
        },
        height: {
          type: 'select',
          label: 'Height',
          options: [
            { label: 'Small (300px)', value: 'sm' },
            { label: 'Medium (400px)', value: 'md' },
            { label: 'Large (500px)', value: 'lg' },
            { label: 'Extra Large (600px)', value: 'xl' },
            { label: 'Full Screen', value: 'full' },
          ],
        },
        overlay: {
          type: 'select',
          label: 'Overlay Darkness',
          options: [
            { label: 'None', value: 'none' },
            { label: 'Light', value: 'light' },
            { label: 'Medium', value: 'medium' },
            { label: 'Dark', value: 'dark' },
          ],
        },
        align: {
          type: 'radio',
          label: 'Text Alignment',
          options: [
            { label: 'Left', value: 'left' },
            { label: 'Center', value: 'center' },
            { label: 'Right', value: 'right' },
          ],
        },
        buttonText: {
          type: 'text',
          label: 'Button Text (optional)',
        },
        buttonLink: {
          type: 'text',
          label: 'Button Link',
        },
        buttonColor: {
          type: 'select',
          label: 'Button Color',
          options: colorOptions,
        },
      },
      defaultProps: {
        title: 'Your Hero Title',
        subtitle: 'Add a compelling subtitle here',
        height: 'lg',
        overlay: 'medium',
        align: 'center',
        buttonColor: 'purple' as AccentVariant,
      },
      render: ({ backgroundImage, title, subtitle, height, overlay, align, buttonText, buttonLink, buttonColor }) => {
        const heightMap: Record<string, string> = {
          sm: 'h-[300px]',
          md: 'h-[400px]',
          lg: 'h-[500px]',
          xl: 'h-[600px]',
          full: 'h-screen',
        };
        const overlayMap: Record<string, string> = {
          none: '',
          light: 'bg-black/20',
          medium: 'bg-black/40',
          dark: 'bg-black/60',
        };
        const alignMap: Record<string, string> = {
          left: 'items-start text-left',
          center: 'items-center text-center',
          right: 'items-end text-right',
        };

        return (
          <div
            className={`relative w-full ${heightMap[height]} bg-cover bg-center`}
            style={{ backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined }}
          >
            {/* Overlay */}
            <div className={`absolute inset-0 ${overlayMap[overlay]}`} />

            {/* Content */}
            <div className={`relative h-full flex flex-col justify-center ${alignMap[align]} px-8 md:px-16 max-w-5xl mx-auto`}>
              {title && (
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-lg md:text-xl text-white/90 max-w-2xl mb-6 drop-shadow">
                  {subtitle}
                </p>
              )}
              {buttonText && (
                <a
                  href={buttonLink || '#'}
                  className={`inline-flex items-center px-6 py-3 text-lg font-semibold rounded-lg shadow-lg transition-all hover:scale-105 bg-${buttonColor}-600 hover:bg-${buttonColor}-700 text-white`}
                >
                  {buttonText}
                </a>
              )}
            </div>

            {/* Placeholder if no image */}
            {!backgroundImage && (
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600" />
            )}
          </div>
        );
      },
    },

    // ========================================================================
    // ImageText - Side-by-side image and text
    // ========================================================================
    ImageText: {
      fields: {
        image: {
          type: 'text',
          label: 'Image URL',
        },
        imageAlt: {
          type: 'text',
          label: 'Image Alt Text',
        },
        title: {
          type: 'text',
          label: 'Title',
        },
        content: {
          type: 'textarea',
          label: 'Content',
        },
        layout: {
          type: 'radio',
          label: 'Layout',
          options: [
            { label: 'Image Left', value: 'left' },
            { label: 'Image Right', value: 'right' },
          ],
        },
        imageSize: {
          type: 'select',
          label: 'Image Size',
          options: [
            { label: 'Small (1/3)', value: 'sm' },
            { label: 'Medium (1/2)', value: 'md' },
            { label: 'Large (2/3)', value: 'lg' },
          ],
        },
        buttonText: {
          type: 'text',
          label: 'Button Text (optional)',
        },
        buttonLink: {
          type: 'text',
          label: 'Button Link',
        },
        buttonColor: {
          type: 'select',
          label: 'Button Color',
          options: colorOptions,
        },
      },
      defaultProps: {
        title: 'Section Title',
        content: 'Add your content here. Describe your product, service, or idea in a compelling way.',
        layout: 'left',
        imageSize: 'md',
        buttonColor: 'purple' as AccentVariant,
      },
      render: ({ image, imageAlt, title, content, layout, imageSize, buttonText, buttonLink, buttonColor }) => {
        const imageSizeMap: Record<string, string> = {
          sm: 'md:w-1/3',
          md: 'md:w-1/2',
          lg: 'md:w-2/3',
        };
        const contentSizeMap: Record<string, string> = {
          sm: 'md:w-2/3',
          md: 'md:w-1/2',
          lg: 'md:w-1/3',
        };

        const imageElement = (
          <div className={`w-full ${imageSizeMap[imageSize]} flex-shrink-0`}>
            {image ? (
              <img src={image} alt={imageAlt || ''} className="w-full h-auto rounded-xl shadow-lg" />
            ) : (
              <div className="w-full aspect-video bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                <span className="text-gray-400 text-sm">Add image URL</span>
              </div>
            )}
          </div>
        );

        const contentElement = (
          <div className={`w-full ${contentSizeMap[imageSize]} flex flex-col justify-center`}>
            {title && (
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {title}
              </h2>
            )}
            {content && (
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                {content}
              </p>
            )}
            {buttonText && (
              <a
                href={buttonLink || '#'}
                className={`inline-flex items-center px-5 py-2.5 font-medium rounded-lg transition-colors bg-${buttonColor}-600 hover:bg-${buttonColor}-700 text-white w-fit`}
              >
                {buttonText}
              </a>
            )}
          </div>
        );

        return (
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center py-8">
            {layout === 'left' ? (
              <>
                {imageElement}
                {contentElement}
              </>
            ) : (
              <>
                {contentElement}
                {imageElement}
              </>
            )}
          </div>
        );
      },
    },

    // ========================================================================
    // ImageGallery - Grid of images
    // ========================================================================
    ImageGallery: {
      fields: {
        images: {
          type: 'array',
          label: 'Images',
          arrayFields: {
            src: {
              type: 'text',
              label: 'Image URL',
            },
            alt: {
              type: 'text',
              label: 'Alt Text',
            },
            caption: {
              type: 'text',
              label: 'Caption (optional)',
            },
          },
          defaultItemProps: {
            src: '',
            alt: 'Image',
            caption: '',
          },
        },
        columns: {
          type: 'select',
          label: 'Columns',
          options: [
            { label: '2 Columns', value: '2' },
            { label: '3 Columns', value: '3' },
            { label: '4 Columns', value: '4' },
          ],
        },
        gap: {
          type: 'radio',
          label: 'Gap',
          options: gapOptions,
        },
        aspectRatio: {
          type: 'select',
          label: 'Aspect Ratio',
          options: [
            { label: 'Square (1:1)', value: 'square' },
            { label: 'Landscape (4:3)', value: 'landscape' },
            { label: 'Wide (16:9)', value: 'wide' },
            { label: 'Auto', value: 'auto' },
          ],
        },
      },
      defaultProps: {
        images: [],
        columns: '3',
        gap: 'md',
        aspectRatio: 'square',
      },
      render: ({ images, columns, gap, aspectRatio }) => {
        const columnsMap: Record<string, string> = {
          '2': 'grid-cols-1 sm:grid-cols-2',
          '3': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
          '4': 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
        };
        const gapMap: Record<string, string> = {
          sm: 'gap-2',
          md: 'gap-4',
          lg: 'gap-6',
          xl: 'gap-8',
        };
        const aspectMap: Record<string, string> = {
          square: 'aspect-square',
          landscape: 'aspect-[4/3]',
          wide: 'aspect-video',
          auto: '',
        };

        if (!images || images.length === 0) {
          return (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl">
              <p className="text-gray-500 dark:text-gray-400">Add images to the gallery</p>
            </div>
          );
        }

        return (
          <div className={`grid ${columnsMap[columns]} ${gapMap[gap]}`}>
            {images.map((img: { src?: string; alt?: string; caption?: string }, index: number) => (
              <figure key={index} className="group relative">
                <div className={`overflow-hidden rounded-lg ${aspectMap[aspectRatio]}`}>
                  {img.src ? (
                    <img
                      src={img.src}
                      alt={img.alt || `Gallery image ${index + 1}`}
                      className={`w-full h-full object-cover transition-transform group-hover:scale-105 ${aspectRatio !== 'auto' ? '' : 'h-auto'}`}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">No image</span>
                    </div>
                  )}
                </div>
                {img.caption && (
                  <figcaption className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {img.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        );
      },
    },

    // ========================================================================
    // INTERACTIVE CONTENT COMPONENTS
    // ========================================================================

    // ========================================================================
    // RichText - WYSIWYG formatted content block
    // ========================================================================
    RichText: {
      fields: {
        content: {
          type: 'textarea',
          label: 'Content (HTML)',
        },
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
      },
      defaultProps: {
        content: '<p>Add your rich text content here. Use the editor to format your text with headings, bold, italic, lists, and more.</p>',
        maxWidth: 'lg',
        padding: 'none',
      },
      render: ({ content, maxWidth, padding }) => {
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
            <div
              className="prose prose-gray dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-purple-600 dark:prose-a:text-purple-400 prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-ul:text-gray-700 dark:prose-ul:text-gray-300 prose-ol:text-gray-700 dark:prose-ol:text-gray-300 prose-blockquote:border-purple-400 prose-code:text-purple-600 dark:prose-code:text-purple-400"
              dangerouslySetInnerHTML={{ __html: content || '' }}
            />
          </div>
        );
      },
    },

    // ========================================================================
    // Accordion - Expandable FAQ-style content
    // ========================================================================
    Accordion: {
      fields: {
        items: {
          type: 'array',
          label: 'Accordion Items',
          arrayFields: {
            title: {
              type: 'text',
              label: 'Title',
            },
            content: {
              type: 'textarea',
              label: 'Content',
            },
            defaultOpen: {
              type: 'radio',
              label: 'Default State',
              options: [
                { label: 'Closed', value: 'closed' },
                { label: 'Open', value: 'open' },
              ],
            },
          },
          defaultItemProps: {
            title: 'Accordion Item',
            content: 'Your content goes here.',
            defaultOpen: 'closed',
          },
        },
        allowMultiple: {
          type: 'radio',
          label: 'Allow Multiple Open',
          options: [
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' },
          ],
        },
        style: {
          type: 'select',
          label: 'Style',
          options: [
            { label: 'Bordered', value: 'bordered' },
            { label: 'Separated', value: 'separated' },
            { label: 'Minimal', value: 'minimal' },
          ],
        },
        accentColor: {
          type: 'select',
          label: 'Accent Color',
          options: colorOptions,
        },
      },
      defaultProps: {
        items: [
          { title: 'What is this?', content: 'This is an accordion component for organizing content.', defaultOpen: 'open' },
          { title: 'How does it work?', content: 'Click on any item to expand or collapse it.', defaultOpen: 'closed' },
        ],
        allowMultiple: 'no',
        style: 'bordered',
        accentColor: 'purple' as AccentVariant,
      },
      render: ({ items, style, accentColor }) => {
        const accentMap: Record<string, { border: string; bg: string; text: string }> = {
          purple: { border: 'border-purple-200 dark:border-purple-800', bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400' },
          blue: { border: 'border-blue-200 dark:border-blue-800', bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' },
          green: { border: 'border-green-200 dark:border-green-800', bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400' },
          orange: { border: 'border-orange-200 dark:border-orange-800', bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400' },
          teal: { border: 'border-teal-200 dark:border-teal-800', bg: 'bg-teal-50 dark:bg-teal-900/20', text: 'text-teal-600 dark:text-teal-400' },
          gray: { border: 'border-gray-200 dark:border-gray-700', bg: 'bg-gray-50 dark:bg-gray-800/50', text: 'text-gray-600 dark:text-gray-400' },
        };
        const colors = accentMap[accentColor] || accentMap.purple;

        const styleClasses: Record<string, { wrapper: string; item: string }> = {
          bordered: {
            wrapper: `border ${colors.border} rounded-xl overflow-hidden divide-y divide-gray-200 dark:divide-gray-700`,
            item: '',
          },
          separated: {
            wrapper: 'space-y-3',
            item: `border ${colors.border} rounded-xl overflow-hidden`,
          },
          minimal: {
            wrapper: 'divide-y divide-gray-200 dark:divide-gray-700',
            item: '',
          },
        };
        const styles = styleClasses[style] || styleClasses.bordered;

        if (!items || items.length === 0) {
          return (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl">
              <p className="text-gray-500 dark:text-gray-400">Add accordion items</p>
            </div>
          );
        }

        return (
          <div className={styles.wrapper}>
            {items.map((item: { title?: string; content?: string; defaultOpen?: string }, index: number) => (
              <details
                key={index}
                open={item.defaultOpen === 'open'}
                className={`group ${styles.item}`}
              >
                <summary className={`flex items-center justify-between cursor-pointer px-5 py-4 ${colors.bg} hover:bg-opacity-80 transition-colors`}>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {item.title || 'Untitled'}
                  </span>
                  <svg
                    className={`w-5 h-5 ${colors.text} transition-transform group-open:rotate-180`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 py-4 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800">
                  {item.content || ''}
                </div>
              </details>
            ))}
          </div>
        );
      },
    },

    // ========================================================================
    // Tabs - Tabbed content sections
    // ========================================================================
    Tabs: {
      fields: {
        tabs: {
          type: 'array',
          label: 'Tabs',
          arrayFields: {
            label: {
              type: 'text',
              label: 'Tab Label',
            },
            content: {
              type: 'textarea',
              label: 'Tab Content',
            },
            icon: {
              type: 'select',
              label: 'Icon (optional)',
              options: [
                { label: 'None', value: 'none' },
                { label: 'Star', value: 'star' },
                { label: 'Heart', value: 'heart' },
                { label: 'Check', value: 'check' },
                { label: 'Info', value: 'info' },
                { label: 'Settings', value: 'settings' },
              ],
            },
          },
          defaultItemProps: {
            label: 'Tab',
            content: 'Tab content goes here.',
            icon: 'none',
          },
        },
        style: {
          type: 'select',
          label: 'Style',
          options: [
            { label: 'Underline', value: 'underline' },
            { label: 'Pills', value: 'pills' },
            { label: 'Boxed', value: 'boxed' },
          ],
        },
        accentColor: {
          type: 'select',
          label: 'Accent Color',
          options: colorOptions,
        },
        fullWidth: {
          type: 'radio',
          label: 'Full Width Tabs',
          options: [
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' },
          ],
        },
      },
      defaultProps: {
        tabs: [
          { label: 'First Tab', content: 'Content for the first tab.', icon: 'none' },
          { label: 'Second Tab', content: 'Content for the second tab.', icon: 'none' },
          { label: 'Third Tab', content: 'Content for the third tab.', icon: 'none' },
        ],
        style: 'underline',
        accentColor: 'purple' as AccentVariant,
        fullWidth: 'no',
      },
      render: ({ tabs, style, accentColor, fullWidth }) => {
        const accentMap: Record<string, { active: string; border: string; bg: string }> = {
          purple: { active: 'text-purple-600 dark:text-purple-400', border: 'border-purple-600 dark:border-purple-400', bg: 'bg-purple-600' },
          blue: { active: 'text-blue-600 dark:text-blue-400', border: 'border-blue-600 dark:border-blue-400', bg: 'bg-blue-600' },
          green: { active: 'text-green-600 dark:text-green-400', border: 'border-green-600 dark:border-green-400', bg: 'bg-green-600' },
          orange: { active: 'text-orange-600 dark:text-orange-400', border: 'border-orange-600 dark:border-orange-400', bg: 'bg-orange-600' },
          teal: { active: 'text-teal-600 dark:text-teal-400', border: 'border-teal-600 dark:border-teal-400', bg: 'bg-teal-600' },
          gray: { active: 'text-gray-800 dark:text-gray-200', border: 'border-gray-600 dark:border-gray-400', bg: 'bg-gray-600' },
        };
        const colors = accentMap[accentColor] || accentMap.purple;

        const iconMap: Record<string, ReactNode> = {
          star: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>,
          heart: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>,
          check: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
          info: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
          settings: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
        };

        if (!tabs || tabs.length === 0) {
          return (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl">
              <p className="text-gray-500 dark:text-gray-400">Add tabs</p>
            </div>
          );
        }

        // For static rendering, show all tabs with first one active
        // In real usage, this would need client-side state management
        return (
          <div className="w-full">
            {/* Tab Headers */}
            <div className={`flex ${fullWidth === 'yes' ? 'w-full' : ''} ${style === 'boxed' ? 'bg-gray-100 dark:bg-gray-800 p-1 rounded-xl' : style === 'underline' ? 'border-b border-gray-200 dark:border-gray-700' : 'gap-2'}`}>
              {tabs.map((tab: { label?: string; icon?: string }, index: number) => {
                const isFirst = index === 0;
                let tabClass = '';

                if (style === 'underline') {
                  tabClass = `px-4 py-3 font-medium text-sm border-b-2 -mb-px transition-colors ${
                    isFirst
                      ? `${colors.active} ${colors.border}`
                      : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
                  } ${fullWidth === 'yes' ? 'flex-1 text-center' : ''}`;
                } else if (style === 'pills') {
                  tabClass = `px-4 py-2 font-medium text-sm rounded-lg transition-colors ${
                    isFirst
                      ? `${colors.bg} text-white`
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  } ${fullWidth === 'yes' ? 'flex-1 text-center' : ''}`;
                } else {
                  tabClass = `px-4 py-2 font-medium text-sm rounded-lg transition-colors ${
                    isFirst
                      ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-gray-100'
                      : 'text-gray-600 dark:text-gray-400'
                  } ${fullWidth === 'yes' ? 'flex-1 text-center' : ''}`;
                }

                return (
                  <button
                    key={index}
                    type="button"
                    className={`flex items-center justify-center gap-2 ${tabClass}`}
                  >
                    {tab.icon && tab.icon !== 'none' && iconMap[tab.icon]}
                    {tab.label || 'Tab'}
                  </button>
                );
              })}
            </div>

            {/* Tab Content - Show first tab */}
            <div className="mt-4 p-4 text-gray-700 dark:text-gray-300">
              {tabs[0]?.content || 'No content'}
            </div>
          </div>
        );
      },
    },

    // ========================================================================
    // Feature Grid - Grid of feature cards with icons
    // ========================================================================
    FeatureGrid: {
      fields: {
        features: {
          type: 'array',
          label: 'Features',
          arrayFields: {
            icon: {
              type: 'select',
              label: 'Icon',
              options: [
                { label: 'Star', value: 'star' },
                { label: 'Check', value: 'check' },
                { label: 'Lightning', value: 'lightning' },
                { label: 'Shield', value: 'shield' },
                { label: 'Heart', value: 'heart' },
                { label: 'Cog', value: 'cog' },
              ],
            },
            title: {
              type: 'text',
              label: 'Title',
            },
            description: {
              type: 'textarea',
              label: 'Description',
            },
          },
          defaultItemProps: {
            icon: 'check',
            title: 'Feature Title',
            description: 'Brief description of this amazing feature.',
          },
        },
        columns: {
          type: 'select',
          label: 'Columns',
          options: [
            { label: '2 Columns', value: '2' },
            { label: '3 Columns', value: '3' },
            { label: '4 Columns', value: '4' },
          ],
        },
        accentColor: {
          type: 'select',
          label: 'Icon Color',
          options: colorOptions,
        },
      },
      defaultProps: {
        features: [
          { icon: 'lightning', title: 'Fast & Efficient', description: 'Lightning-fast performance for your workflows.' },
          { icon: 'shield', title: 'Secure', description: 'Enterprise-grade security for your peace of mind.' },
          { icon: 'heart', title: 'User Friendly', description: 'Intuitive design that anyone can use.' },
        ],
        columns: '3',
        accentColor: 'purple' as AccentVariant,
      },
      render: ({ features, columns, accentColor }) => {
        const columnsMap: Record<string, string> = {
          '2': 'grid-cols-1 md:grid-cols-2',
          '3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
          '4': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
        };

        const accentMap: Record<string, { bg: string; text: string }> = {
          purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400' },
          blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
          green: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400' },
          orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400' },
          teal: { bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-600 dark:text-teal-400' },
          gray: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400' },
        };
        const colors = accentMap[accentColor] || accentMap.purple;

        const iconMap: Record<string, ReactNode> = {
          star: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>,
          check: <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
          lightning: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>,
          shield: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>,
          heart: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>,
          cog: <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
        };

        if (!features || features.length === 0) {
          return (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl">
              <p className="text-gray-500 dark:text-gray-400">Add features</p>
            </div>
          );
        }

        return (
          <div className={`grid ${columnsMap[columns]} gap-6`}>
            {features.map((feature: { icon?: string; title?: string; description?: string }, index: number) => (
              <div
                key={index}
                className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
              >
                <div className={`w-12 h-12 ${colors.bg} ${colors.text} rounded-xl flex items-center justify-center mb-4`}>
                  {iconMap[feature.icon || 'check'] || iconMap.check}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {feature.title || 'Feature'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description || ''}
                </p>
              </div>
            ))}
          </div>
        );
      },
    },

    // ========================================================================
    // E-COMMERCE COMPONENTS
    // ========================================================================

    // ========================================================================
    // ProductCard - Single product display card
    // ========================================================================
    ProductCard: {
      fields: {
        productId: {
          type: 'text',
          label: 'Product ID (from Medusa)',
        },
        showPrice: {
          type: 'radio',
          label: 'Show Price',
          options: [
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' },
          ],
        },
        showDescription: {
          type: 'radio',
          label: 'Show Description',
          options: [
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' },
          ],
        },
        imageAspect: {
          type: 'select',
          label: 'Image Aspect Ratio',
          options: [
            { label: 'Square', value: 'square' },
            { label: 'Landscape', value: 'landscape' },
            { label: 'Portrait', value: 'portrait' },
          ],
        },
        accentColor: {
          type: 'select',
          label: 'Accent Color',
          options: colorOptions,
        },
      },
      defaultProps: {
        productId: '',
        showPrice: 'yes',
        showDescription: 'yes',
        imageAspect: 'square',
        accentColor: 'purple' as AccentVariant,
      },
      render: ({ productId, showPrice, showDescription, imageAspect, accentColor }) => {
        const aspectMap: Record<string, string> = {
          square: 'aspect-square',
          landscape: 'aspect-[4/3]',
          portrait: 'aspect-[3/4]',
        };

        const accentMap: Record<string, string> = {
          purple: 'hover:border-purple-400 dark:hover:border-purple-500',
          blue: 'hover:border-blue-400 dark:hover:border-blue-500',
          green: 'hover:border-green-400 dark:hover:border-green-500',
          orange: 'hover:border-orange-400 dark:hover:border-orange-500',
          teal: 'hover:border-teal-400 dark:hover:border-teal-500',
          gray: 'hover:border-gray-400 dark:hover:border-gray-500',
        };

        if (!productId) {
          return (
            <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 p-8 text-center">
              <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Enter a Product ID</p>
            </div>
          );
        }

        // Static placeholder - in real usage, this would fetch product data
        return (
          <div className={`bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 ${accentMap[accentColor]} overflow-hidden transition-all hover:shadow-lg group`}>
            <div className={`${aspectMap[imageAspect]} bg-gray-100 dark:bg-gray-700 overflow-hidden`}>
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                Product: {productId}
              </h3>
              {showDescription === 'yes' && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                  Product description will load dynamically
                </p>
              )}
              {showPrice === 'yes' && (
                <p className="text-lg font-bold text-purple-600 dark:text-purple-400 mt-2">
                  $--.-
                </p>
              )}
            </div>
          </div>
        );
      },
    },

    // ========================================================================
    // ProductGrid - Grid of products
    // ========================================================================
    ProductGrid: {
      fields: {
        productIds: {
          type: 'array',
          label: 'Products',
          arrayFields: {
            id: {
              type: 'text',
              label: 'Product ID',
            },
          },
          defaultItemProps: {
            id: '',
          },
        },
        columns: {
          type: 'select',
          label: 'Columns',
          options: [
            { label: '2 Columns', value: '2' },
            { label: '3 Columns', value: '3' },
            { label: '4 Columns', value: '4' },
          ],
        },
        gap: {
          type: 'radio',
          label: 'Gap',
          options: gapOptions,
        },
        showPrice: {
          type: 'radio',
          label: 'Show Price',
          options: [
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' },
          ],
        },
        accentColor: {
          type: 'select',
          label: 'Accent Color',
          options: colorOptions,
        },
      },
      defaultProps: {
        productIds: [],
        columns: '3',
        gap: 'md',
        showPrice: 'yes',
        accentColor: 'purple' as AccentVariant,
      },
      render: ({ productIds, columns, gap, showPrice, accentColor }) => {
        const columnsMap: Record<string, string> = {
          '2': 'grid-cols-1 sm:grid-cols-2',
          '3': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
          '4': 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
        };
        const gapMap: Record<string, string> = {
          sm: 'gap-3',
          md: 'gap-4',
          lg: 'gap-6',
          xl: 'gap-8',
        };

        const accentMap: Record<string, string> = {
          purple: 'hover:border-purple-400 dark:hover:border-purple-500',
          blue: 'hover:border-blue-400 dark:hover:border-blue-500',
          green: 'hover:border-green-400 dark:hover:border-green-500',
          orange: 'hover:border-orange-400 dark:hover:border-orange-500',
          teal: 'hover:border-teal-400 dark:hover:border-teal-500',
          gray: 'hover:border-gray-400 dark:hover:border-gray-500',
        };

        if (!productIds || productIds.length === 0) {
          return (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl">
              <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400">Add products to the grid</p>
            </div>
          );
        }

        return (
          <div className={`grid ${columnsMap[columns]} ${gapMap[gap]}`}>
            {productIds.map((item: { id?: string }, index: number) => (
              <div
                key={index}
                className={`bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 ${accentMap[accentColor]} overflow-hidden transition-all hover:shadow-lg group`}
              >
                <div className="aspect-square bg-gray-100 dark:bg-gray-700 overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                    {item.id || 'Product'}
                  </h3>
                  {showPrice === 'yes' && (
                    <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 mt-1">
                      $--.-
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      },
    },

    // ========================================================================
    // FeaturedProduct - Large product showcase
    // ========================================================================
    FeaturedProduct: {
      fields: {
        productId: {
          type: 'text',
          label: 'Product ID',
        },
        layout: {
          type: 'radio',
          label: 'Layout',
          options: [
            { label: 'Image Left', value: 'left' },
            { label: 'Image Right', value: 'right' },
          ],
        },
        title: {
          type: 'text',
          label: 'Custom Title (optional)',
        },
        description: {
          type: 'textarea',
          label: 'Custom Description (optional)',
        },
        buttonText: {
          type: 'text',
          label: 'Button Text',
        },
        buttonLink: {
          type: 'text',
          label: 'Button Link',
        },
        accentColor: {
          type: 'select',
          label: 'Accent Color',
          options: colorOptions,
        },
        showBadge: {
          type: 'radio',
          label: 'Show Badge',
          options: [
            { label: 'None', value: 'none' },
            { label: 'New', value: 'new' },
            { label: 'Sale', value: 'sale' },
            { label: 'Featured', value: 'featured' },
          ],
        },
      },
      defaultProps: {
        productId: '',
        layout: 'left',
        buttonText: 'Shop Now',
        buttonLink: '/shop',
        accentColor: 'purple' as AccentVariant,
        showBadge: 'none',
      },
      render: ({ productId, layout, title, description, buttonText, buttonLink, accentColor, showBadge }) => {
        const accentMap: Record<string, { bg: string; text: string; button: string }> = {
          purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400', button: 'bg-purple-600 hover:bg-purple-700' },
          blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', button: 'bg-blue-600 hover:bg-blue-700' },
          green: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', button: 'bg-green-600 hover:bg-green-700' },
          orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400', button: 'bg-orange-600 hover:bg-orange-700' },
          teal: { bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-600 dark:text-teal-400', button: 'bg-teal-600 hover:bg-teal-700' },
          gray: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', button: 'bg-gray-600 hover:bg-gray-700' },
        };
        const colors = accentMap[accentColor] || accentMap.purple;

        const badgeMap: Record<string, { text: string; class: string }> = {
          new: { text: 'New', class: 'bg-green-500' },
          sale: { text: 'Sale', class: 'bg-red-500' },
          featured: { text: 'Featured', class: 'bg-purple-500' },
        };

        const imageElement = (
          <div className="w-full md:w-1/2 relative">
            <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden">
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
            {showBadge !== 'none' && badgeMap[showBadge] && (
              <span className={`absolute top-4 left-4 px-3 py-1 text-sm font-semibold text-white rounded-full ${badgeMap[showBadge].class}`}>
                {badgeMap[showBadge].text}
              </span>
            )}
          </div>
        );

        const contentElement = (
          <div className="w-full md:w-1/2 flex flex-col justify-center py-8 md:py-0">
            <div className={`inline-flex items-center px-3 py-1 ${colors.bg} ${colors.text} rounded-full text-sm font-medium mb-4 w-fit`}>
              {productId || 'Product ID'}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {title || 'Featured Product'}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              {description || 'Discover this amazing product that will transform your experience. Premium quality, exceptional design.'}
            </p>
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                $--.-
              </span>
              {buttonText && (
                <a
                  href={buttonLink || '/shop'}
                  className={`px-6 py-3 text-white font-medium rounded-lg ${colors.button} transition-colors`}
                >
                  {buttonText}
                </a>
              )}
            </div>
          </div>
        );

        if (!productId) {
          return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 p-12 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400">Enter a Product ID to feature</p>
            </div>
          );
        }

        return (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 md:p-10">
            <div className="flex flex-col md:flex-row gap-8 md:gap-12">
              {layout === 'left' ? (
                <>
                  {imageElement}
                  {contentElement}
                </>
              ) : (
                <>
                  {contentElement}
                  {imageElement}
                </>
              )}
            </div>
          </div>
        );
      },
    },

    // ========================================================================
    // PricingTable - Pricing comparison table
    // ========================================================================
    PricingTable: {
      fields: {
        plans: {
          type: 'array',
          label: 'Plans',
          arrayFields: {
            name: {
              type: 'text',
              label: 'Plan Name',
            },
            price: {
              type: 'text',
              label: 'Price',
            },
            period: {
              type: 'text',
              label: 'Period (e.g., /month)',
            },
            description: {
              type: 'text',
              label: 'Description',
            },
            features: {
              type: 'textarea',
              label: 'Features (one per line)',
            },
            buttonText: {
              type: 'text',
              label: 'Button Text',
            },
            buttonLink: {
              type: 'text',
              label: 'Button Link',
            },
            highlighted: {
              type: 'radio',
              label: 'Highlight',
              options: [
                { label: 'Yes', value: 'yes' },
                { label: 'No', value: 'no' },
              ],
            },
          },
          defaultItemProps: {
            name: 'Plan',
            price: '$29',
            period: '/month',
            description: 'Perfect for getting started',
            features: 'Feature 1\nFeature 2\nFeature 3',
            buttonText: 'Get Started',
            buttonLink: '#',
            highlighted: 'no',
          },
        },
        accentColor: {
          type: 'select',
          label: 'Accent Color',
          options: colorOptions,
        },
      },
      defaultProps: {
        plans: [
          {
            name: 'Starter',
            price: '$19',
            period: '/month',
            description: 'Perfect for individuals',
            features: 'Up to 5 projects\nBasic support\n1GB storage',
            buttonText: 'Start Free',
            buttonLink: '#',
            highlighted: 'no',
          },
          {
            name: 'Professional',
            price: '$49',
            period: '/month',
            description: 'For growing teams',
            features: 'Unlimited projects\nPriority support\n10GB storage\nAdvanced analytics',
            buttonText: 'Get Started',
            buttonLink: '#',
            highlighted: 'yes',
          },
          {
            name: 'Enterprise',
            price: '$99',
            period: '/month',
            description: 'For large organizations',
            features: 'Everything in Pro\nDedicated support\nUnlimited storage\nCustom integrations',
            buttonText: 'Contact Sales',
            buttonLink: '#',
            highlighted: 'no',
          },
        ],
        accentColor: 'purple' as AccentVariant,
      },
      render: ({ plans, accentColor }) => {
        const accentMap: Record<string, { border: string; bg: string; button: string; badge: string }> = {
          purple: { border: 'border-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20', button: 'bg-purple-600 hover:bg-purple-700', badge: 'bg-purple-500' },
          blue: { border: 'border-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', button: 'bg-blue-600 hover:bg-blue-700', badge: 'bg-blue-500' },
          green: { border: 'border-green-500', bg: 'bg-green-50 dark:bg-green-900/20', button: 'bg-green-600 hover:bg-green-700', badge: 'bg-green-500' },
          orange: { border: 'border-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', button: 'bg-orange-600 hover:bg-orange-700', badge: 'bg-orange-500' },
          teal: { border: 'border-teal-500', bg: 'bg-teal-50 dark:bg-teal-900/20', button: 'bg-teal-600 hover:bg-teal-700', badge: 'bg-teal-500' },
          gray: { border: 'border-gray-500', bg: 'bg-gray-50 dark:bg-gray-800', button: 'bg-gray-600 hover:bg-gray-700', badge: 'bg-gray-500' },
        };
        const colors = accentMap[accentColor] || accentMap.purple;

        if (!plans || plans.length === 0) {
          return (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl">
              <p className="text-gray-500 dark:text-gray-400">Add pricing plans</p>
            </div>
          );
        }

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan: {
              name?: string;
              price?: string;
              period?: string;
              description?: string;
              features?: string;
              buttonText?: string;
              buttonLink?: string;
              highlighted?: string;
            }, index: number) => {
              const isHighlighted = plan.highlighted === 'yes';
              const featureList = plan.features?.split('\n').filter(Boolean) || [];

              return (
                <div
                  key={index}
                  className={`relative rounded-2xl p-6 ${
                    isHighlighted
                      ? `${colors.bg} border-2 ${colors.border} shadow-lg`
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {isHighlighted && (
                    <span className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-semibold text-white rounded-full ${colors.badge}`}>
                      Most Popular
                    </span>
                  )}

                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {plan.name || 'Plan'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {plan.description || ''}
                  </p>

                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                      {plan.price || '$0'}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {plan.period || ''}
                    </span>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {featureList.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <a
                    href={plan.buttonLink || '#'}
                    className={`block w-full py-3 text-center font-medium rounded-lg transition-colors ${
                      isHighlighted
                        ? `${colors.button} text-white`
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {plan.buttonText || 'Get Started'}
                  </a>
                </div>
              );
            })}
          </div>
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
    media: {
      title: 'Media',
      components: ['Image', 'ImageGallery', 'Hero', 'ImageText'],
    },
    content: {
      title: 'Content',
      components: ['TextBlock', 'RichText', 'PageHeader', 'CTASection'],
    },
    interactive: {
      title: 'Interactive',
      components: ['Accordion', 'Tabs', 'FeatureGrid', 'Button', 'Card', 'CircleBadge'],
    },
    ecommerce: {
      title: 'E-Commerce',
      components: ['ProductCard', 'ProductGrid', 'FeaturedProduct', 'PricingTable'],
    },
  },
};
