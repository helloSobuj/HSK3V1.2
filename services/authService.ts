import { User } from '../types';

// Keys for local storage
const PROGRESS_PREFIX = 'hanzihero_progress_';
const USERS_KEY = 'hanzihero_users';

interface AuthResponse {
  success: boolean;
  user?: User;
  message?: string;
}

export const authService = {
  /**
   * Load progress for a specific user (or guest)
   */
  loadProgress: (username: string): Set<string> => {
    try {
      const key = `${PROGRESS_PREFIX}${username.toLowerCase()}`;
      const saved = localStorage.getItem(key);
      const parsed = saved ? JSON.parse(saved) : [];
      return new Set<string>(parsed);
    } catch (e) {
      return new Set<string>();
    }
  },

  /**
   * Save progress for a specific user (or guest)
   */
  saveProgress: (username: string, masteredIds: Set<string>) => {
    try {
      const key = `${PROGRESS_PREFIX}${username.toLowerCase()}`;
      localStorage.setItem(key, JSON.stringify(Array.from(masteredIds)));
    } catch (e) {
      console.error("Failed to save progress", e);
    }
  },

  /**
   * Register a new user
   */
  register: async (username: string, password?: string): Promise<AuthResponse> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const usersJson = localStorage.getItem(USERS_KEY);
      const users: User[] = usersJson ? JSON.parse(usersJson) : [];

      if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        return { success: false, message: 'Username already taken' };
      }

      const newUser: User = { username, password };
      users.push(newUser);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));

      return { success: true, user: newUser };
    } catch (error) {
      return { success: false, message: 'Registration failed' };
    }
  },

  /**
   * Login existing user
   */
  login: async (username: string, password?: string): Promise<AuthResponse> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const usersJson = localStorage.getItem(USERS_KEY);
      const users: User[] = usersJson ? JSON.parse(usersJson) : [];

      const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

      if (!user || user.password !== password) {
        return { success: false, message: 'Invalid username or password' };
      }

      return { success: true, user };
    } catch (error) {
      return { success: false, message: 'Login failed' };
    }
  }
};