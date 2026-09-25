export const PORTFOLIO_PAGES = [
  { id: 'home', label: 'Homepage', path: '/' },
  { id: 'work', label: 'Selected work', path: '/work' },
  { id: 'capabilities', label: 'Capabilities', path: '/services' },
] as const;

export type PortfolioPageId = (typeof PORTFOLIO_PAGES)[number]['id'];

export function getPortfolioPage(id: string | null) {
  return PORTFOLIO_PAGES.find((page) => page.id === id);
}
