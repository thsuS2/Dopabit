import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';
import { User } from '../types';

const TOKEN_KEY = 'dopabit_token';
const USER_KEY = 'dopabit_user';

type AuthListener = (isLoggedIn: boolean) => void;

class AuthStore {
  private user: User | null = null;
  private token: string | null = null;
  private listeners: AuthListener[] = [];

  subscribe(listener: AuthListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l(!!this.token));
  }

  getUser() {
    return this.user;
  }

  getToken() {
    return this.token;
  }

  isLoggedIn() {
    return !!this.token;
  }

  async init() {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      const userStr = await AsyncStorage.getItem(USER_KEY);
      if (token && userStr) {
        this.token = token;
        this.user = JSON.parse(userStr);
        api.setToken(token);
        this.notify();
      }
    } catch {}
  }

  async signUp(email: string, password: string, nickname: string) {
    const res = await api.post<{
      access_token: string;
      user_id: string;
      email: string;
      nickname: string;
    }>('/api/auth/signup', { email, password, nickname });

    this.token = res.access_token;
    this.user = {
      id: res.user_id,
      email: res.email,
      nickname: res.nickname,
      level: 1,
      streak: 0,
      total_score: 0,
      created_at: '',
      updated_at: '',
    };

    api.setToken(res.access_token);
    await AsyncStorage.setItem(TOKEN_KEY, res.access_token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(this.user));
    this.notify();
  }

  async signIn(email: string, password: string) {
    const res = await api.post<{
      access_token: string;
      user_id: string;
      email: string;
      nickname: string;
    }>('/api/auth/signin', { email, password });

    this.token = res.access_token;
    this.user = {
      id: res.user_id,
      email: res.email,
      nickname: res.nickname,
      level: 1,
      streak: 0,
      total_score: 0,
      created_at: '',
      updated_at: '',
    };

    api.setToken(res.access_token);
    await AsyncStorage.setItem(TOKEN_KEY, res.access_token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(this.user));
    this.notify();
  }

  async signOut() {
    this.token = null;
    this.user = null;
    api.clearToken();
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
    this.notify();
  }
}

export const authStore = new AuthStore();
