export const mockStorage = {
  plansKey: 'lyrium_admin_plans',
  colorsKey: 'lyrium_admin_colors',
  timelineKey: 'lyrium_admin_timeline',
  
  getPlans: () => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(mockStorage.plansKey);
    return data ? JSON.parse(data) : null;
  },
  setPlans: (plans: unknown) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(mockStorage.plansKey, JSON.stringify(plans));
  },
  
  getColors: () => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(mockStorage.colorsKey);
    return data ? JSON.parse(data) : null;
  },
  setColors: (colors: unknown) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(mockStorage.colorsKey, JSON.stringify(colors));
  },
  
  getTimeline: () => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(mockStorage.timelineKey);
    return data ? JSON.parse(data) : null;
  },
  setTimeline: (timeline: unknown) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(mockStorage.timelineKey, JSON.stringify(timeline));
  },
};
