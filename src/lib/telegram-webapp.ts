/**
 * Telegram WebApp (Mini App) helper utilities and Haptic Feedback SDK wrapper.
 * Safely degrades when running in regular browser outside Telegram.
 */

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        openLink: (url: string) => void;
        openTelegramLink: (url: string) => void;
        initData?: string;
        initDataUnsafe?: {
          user?: {
            id: number;
            first_name?: string;
            last_name?: string;
            username?: string;
            language_code?: string;
          };
          query_id?: string;
        };
        HapticFeedback?: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        MainButton?: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          onClick: (cb: () => void) => void;
          offClick: (cb: () => void) => void;
        };
        colorScheme?: 'light' | 'dark';
        themeParams?: Record<string, string>;
      };
    };
  }
}

export interface TelegramUserData {
  id?: number;
  firstName?: string;
  lastName?: string;
  username?: string;
  fullName: string;
}

export function isTelegramWebApp(): boolean {
  return typeof window !== 'undefined' && Boolean(window.Telegram?.WebApp?.initData);
}

export function initTelegramWebApp(): void {
  if (typeof window === 'undefined') return;
  try {
    const webApp = window.Telegram?.WebApp;
    if (webApp) {
      webApp.ready();
      webApp.expand();
    }
  } catch {
    // Ignore when not in Telegram
  }
}

export function getTelegramUser(): TelegramUserData | null {
  if (typeof window === 'undefined') return null;
  try {
    const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
    if (!user) return null;

    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim() || user.username || 'Користувач Telegram';

    return {
      id: user.id,
      firstName,
      lastName,
      username: user.username,
      fullName,
    };
  } catch {
    return null;
  }
}

export function hapticImpact(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'light'): void {
  if (typeof window === 'undefined') return;
  try {
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred(style);
  } catch {
    // Graceful fallback
  }
}

export function hapticNotification(type: 'success' | 'warning' | 'error' = 'success'): void {
  if (typeof window === 'undefined') return;
  try {
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred(type);
  } catch {
    // Graceful fallback
  }
}

export function hapticSelection(): void {
  if (typeof window === 'undefined') return;
  try {
    window.Telegram?.WebApp?.HapticFeedback?.selectionChanged();
  } catch {
    // Graceful fallback
  }
}
