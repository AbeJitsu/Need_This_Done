'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Button from '@/components/Button';
import Card from '@/components/Card';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

// ============================================================================
// Block Editor Types
// ============================================================================

interface PuckComponent {
  type: string;
  props: Record<string, unknown>;
}

interface PuckData {
  content: PuckComponent[];
  root: Record<string, unknown>;
}

interface PageData {
  id: string;
  slug: string;
  title: string;
  is_published: boolean;
  content: PuckData | null;
}

// ============================================================================
// Block Categories for the Picker
// ============================================================================

const blockCategories = {
  Layout: ['Spacer', 'Container', 'Columns', 'Divider'],
  Content: ['TextBlock', 'RichText', 'Hero', 'PageHeader', 'CTASection'],
  Media: ['Image', 'ImageGallery', 'ImageText', 'VideoEmbed'],
  Interactive: ['Button', 'Accordion', 'Tabs'],
  Commerce: ['ProductCard', 'ProductGrid', 'FeaturedProduct', 'PricingTable'],
  'Social Proof': ['Testimonials', 'StatsCounter', 'CircleBadge', 'FeatureGrid'],
  Cards: ['Card'],
};

// Default props for new blocks
const defaultBlockProps: Record<string, Record<string, unknown>> = {
  Hero: { title: 'New Hero Section', subtitle: 'Add your subtitle here', accentColor: 'purple' },
  TextBlock: { content: 'Add your text here...', alignment: 'left' },
  Button: { children: 'Click me', variant: 'purple', size: 'md' },
  Card: { children: 'Card content' },
  PageHeader: { title: 'Page Title', subtitle: 'Page subtitle' },
  CTASection: { title: 'Ready to get started?', buttonText: 'Get Started', buttonHref: '/get-started' },
  Spacer: { size: 'md' },
  Container: { maxWidth: 'lg', padding: 'md' },
  Columns: { layout: '2-col', gap: 'md' },
  Divider: { style: 'solid', color: 'gray' },
  Image: { src: '/placeholder.jpg', alt: 'Image description' },
  ImageGallery: { images: [] },
  ImageText: { title: 'Title', content: 'Content', imageSrc: '/placeholder.jpg' },
  RichText: { content: '<p>Rich text content</p>' },
  Accordion: { items: [{ title: 'Question', content: 'Answer' }] },
  Tabs: { tabs: [{ label: 'Tab 1', content: 'Tab content' }] },
  FeatureGrid: { title: 'Features', features: [] },
  ProductCard: { productId: '' },
  ProductGrid: { title: 'Products' },
  FeaturedProduct: { title: 'Featured Product' },
  PricingTable: { plans: [] },
  Testimonials: { title: 'What people say', testimonials: [] },
  VideoEmbed: { url: '' },
  StatsCounter: { stats: [] },
  CircleBadge: { icon: 'star', color: 'purple' },
};

// Block display names and icons
const blockInfo: Record<string, { name: string; icon: string }> = {
  Hero: { name: 'Hero Section', icon: '🎯' },
  TextBlock: { name: 'Text Block', icon: '📝' },
  RichText: { name: 'Rich Text', icon: '📄' },
  Button: { name: 'Button', icon: '🔘' },
  Card: { name: 'Card', icon: '🃏' },
  PageHeader: { name: 'Page Header', icon: '📰' },
  CTASection: { name: 'Call to Action', icon: '📢' },
  Spacer: { name: 'Spacer', icon: '↕️' },
  Container: { name: 'Container', icon: '📦' },
  Columns: { name: 'Columns', icon: '▤' },
  Divider: { name: 'Divider', icon: '➖' },
  Image: { name: 'Image', icon: '🖼️' },
  ImageGallery: { name: 'Image Gallery', icon: '🎨' },
  ImageText: { name: 'Image + Text', icon: '📸' },
  Accordion: { name: 'Accordion', icon: '🪗' },
  Tabs: { name: 'Tabs', icon: '📑' },
  FeatureGrid: { name: 'Feature Grid', icon: '⭐' },
  ProductCard: { name: 'Product Card', icon: '🛍️' },
  ProductGrid: { name: 'Product Grid', icon: '🛒' },
  FeaturedProduct: { name: 'Featured Product', icon: '✨' },
  PricingTable: { name: 'Pricing Table', icon: '💰' },
  Testimonials: { name: 'Testimonials', icon: '💬' },
  VideoEmbed: { name: 'Video Embed', icon: '🎬' },
  StatsCounter: { name: 'Stats Counter', icon: '📊' },
  CircleBadge: { name: 'Circle Badge', icon: '🔵' },
};

// ============================================================================
// Block Editor Page Component
// ============================================================================

