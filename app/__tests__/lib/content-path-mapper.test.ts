import {
  findTextInContent,
  findBestMatch,
  buildSelectionFromMatch,
  type ContentMatch,
} from '@/lib/content-path-mapper';

// Sample page content for testing
const sampleContent = {
  hero: {
    title: 'Welcome to Our Site',
    description: 'A great description here',
    buttons: [
      { text: 'Get Started', variant: 'blue', href: '/start' },
      { text: 'Learn More', variant: 'purple', href: '/learn' },
    ],
  },
  services: {
    title: 'Our Services',
    cards: [
      { title: 'Web Development', description: 'Build modern websites', color: 'blue' },
      { title: 'App Development', description: 'Create mobile apps', color: 'green' },
    ],
  },
  faq: {
    title: 'Frequently Asked Questions',
    items: [
      { question: 'How does this work?', answer: 'It works like magic' },
      { question: 'What is the price?', answer: 'Contact us for pricing' },
    ],
  },
};

describe('content-path-mapper', () => {
  describe('findTextInContent', () => {
    it('finds text in top-level fields', () => {
      const matches = findTextInContent(sampleContent, 'Welcome to Our Site', { exactMatch: true });
      expect(matches).toHaveLength(1);
      expect(matches[0].path).toBe('hero.title');
      expect(matches[0].sectionKey).toBe('hero');
      expect(matches[0].fieldPath).toBe('title');
    });

    it('finds text in nested objects', () => {
      const matches = findTextInContent(sampleContent, 'Our Services', { exactMatch: true });
      expect(matches).toHaveLength(1);
      expect(matches[0].path).toBe('services.title');
    });

    it('finds text in array items', () => {
      const matches = findTextInContent(sampleContent, 'Get Started', { exactMatch: true });
      expect(matches).toHaveLength(1);
      expect(matches[0].path).toBe('hero.buttons.0.text');
      expect(matches[0].isArrayItem).toBe(true);
      expect(matches[0].arrayField).toBe('buttons');
      expect(matches[0].arrayIndex).toBe(0);
    });

    it('finds text in nested array objects', () => {
      const matches = findTextInContent(sampleContent, 'Web Development', { exactMatch: true });
      expect(matches).toHaveLength(1);
      expect(matches[0].path).toBe('services.cards.0.title');
      expect(matches[0].arrayIndex).toBe(0);
    });

    it('finds partial matches when exactMatch is false', () => {
      const matches = findTextInContent(sampleContent, 'Development', { exactMatch: false });
      // Should find both "Web Development" and "App Development"
      expect(matches.length).toBeGreaterThanOrEqual(2);
      const paths = matches.map(m => m.path);
      expect(paths).toContain('services.cards.0.title');
      expect(paths).toContain('services.cards.1.title');
    });

    it('returns empty array for non-existent text', () => {
      const matches = findTextInContent(sampleContent, 'XYZ123NotFound', { exactMatch: true });
      expect(matches).toHaveLength(0);
    });

    it('handles case-insensitive search by default', () => {
      const matches = findTextInContent(sampleContent, 'welcome to our site');
      expect(matches.length).toBeGreaterThanOrEqual(1);
    });

    it('handles case-sensitive search when specified', () => {
      const matchesLower = findTextInContent(sampleContent, 'welcome to our site', { caseSensitive: true });
      const matchesCorrect = findTextInContent(sampleContent, 'Welcome to Our Site', { caseSensitive: true });
      expect(matchesLower).toHaveLength(0);
      expect(matchesCorrect).toHaveLength(1);
    });

    it('sorts results by path depth (deeper first)', () => {
      const matches = findTextInContent(sampleContent, 'Development', { exactMatch: false });
      // Deeper paths should come first
      expect(matches[0].path.split('.').length).toBeGreaterThanOrEqual(
        matches[matches.length - 1].path.split('.').length
      );
    });
  });

  describe('findBestMatch', () => {
    it('prefers exact matches over partial matches', () => {
      const match = findBestMatch(sampleContent, 'Web Development');
      expect(match).not.toBeNull();
      expect(match!.value).toBe('Web Development');
      expect(match!.path).toBe('services.cards.0.title');
    });

    it('returns null for non-existent text', () => {
      const match = findBestMatch(sampleContent, 'XYZ123NotFound');
      expect(match).toBeNull();
    });

    it('finds the deepest match for ambiguous text', () => {
      // If searching for a common word, should return deepest (most specific) match
      const match = findBestMatch(sampleContent, 'price');
      expect(match).not.toBeNull();
      // Should match the deepest occurrence
      expect(match!.path.split('.').length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('buildSelectionFromMatch', () => {
    it('builds section selection for non-array content', () => {
      const match: ContentMatch = {
        path: 'hero.title',
        sectionKey: 'hero',
        fieldPath: 'title',
        value: 'Welcome to Our Site',
        isArrayItem: false,
      };

      const result = buildSelectionFromMatch(match, sampleContent);
      expect(result.type).toBe('section');
      expect(result.selection.sectionKey).toBe('hero');
      expect(result.selection.label).toBe('Hero');
    });

    it('builds item selection for array content', () => {
      const match: ContentMatch = {
        path: 'hero.buttons.0.text',
        sectionKey: 'hero',
        fieldPath: 'buttons.0.text',
        value: 'Get Started',
        isArrayItem: true,
        arrayField: 'buttons',
        arrayIndex: 0,
      };

      const result = buildSelectionFromMatch(match, sampleContent);
      expect(result.type).toBe('item');
      expect(result.selection.sectionKey).toBe('hero');
      expect(result.selection.arrayField).toBe('buttons');
      expect(result.selection.index).toBe(0);
    });

    it('uses item title/text for label when available', () => {
      const match: ContentMatch = {
        path: 'services.cards.0.title',
        sectionKey: 'services',
        fieldPath: 'cards.0.title',
        value: 'Web Development',
        isArrayItem: true,
        arrayField: 'cards',
        arrayIndex: 0,
      };

      const result = buildSelectionFromMatch(match, sampleContent);
      expect(result.selection.label).toBe('Web Development');
    });

    it('uses question field for FAQ-like items', () => {
      const match: ContentMatch = {
        path: 'faq.items.0.question',
        sectionKey: 'faq',
        fieldPath: 'items.0.question',
        value: 'How does this work?',
        isArrayItem: true,
        arrayField: 'items',
        arrayIndex: 0,
      };

      const result = buildSelectionFromMatch(match, sampleContent);
      expect(result.selection.label).toBe('How does this work?');
    });
  });
});
