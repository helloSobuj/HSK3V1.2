import { User } from '../types';

// Keys for local storage simulation
const USERS_KEY = 'hanzihero_users';
const PROGRESS_PREFIX = 'hanzihero_progress_';

// Simulate an API delay for realism
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  /**
   * Register a new user
   */
  register: async (username: string, password: string): Promise<{ success: boolean; message?: string; user?: User }> => {
    await delay(500);
    
    try {
      const usersStr = localStorage.getItem(USERS_KEY);
      const users: User[] = usersStr ? JSON.parse(usersStr) : [];

      if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
        return { success: false, message: 'Username already exists' };
      }

      const newUser: User = { username, password }; // In production, never store plain text passwords
      users.push(newUser);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));

      return { success: true, user: newUser };
    } catch (e) {
      return { success: false, message: 'Registration failed' };
    }
  },

  /**
   * Login an existing user
   */
  login: async (username: string, password: string): Promise<{ success: boolean; message?: string; user?: User }> => {
    await delay(500);

    try {
      const usersStr = localStorage.getItem(USERS_KEY);
      const users: User[] = usersStr ? JSON.parse(usersStr) : [];

      const user = users.find(u => 
        u.username.toLowerCase() === username.toLowerCase() && u.password === password
      );

      if (!user) {
        return { success: false, message: 'Invalid username or password' };
      }

      return { success: true, user };
    } catch (e) {
      return { success: false, message: 'Login failed' };
    }
  },

  /**
   * Load progress for a specific user
   */
  loadProgress: (username: string): Set<string> => {
    try {
      const key = `${PROGRESS_PREFIX}${username.toLowerCase()}`;
      const saved = localStorage.getItem(key);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (e) {
      return new Set();
    }
  },

  /**
   * Save progress for a specific user
   */
  saveProgress: (username: string, masteredIds: Set<string>) => {
    try {
      const key = `${PROGRESS_PREFIX}${username.toLowerCase()}`;
      localStorage.setItem(key, JSON.stringify(Array.from(masteredIds)));
    } catch (e) {
      console.error("Failed to save progress", e);
    }
  }
};