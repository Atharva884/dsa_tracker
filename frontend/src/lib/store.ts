import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";

export interface User {
  id: string;
  name: string;
  lName: string;
  email: string;
  role: string;
}

export interface Problem {
  _id: string;
  title: string;
  link: string;
  done: boolean;
  userId: string;
  cycleNumber: number;
  createdAt: string;
  completedAt?: string;
}

export interface Stats {
  total: number;
  completed: number;
  remaining: number;
  progress: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  checkAuth: () => void;
  setHydrated: () => void;
}

interface ProblemsState {
  problems: Problem[];
  stats: Stats;
  isLoading: boolean;
  error: string | null;
  setProblems: (problems: Problem[]) => void;
  addProblems: (problems: Problem[]) => void;
  updateProblem: (problemId: string, updates: Partial<Problem>) => void;
  setStats: (stats: Stats) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearProblems: () => void;
}

interface UIState {
  theme: "light" | "dark";
  sidebarOpen: boolean;
  uploadModalOpen: boolean;
  deleteModalOpen: boolean;
  toggleTheme: () => void;
  setSidebarOpen: (open: boolean) => void;
  setUploadModalOpen: (open: boolean) => void;
  setDeleteModalOpen: (open: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isHydrated: false,
      login: (userData, token) => {
        // Store token in cookies as well for API requests (client-side only)
        if (typeof window !== "undefined") {
          Cookies.set("token", token, { expires: 7 }); // 7 days
        }
        set({
          user: userData,
          token,
          isAuthenticated: true,
        });
      },
      logout: () => {
        // Clear both cookie and store (client-side only)
        if (typeof window !== "undefined") {
          Cookies.remove("token");
        }
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
      checkAuth: () => {
        // Only run on client side
        if (typeof window === "undefined") return;

        const state = get();
        const cookieToken = Cookies.get("token");

        // If we have a token in store but no cookie, logout
        if (state.token && !cookieToken) {
          get().logout();
          return;
        }

        // If we have a cookie but no token in store, clear the cookie
        if (!state.token && cookieToken) {
          Cookies.remove("token");
          return;
        }

        // If tokens don't match, sync them
        if (state.token && cookieToken && state.token !== cookieToken) {
          set({ token: cookieToken });
        }

        // Update isAuthenticated based on current state
        const isAuthenticated = !!(state.user && (state.token || cookieToken));
        if (state.isAuthenticated !== isAuthenticated) {
          set({ isAuthenticated });
        }
      },
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.checkAuth();
          state.setHydrated();
        }
      },
    }
  )
);

export const useProblemsStore = create<ProblemsState>((set) => ({
  problems: [],
  stats: { total: 0, completed: 0, remaining: 0, progress: 0 },
  isLoading: false,
  error: null,
  setProblems: (problems) => set({ problems }),
  addProblems: (newProblems) =>
    set((state) => ({ problems: [...state.problems, ...newProblems] })),
  updateProblem: (problemId, updates) =>
    set((state) => ({
      problems: state.problems.map((p) =>
        p._id === problemId ? { ...p, ...updates } : p
      ),
    })),
  setStats: (stats) => set({ stats }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearProblems: () => set({ problems: [] }),
}));

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: "light",
      sidebarOpen: false,
      uploadModalOpen: false,
      deleteModalOpen: false,
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      setUploadModalOpen: (uploadModalOpen) => set({ uploadModalOpen }),
      setDeleteModalOpen: (deleteModalOpen) => set({ deleteModalOpen }),
    }),
    {
      name: "ui-storage",
    }
  )
);