export default function BlockEditorPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [page, setPage] = useState<PageData | null>(null);
  const [sections, setSections] = useState<PuckComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // UI state
  const [showBlockPicker, setShowBlockPicker] = useState(false);
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<number | null>(null);

  // Auth protection
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (!authLoading && isAuthenticated && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isAdmin, authLoading, router]);

  // Fetch page data
  useEffect(() => {
    if (!isAdmin) return;

    const fetchPage = async () => {
      try {
        const response = await fetch(`/api/pages/${params.slug}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load page');
        }

        setPage(data.page);
        setSections(data.page.content?.content || []);
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Failed to load page', 'error');
        router.push('/admin/pages');
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [isAdmin, params.slug, router, showToast]);

  // Save changes
  const handleSave = useCallback(async () => {
    if (!page) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/pages/${params.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: {
            content: sections,
            root: page.content?.root || {},
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save page');
      }

      setHasChanges(false);
      showToast('Page saved successfully', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save page', 'error');
    } finally {
      setSaving(false);
    }
  }, [page, params.slug, sections, showToast]);

  // Add a new section
  const handleAddSection = useCallback((blockType: string) => {
    const newSection: PuckComponent = {
      type: blockType,
      props: defaultBlockProps[blockType] ? { ...defaultBlockProps[blockType] } : {},
    };

    setSections(prev => [...prev, newSection]);
    setHasChanges(true);
    setShowBlockPicker(false);
    setSelectedSection(sections.length); // Select the new section
  }, [sections.length]);

  // Move section up
  const handleMoveUp = useCallback((index: number) => {
    if (index === 0) return;

    setSections(prev => {
      const newSections = [...prev];
      [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
      return newSections;
    });
    setHasChanges(true);
    if (selectedSection === index) setSelectedSection(index - 1);
  }, [selectedSection]);

  // Move section down
  const handleMoveDown = useCallback((index: number) => {
    if (index === sections.length - 1) return;

    setSections(prev => {
      const newSections = [...prev];
      [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
      return newSections;
    });
    setHasChanges(true);
    if (selectedSection === index) setSelectedSection(index + 1);
  }, [sections.length, selectedSection]);

  // Delete section
  const handleDeleteSection = useCallback((index: number) => {
    setSectionToDelete(index);
    setShowDeleteConfirm(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (sectionToDelete === null) return;

    setSections(prev => prev.filter((_, i) => i !== sectionToDelete));
    setHasChanges(true);
    setShowDeleteConfirm(false);
    setSectionToDelete(null);
    if (selectedSection === sectionToDelete) setSelectedSection(null);
  }, [sectionToDelete, selectedSection]);

  // Update section props
  const handleUpdateSection = useCallback((index: number, newProps: Record<string, unknown>) => {
    setSections(prev => {
      const newSections = [...prev];
      newSections[index] = {
        ...newSections[index],
        props: { ...newSections[index].props, ...newProps },
      };
      return newSections;
    });
    setHasChanges(true);
  }, []);

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">Loading page...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin || !page) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* ====================================================================
          Header
          ==================================================================== */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-3">
            <Link
              href="/dashboard"
              className="text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              Admin
            </Link>
            <span className="text-gray-400 dark:text-gray-500">/</span>
            <Link
              href="/admin/pages"
              className="text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              Pages
            </Link>
            <span className="text-gray-400 dark:text-gray-500">/</span>
            <span className="text-gray-900 dark:text-gray-100 font-medium">{page.title}</span>
            <span className="text-gray-400 dark:text-gray-500">/</span>
            <span className="text-purple-600 dark:text-purple-400 font-medium">Block Editor</span>
          </nav>

          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/pages"
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="Back to Pages"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Block Editor: {page.title}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {sections.length} section{sections.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {hasChanges && (
                <span data-testid="unsaved-indicator" className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  Unsaved changes
                </span>
              )}
              <Link
                href={`/admin/pages/${page.slug}/edit`}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
              >
                Full Editor
              </Link>
              <Button
                variant="purple"
                onClick={handleSave}
                disabled={saving || !hasChanges}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          Main Content
          ==================================================================== */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Section List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Page Sections
              </h2>
              <Button
                variant="purple"
                size="sm"
                onClick={() => setShowBlockPicker(true)}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Section
                </span>
              </Button>
            </div>

            <div data-testid="section-list" className="space-y-3">
              {sections.map((section, index) => {
                const info = blockInfo[section.type] || { name: section.type, icon: '📦' };
                const isSelected = selectedSection === index;

                return (
                  <div
                    key={index}
                    data-testid="section-item"
                    onClick={() => setSelectedSection(isSelected ? null : index)}
                    className={`
                      group relative p-4 rounded-xl border-2 cursor-pointer transition-all
                      ${isSelected
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300 dark:hover:border-purple-600'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div data-testid="section-preview" className="text-2xl">
                          {info.icon}
                        </div>
                        <div>
                          <span data-testid="section-type" className="font-medium text-gray-900 dark:text-gray-100">
                            {info.name}
                          </span>
                          {typeof section.props.title === 'string' && section.props.title && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                              {section.props.title}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMoveUp(index); }}
                          disabled={index === 0}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move up"
                        >
                          <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMoveDown(index); }}
                          disabled={index === sections.length - 1}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move down"
                        >
                          <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteSection(index); }}
                          className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
                          title="Delete section"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {sections.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl">
                  <div className="text-4xl mb-3">📄</div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    No sections yet. Add your first section to get started.
                  </p>
                  <Button
                    variant="purple"
                    onClick={() => setShowBlockPicker(true)}
                  >
                    Add First Section
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Edit Panel */}
          <div className="lg:col-span-1">
            <Card>
              <div data-testid="section-editor" className="p-4">
                {selectedSection !== null && sections[selectedSection] ? (
                  <>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      Edit: {blockInfo[sections[selectedSection].type]?.name || sections[selectedSection].type}
                    </h3>
                    <SectionEditor
                      section={sections[selectedSection]}
                      onUpdate={(props) => handleUpdateSection(selectedSection, props)}
                    />
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <div className="text-3xl mb-2">👆</div>
                    <p>Select a section to edit its properties</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* ====================================================================
          Block Picker Dialog
          ==================================================================== */}
      {showBlockPicker && (
        <div
          data-testid="block-picker"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowBlockPicker(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Add Section
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Choose a block type to add to your page
              </p>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {Object.entries(blockCategories).map(([category, blocks]) => (
                <div key={category} className="mb-6 last:mb-0">
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                    {category}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {blocks.map((blockType) => {
                      const info = blockInfo[blockType] || { name: blockType, icon: '📦' };
                      return (
                        <button
                          key={blockType}
                          onClick={() => handleAddSection(blockType)}
                          className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors text-left"
                        >
                          <span className="text-xl">{info.icon}</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {info.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <Button variant="gray" onClick={() => setShowBlockPicker(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          Delete Confirmation
          ==================================================================== */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setSectionToDelete(null);
        }}
        title="Delete Section"
        message="Are you sure you want to delete this section? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
      />
    </div>
  );
}

// ============================================================================
// Section Editor Component
// ============================================================================

interface SectionEditorProps {
  section: PuckComponent;
  onUpdate: (props: Record<string, unknown>) => void;
}

function SectionEditor({ section, onUpdate }: SectionEditorProps) {
  const props = section.props;

  // Get editable fields based on section type
  const editableFields = getEditableFields(section.type);

  return (
    <div className="space-y-4">
      {editableFields.map((field) => (
        <div key={field.key}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {field.label}
          </label>
          {field.type === 'text' && (
            <input
              type="text"
              value={String(props[field.key] || '')}
              onChange={(e) => onUpdate({ [field.key]: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          )}
          {field.type === 'textarea' && (
            <textarea
              value={String(props[field.key] || '')}
              onChange={(e) => onUpdate({ [field.key]: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          )}
          {field.type === 'select' && field.options && (
            <select
              value={String(props[field.key] || '')}
              onChange={(e) => onUpdate({ [field.key]: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {field.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}
        </div>
      ))}

      {editableFields.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          This section type has no editable properties in simple mode.
          Use the Full Editor for advanced customization.
        </p>
      )}
    </div>
  );
}

// Define editable fields for each section type
interface EditableField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select';
  options?: { value: string; label: string }[];
}

function getEditableFields(sectionType: string): EditableField[] {
  const colorOptions = [
    { value: 'purple', label: 'Purple' },
    { value: 'blue', label: 'Blue' },
    { value: 'green', label: 'Green' },
    { value: 'orange', label: 'Orange' },
    { value: 'teal', label: 'Teal' },
    { value: 'gray', label: 'Gray' },
  ];

  const fields: Record<string, EditableField[]> = {
    Hero: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'subtitle', label: 'Subtitle', type: 'textarea' },
      { key: 'accentColor', label: 'Accent Color', type: 'select', options: colorOptions },
    ],
    TextBlock: [
      { key: 'content', label: 'Content', type: 'textarea' },
    ],
    Button: [
      { key: 'children', label: 'Button Text', type: 'text' },
      { key: 'href', label: 'Link URL', type: 'text' },
      { key: 'variant', label: 'Color', type: 'select', options: colorOptions },
    ],
    PageHeader: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'subtitle', label: 'Subtitle', type: 'textarea' },
    ],
    CTASection: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'buttonText', label: 'Button Text', type: 'text' },
      { key: 'buttonHref', label: 'Button Link', type: 'text' },
    ],
    ImageText: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'content', label: 'Content', type: 'textarea' },
      { key: 'imageSrc', label: 'Image URL', type: 'text' },
    ],
    Testimonials: [
      { key: 'title', label: 'Section Title', type: 'text' },
      { key: 'subtitle', label: 'Subtitle', type: 'textarea' },
    ],
    FeatureGrid: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'subtitle', label: 'Subtitle', type: 'textarea' },
    ],
    VideoEmbed: [
      { key: 'url', label: 'Video URL', type: 'text' },
    ],
  };

  return fields[sectionType] || [];
}
