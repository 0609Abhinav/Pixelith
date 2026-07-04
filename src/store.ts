import { create } from 'zustand';

type Theme = 'dark' | 'light';

type StudioState = {
  theme: Theme;
  adminToken: string;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setAdminToken: (token: string) => void;
  clearAdminToken: () => void;
};

const storedTheme = window.localStorage.getItem('lumen-theme') as Theme | null;
const storedToken = window.localStorage.getItem('lumen-admin-token') ?? '';

export const useStudioStore = create<StudioState>((set, get) => ({
  theme: storedTheme ?? 'dark',
  adminToken: storedToken,
  setTheme: (theme) => {
    window.localStorage.setItem('lumen-theme', theme);
    set({ theme });
  },
  toggleTheme: () => {
    const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
    window.localStorage.setItem('lumen-theme', nextTheme);
    set({ theme: nextTheme });
  },
  setAdminToken: (token) => {
    window.localStorage.setItem('lumen-admin-token', token);
    set({ adminToken: token });
  },
  clearAdminToken: () => {
    window.localStorage.removeItem('lumen-admin-token');
    set({ adminToken: '' });
  },
}));
