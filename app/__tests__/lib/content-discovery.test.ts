import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';

// ============================================================================
// Content Discovery Tests
// ============================================================================
// TDD: Testing content auto-discovery implementation
// Goal: Scan /content directory and generate route manifest automatically

// Mock the fs module
vi.mock('fs');

// Import the functions we're testing
import {
  discoverContentFiles,
  generateRouteManifest,
  validateContentFile,
  getContentForRoute,
  isRouteEditable,
} from '@/lib/content-discovery';

describe('Content Discovery', () => {
  const mockContentDir = '/app/content';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('discoverContentFiles', () => {
    it('should find all JSON files in content directory', () => {
      // Setup: Mock directory with JSON files
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockReturnValue([
        'home.json',
        'services.json',
        'pricing.json',
        'README.md', // Should be ignored
      ] as unknown as fs.Dirent[]);
      vi.mocked(fs.statSync).mockReturnValue({
        isDirectory: () => false,
        isFile: () => true,
      } as fs.Stats);

      const files = discoverContentFiles(mockContentDir);

      expect(files).toHaveLength(3);
      expect(files).toContain('home.json');
      expect(files).toContain('services.json');
      expect(files).toContain('pricing.json');
      expect(files).not.toContain('README.md');
    });

    it('should return empty array if content directory does not exist', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const files = discoverContentFiles(mockContentDir);
      expect(files).toEqual([]);
    });

    it('should handle nested content directories', () => {
      // Setup: Mock nested structure like content/blog/post-1.json
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockImplementation((dirPath) => {
        if (dirPath === mockContentDir) {
          return ['home.json', 'blog'] as unknown as fs.Dirent[];
        }
        if (String(dirPath).includes('blog')) {
          return ['post-1.json', 'post-2.json'] as unknown as fs.Dirent[];
        }
        return [] as unknown as fs.Dirent[];
      });
      vi.mocked(fs.statSync).mockImplementation((filePath) => ({
        isDirectory: () => String(filePath).endsWith('blog'),
        isFile: () => !String(filePath).endsWith('blog'),
      } as fs.Stats));

      const files = discoverContentFiles(mockContentDir);
      expect(files).toContain('home.json');
      expect(files).toContain('blog/post-1.json');
      expect(files).toContain('blog/post-2.json');
    });
  });

  describe('generateRouteManifest', () => {
    it('should generate route manifest from content files', () => {
      const contentFiles = ['home.json', 'services.json', 'faq.json'];

      const manifest = generateRouteManifest(contentFiles);

      expect(manifest).toEqual({
        '/': 'home',
        '/services': 'services',
        '/faq': 'faq',
      });
    });

    it('should handle kebab-case file names', () => {
      const contentFiles = ['how-it-works.json', 'get-started.json'];

      const manifest = generateRouteManifest(contentFiles);

      expect(manifest).toEqual({
        '/how-it-works': 'how-it-works',
        '/get-started': 'get-started',
      });
    });

    it('should map home.json to root route', () => {
      const contentFiles = ['home.json'];

      const manifest = generateRouteManifest(contentFiles);

      expect(manifest['/']).toBe('home');
    });

    it('should handle nested content files as nested routes', () => {
      const contentFiles = ['blog/post-1.json', 'blog/post-2.json'];

      const manifest = generateRouteManifest(contentFiles);

      expect(manifest['/blog/post-1']).toBe('blog/post-1');
      expect(manifest['/blog/post-2']).toBe('blog/post-2');
    });
  });

  describe('validateContentFile', () => {
    it('should validate content file has required fields', () => {
      const validContent = {
        header: {
          title: 'Test Title',
          description: 'Test Description',
        },
      };

      const result = validateContentFile(validContent);
      expect(result.valid).toBe(true);
    });

    it('should reject content file without header', () => {
      const invalidContent = {
        items: [],
      };

      const result = validateContentFile(invalidContent);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('header');
    });

    it('should reject content file with invalid header', () => {
      const invalidContent = {
        header: { description: 'No title' },
      };

      const result = validateContentFile(invalidContent);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('title');
    });

    it('should reject non-object content', () => {
      const result = validateContentFile('not an object');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('object');
    });
  });

  describe('getContentForRoute', () => {
    it('should load content from JSON file for route', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
        header: { title: 'Test', description: 'Test desc' },
      }));

      const content = getContentForRoute('/services', mockContentDir);
      expect(content).not.toBeNull();
      expect((content?.header as { title: string }).title).toBe('Test');
    });

    it('should return null for non-existent route', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const content = getContentForRoute('/nonexistent', mockContentDir);
      expect(content).toBeNull();
    });

    it('should handle root route', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
        header: { title: 'Home', description: 'Home page' },
      }));

      const content = getContentForRoute('/', mockContentDir);
      expect(content).not.toBeNull();
    });

    it('should return null for invalid JSON', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('not valid json');

      const content = getContentForRoute('/services', mockContentDir);
      expect(content).toBeNull();
    });
  });

  describe('isRouteEditable', () => {
    const manifest = {
      '/': 'home',
      '/services': 'services',
      '/pricing': 'pricing',
    };

    it('should return true for routes in manifest', () => {
      expect(isRouteEditable('/', manifest)).toBe(true);
      expect(isRouteEditable('/services', manifest)).toBe(true);
      expect(isRouteEditable('/pricing', manifest)).toBe(true);
    });

    it('should return false for routes not in manifest', () => {
      expect(isRouteEditable('/unknown', manifest)).toBe(false);
      expect(isRouteEditable('/blog', manifest)).toBe(false);
    });

    it('should handle trailing slashes', () => {
      expect(isRouteEditable('/services/', manifest)).toBe(true);
      expect(isRouteEditable('/pricing/', manifest)).toBe(true);
    });
  });
});
