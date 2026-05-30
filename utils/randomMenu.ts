import { MenuItem, FilterCriteria } from '@/types/menu';

export const getRandomMenu = (
  visibleMenus: MenuItem[],
  criteria: FilterCriteria,
  excludedIds: string[] = []
): MenuItem | null => {
  let filtered = visibleMenus.filter((menu) => !excludedIds.includes(menu.id));

  filtered = filtered.filter((menu) => menu.price <= criteria.budget);

  // `all` means randomize across every food source.
  if (criteria.place !== 'all') {
    filtered = filtered.filter((menu) => menu.place === criteria.place);
  }

  if (criteria.excludeTags.length > 0) {
    filtered = filtered.filter((menu) => {
      const matchInName = criteria.excludeTags.some((tag) => menu.name.includes(tag));
      const matchInTags = criteria.excludeTags.some((tag) =>
        menu.tags.some((t) => t.includes(tag) || tag.includes(t))
      );
      return !matchInName && !matchInTags;
    });
  }

  if (filtered.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex];
};
