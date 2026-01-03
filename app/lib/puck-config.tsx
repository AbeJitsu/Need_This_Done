import type { Config } from '@measured/puck';
import Image from 'next/image';
import Button from '@/components/Button';
import Card from '@/components/Card';
import PageHeader from '@/components/PageHeader';
import CTASection from '@/components/CTASection';
import CircleBadge from '@/components/CircleBadge';
import TabsComponent from '@/components/puck/TabsComponent';
import ProductCardComponent from '@/components/puck/ProductCardComponent';
import MediaPickerField from '@/components/puck/MediaPickerField';
import ProductGridComponent from '@/components/puck/ProductGridComponent';
import AccordionComponent from '@/components/puck/AccordionComponent';
import TestimonialsComponent from '@/components/puck/TestimonialsComponent';
import VideoEmbedComponent from '@/components/puck/VideoEmbedComponent';
import StatsCounterComponent from '@/components/puck/StatsCounterComponent';
import { getSolidButtonColors, type AccentVariant } from '@/lib/colors';
import { getPuckAccentColors, getPuckFullColors, puckColumnsMap, puckIcons, getDividerColors, getPricingColors, puckContainerWidthMap, puckContainerPaddingMap } from './puck-utils';

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
  { label: 'Gold', value: 'gold' },
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
        hoverColor: 'gold' as AccentVariant,
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
        // Use centralized layout utilities from puck-utils
        const width = puckContainerWidthMap[maxWidth as keyof typeof puckContainerWidthMap] || puckContainerWidthMap.lg;
        const pad = puckContainerPaddingMap[padding as keyof typeof puckContainerPaddingMap] || '';
        return (
          <div className={`mx-auto w-full ${width} ${pad}`}>
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
        const colors = getDividerColors(color);

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
          type: 'custom',
          label: 'Image',
          render: ({ value, onChange }) => (
            <MediaPickerField value={value || ''} onChange={onChange} label="Select Image" />
          ),
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
            <Image
              src={src}
              alt={alt || ''}
              width={0}
              height={0}
              sizes="100vw"
              className={`w-full h-auto ${roundedMap[rounded]} shadow-md`}
              unoptimized
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
          type: 'custom',
          label: 'Background Image',
          render: ({ value, onChange }) => (
            <MediaPickerField value={value || ''} onChange={onChange} label="Select Background" />
          ),
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

        // Use centralized button colors (fixes dynamic Tailwind class issue)
        const btnColors = getSolidButtonColors(buttonColor as AccentVariant);

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
                  className={`inline-flex items-center px-6 py-3 text-lg font-semibold rounded-lg shadow-lg transition-all hover:scale-105 ${btnColors.bg} ${btnColors.hover} ${btnColors.text}`}
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

        // Use centralized button colors (fixes dynamic Tailwind class issue)
        const btnColors = getSolidButtonColors(buttonColor as AccentVariant);

        const imageElement = (
          <div className={`w-full ${imageSizeMap[imageSize]} flex-shrink-0`}>
            {image ? (
              <Image src={image} alt={imageAlt || ''} width={0} height={0} sizes="100vw" className="w-full h-auto rounded-xl shadow-lg" unoptimized />
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
                className={`inline-flex items-center px-5 py-2.5 font-medium rounded-lg transition-colors ${btnColors.bg} ${btnColors.hover} ${btnColors.text} w-fit`}
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
              type: 'custom',
              label: 'Image',
              render: ({ value, onChange }) => (
                <MediaPickerField value={value || ''} onChange={onChange} label="Select Image" />
              ),
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
                    <Image
                      src={img.src}
                      alt={img.alt || `Gallery image ${index + 1}`}
                      width={0}
                      height={0}
                      sizes="100vw"
                      className={`w-full h-full object-cover transition-transform group-hover:scale-105 ${aspectRatio !== 'auto' ? '' : 'h-auto'}`}
                      unoptimized
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
        // Use centralized layout utilities from puck-utils
        const width = puckContainerWidthMap[maxWidth as keyof typeof puckContainerWidthMap] || puckContainerWidthMap.lg;
        const pad = puckContainerPaddingMap[padding as keyof typeof puckContainerPaddingMap] || '';

        return (
          <div className={`mx-auto w-full ${width} ${pad}`}>
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
      render: ({ items, allowMultiple, style, accentColor }) => (
        <AccordionComponent
          items={items}
          allowMultiple={allowMultiple as 'yes' | 'no'}
          style={style as 'bordered' | 'separated' | 'minimal'}
          accentColor={accentColor}
        />
      ),
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
                { label: 'Shield', value: 'shield' },
                { label: 'Cog', value: 'cog' },
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
      render: ({ tabs, style, accentColor, fullWidth }) => (
        <TabsComponent
          tabs={tabs}
          style={style as 'underline' | 'pills' | 'boxed'}
          accentColor={accentColor}
          fullWidth={fullWidth as 'yes' | 'no'}
        />
      ),
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
        // Use centralized color utilities from puck-utils
        const colors = getPuckAccentColors(accentColor);

        if (!features || features.length === 0) {
          return (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl">
              <p className="text-gray-500 dark:text-gray-400">Add features</p>
            </div>
          );
        }

        return (
          <div className={`grid ${puckColumnsMap[columns as keyof typeof puckColumnsMap]} gap-6`}>
            {features.map((feature: { icon?: string; title?: string; description?: string }, index: number) => (
              <div
                key={index}
                className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
              >
                <div className={`w-12 h-12 ${colors.iconBg} ${colors.text} rounded-xl flex items-center justify-center mb-4`} aria-hidden="true">
                  {puckIcons[feature.icon || 'check'] || puckIcons.check}
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
      render: ({ productId, showPrice, showDescription, imageAspect, accentColor }) => (
        <ProductCardComponent
          productId={productId}
          showPrice={showPrice as 'yes' | 'no'}
          showDescription={showDescription as 'yes' | 'no'}
          imageAspect={imageAspect as 'square' | 'landscape' | 'portrait'}
          accentColor={accentColor}
        />
      ),
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
      render: ({ productIds, columns, gap, showPrice, accentColor }) => (
        <ProductGridComponent
          productIds={productIds}
          columns={columns as '2' | '3' | '4'}
          gap={gap as 'sm' | 'md' | 'lg' | 'xl'}
          showPrice={showPrice as 'yes' | 'no'}
          accentColor={accentColor}
        />
      ),
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
        // Use centralized color utilities from puck-utils
        const colors = getPuckFullColors(accentColor);

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
            <div className={`inline-flex items-center px-3 py-1 ${colors.iconBg} ${colors.accentText} rounded-full text-sm font-medium mb-4 w-fit`}>
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
                  className={`px-6 py-3 text-white font-medium rounded-lg ${colors.buttonBg} transition-colors`}
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
        const colors = getPricingColors(accentColor);

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

    // ========================================================================
    // SOCIAL PROOF & ENGAGEMENT COMPONENTS
    // ========================================================================

    // ========================================================================
    // Testimonials - Customer Reviews & Social Proof
    // ========================================================================
    Testimonials: {
      fields: {
        testimonials: {
          type: 'array',
          label: 'Testimonials',
          arrayFields: {
            quote: {
              type: 'textarea',
              label: 'Quote',
            },
            author: {
              type: 'text',
              label: 'Author Name',
            },
            role: {
              type: 'text',
              label: 'Role/Title',
            },
            company: {
              type: 'text',
              label: 'Company',
            },
            avatar: {
              type: 'text',
              label: 'Avatar URL (optional)',
            },
            rating: {
              type: 'number',
              label: 'Rating (1-5)',
            },
          },
          defaultItemProps: {
            quote: 'This product has transformed the way we work. Highly recommended!',
            author: 'Jane Smith',
            role: 'CEO',
            company: 'Acme Inc',
            rating: 5,
          },
        },
        layout: {
          type: 'select',
          label: 'Layout',
          options: [
            { label: 'Carousel', value: 'carousel' },
            { label: 'Grid', value: 'grid' },
            { label: 'Single (Featured)', value: 'single' },
          ],
        },
        showRating: {
          type: 'radio',
          label: 'Show Star Rating',
          options: [
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' },
          ],
        },
        showAvatar: {
          type: 'radio',
          label: 'Show Avatar',
          options: [
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' },
          ],
        },
        autoPlay: {
          type: 'radio',
          label: 'Auto-Play (Carousel)',
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
        testimonials: [
          {
            quote: 'Absolutely amazing service! They delivered beyond our expectations.',
            author: 'Sarah Johnson',
            role: 'Marketing Director',
            company: 'TechCorp',
            rating: 5,
          },
          {
            quote: 'Professional, responsive, and incredibly talented team.',
            author: 'Michael Chen',
            role: 'Founder',
            company: 'StartupXYZ',
            rating: 5,
          },
          {
            quote: 'Transformed our business with their innovative solutions.',
            author: 'Emily Davis',
            role: 'Operations Manager',
            company: 'Global Inc',
            rating: 5,
          },
        ],
        layout: 'carousel',
        showRating: 'yes',
        showAvatar: 'yes',
        autoPlay: 'yes',
        accentColor: 'purple' as AccentVariant,
      },
      render: ({ testimonials, layout, showRating, showAvatar, autoPlay, accentColor }) => (
        <TestimonialsComponent
          testimonials={testimonials}
          layout={layout as 'carousel' | 'grid' | 'single'}
          showRating={showRating as 'yes' | 'no'}
          showAvatar={showAvatar as 'yes' | 'no'}
          autoPlay={autoPlay as 'yes' | 'no'}
          accentColor={accentColor}
        />
      ),
    },

    // ========================================================================
    // VideoEmbed - YouTube/Vimeo Embed
    // ========================================================================
    VideoEmbed: {
      fields: {
        url: {
          type: 'text',
          label: 'Video URL (YouTube or Vimeo)',
        },
        title: {
          type: 'text',
          label: 'Title (for accessibility)',
        },
        caption: {
          type: 'text',
          label: 'Caption (optional)',
        },
        aspectRatio: {
          type: 'select',
          label: 'Aspect Ratio',
          options: [
            { label: 'Widescreen (16:9)', value: '16:9' },
            { label: 'Standard (4:3)', value: '4:3' },
            { label: 'Square (1:1)', value: '1:1' },
            { label: 'Vertical (9:16)', value: '9:16' },
          ],
        },
        autoPlay: {
          type: 'radio',
          label: 'Auto-Play',
          options: [
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' },
          ],
        },
        showControls: {
          type: 'radio',
          label: 'Show Controls',
          options: [
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' },
          ],
        },
        thumbnailMode: {
          type: 'radio',
          label: 'Show Thumbnail First',
          options: [
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' },
          ],
        },
        accentColor: {
          type: 'select',
          label: 'Play Button Color',
          options: colorOptions,
        },
      },
      defaultProps: {
        url: '',
        aspectRatio: '16:9',
        autoPlay: 'no',
        showControls: 'yes',
        thumbnailMode: 'yes',
        accentColor: 'purple' as AccentVariant,
      },
      render: ({ url, title, caption, aspectRatio, autoPlay, showControls, thumbnailMode, accentColor }) => (
        <VideoEmbedComponent
          url={url}
          title={title}
          caption={caption}
          aspectRatio={aspectRatio as '16:9' | '4:3' | '1:1' | '9:16'}
          autoPlay={autoPlay as 'yes' | 'no'}
          showControls={showControls as 'yes' | 'no'}
          thumbnailMode={thumbnailMode as 'yes' | 'no'}
          accentColor={accentColor}
        />
      ),
    },

    // ========================================================================
    // StatsCounter - Animated Statistics Display
    // ========================================================================
    StatsCounter: {
      fields: {
        stats: {
          type: 'array',
          label: 'Statistics',
          arrayFields: {
            value: {
              type: 'number',
              label: 'Number Value',
            },
            prefix: {
              type: 'text',
              label: 'Prefix (e.g., $)',
            },
            suffix: {
              type: 'text',
              label: 'Suffix (e.g., +, %, K)',
            },
            label: {
              type: 'text',
              label: 'Label',
            },
            icon: {
              type: 'select',
              label: 'Icon',
              options: [
                { label: 'None', value: '' },
                { label: 'Users', value: 'users' },
                { label: 'Chart', value: 'chart' },
                { label: 'Star', value: 'star' },
                { label: 'Check', value: 'check' },
                { label: 'Clock', value: 'clock' },
                { label: 'Trophy', value: 'trophy' },
                { label: 'Heart', value: 'heart' },
                { label: 'Globe', value: 'globe' },
              ],
            },
          },
          defaultItemProps: {
            value: 100,
            suffix: '+',
            label: 'Happy Customers',
            icon: 'users',
          },
        },
        layout: {
          type: 'select',
          label: 'Layout',
          options: [
            { label: '2 Columns', value: '2-col' },
            { label: '3 Columns', value: '3-col' },
            { label: '4 Columns', value: '4-col' },
            { label: 'Horizontal Row', value: 'horizontal' },
          ],
        },
        style: {
          type: 'select',
          label: 'Style',
          options: [
            { label: 'Cards', value: 'cards' },
            { label: 'Minimal', value: 'minimal' },
            { label: 'Bordered', value: 'bordered' },
          ],
        },
        animationDuration: {
          type: 'number',
          label: 'Animation Duration (ms)',
        },
        accentColor: {
          type: 'select',
          label: 'Accent Color',
          options: colorOptions,
        },
      },
      defaultProps: {
        stats: [
          { value: 500, suffix: '+', label: 'Happy Customers', icon: 'users' },
          { value: 98, suffix: '%', label: 'Satisfaction Rate', icon: 'star' },
          { value: 24, suffix: '/7', label: 'Support', icon: 'clock' },
          { value: 50, suffix: '+', label: 'Countries', icon: 'globe' },
        ],
        layout: '4-col',
        style: 'cards',
        animationDuration: 2000,
        accentColor: 'purple' as AccentVariant,
      },
      render: ({ stats, layout, style, animationDuration, accentColor }) => (
        <StatsCounterComponent
          stats={stats}
          layout={layout as '2-col' | '3-col' | '4-col' | 'horizontal'}
          style={style as 'cards' | 'minimal' | 'bordered'}
          animationDuration={animationDuration}
          accentColor={accentColor}
        />
      ),
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
      components: ['Image', 'ImageGallery', 'Hero', 'ImageText', 'VideoEmbed'],
    },
    content: {
      title: 'Content',
      components: ['TextBlock', 'RichText', 'PageHeader', 'CTASection'],
    },
    interactive: {
      title: 'Interactive',
      components: ['Accordion', 'Tabs', 'FeatureGrid', 'Button', 'Card', 'CircleBadge'],
    },
    socialProof: {
      title: 'Social Proof',
      components: ['Testimonials', 'StatsCounter'],
    },
    ecommerce: {
      title: 'E-Commerce',
      components: ['ProductCard', 'ProductGrid', 'FeaturedProduct', 'PricingTable'],
    },
  },
};
