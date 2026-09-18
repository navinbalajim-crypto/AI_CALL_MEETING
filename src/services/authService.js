import { api } from './api';

const USER_STORAGE_KEY = 'g13_current_user';

export const authService = {
  getCurrentUser() {
    const userJson = localStorage.getItem(USER_STORAGE_KEY);
    if (!userJson) return null;
    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  },

  async login(email, password) {
    try {
      // Try backend endpoint
      const response = await api.post('/auth/login', { email, password });
      if (response && response.token) {
        api.setToken(response.token);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.user));
        return response.user;
      }
    } catch {
      console.log('[Auth] Using local session fallback for demo.');
    }

    // High quality local fallback session for offline / demo mode
    const name = email.split('@')[0].replace('.', ' ');
    const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
    
    // Check if voice profile has been registered for this user before
    const hasVoiceProfile = localStorage.getItem(`g13_voice_profile_${email}`) !== null;

    const mockUser = {
      id: 'usr_' + Math.random().toString(36).substr(2, 9),
      name: formattedName || 'Alex Rivera',
      email: email,
      role: 'Host & Engineering Lead',
      organization: 'FinEdge Platform',
      avatar: (formattedName || 'AR').substring(0, 2).toUpperCase(),
      hasVoiceProfile: hasVoiceProfile,
      createdAt: new Date().toISOString()
    };

    api.setToken('mock_jwt_token_' + Date.now());
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockUser));
    return mockUser;
  },

  async signup(name, email, password) {
    try {
      const response = await api.post('/auth/signup', { name, email, password });
      if (response && response.token) {
        api.setToken(response.token);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.user));
        return response.user;
      }
    } catch {
      console.log('[Auth] Using local session fallback for signup.');
    }

    const mockUser = {
      id: 'usr_' + Math.random().toString(36).substr(2, 9),
      name: name || 'Alex Rivera',
      email: email,
      role: 'Engineering Lead',
      organization: 'FinEdge Platform',
      avatar: (name || 'AR').substring(0, 2).toUpperCase(),
      hasVoiceProfile: false, // Brand new account must complete voice memory onboarding!
      createdAt: new Date().toISOString()
    };

    api.setToken('mock_jwt_token_' + Date.now());
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockUser));
    return mockUser;
  },

  async loginDemoUser() {
    return this.login('alex.rivera@finedge.io', 'DemoPass123!');
  },

  logout() {
    api.setToken(null);
    localStorage.removeItem(USER_STORAGE_KEY);
  },

  updateUserVoiceProfileStatus(hasProfile) {
    const user = this.getCurrentUser();
    if (user) {
      user.hasVoiceProfile = hasProfile;
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      localStorage.setItem(`g13_voice_profile_${user.email}`, 'active');
    }
    return user;
  }
};

export default authService;
