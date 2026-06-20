'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getToken, deleteToken, onMessage } from 'firebase/messaging';
import { getFirebaseMessaging } from '@/shared/lib/firebase/config';
import { deviceApi } from '@/shared/lib/api/deviceRepository';
import { useAuth } from '@/shared/lib/context/AuthContext';

const STORAGE_KEY = 'lyrium_fcm_token';

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY);
}

function setStoredToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem(STORAGE_KEY, token);
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function useFcmToken() {
  const { user, isAuthenticated } = useAuth();
  const [fcmToken, setFcmToken] = useState<string | null>(getStoredToken);
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [loading, setLoading] = useState(false);
  const registeredRef = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermissionAndGetToken = useCallback(async (): Promise<string | null> => {
    if (typeof window === 'undefined') return null;
    if (!('Notification' in window)) return null;
    if (!('serviceWorker' in navigator)) return null;

    setLoading(true);
    try {
      let perm = Notification.permission;
      if (perm === 'default') {
        perm = await Notification.requestPermission();
      }
      setPermission(perm);

      if (perm !== 'granted') {
        setLoading(false);
        return null;
      }

      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      await navigator.serviceWorker.ready;

      const messaging = getFirebaseMessaging();
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: registration,
      });

      if (token) {
        setFcmToken(token);
        setStoredToken(token);
      }

      setLoading(false);
      return token;
    } catch (err) {
      console.error('[useFcmToken] Error:', err);
      setLoading(false);
      return null;
    }
  }, []);

  const unregisterToken = useCallback(async (): Promise<void> => {
    const token = getStoredToken();
    if (!token) return;

    try {
      await deviceApi.unregister(token);
    } catch {
      // Continue even if API fails
    }

    try {
      const messaging = getFirebaseMessaging();
      await deleteToken(messaging);
    } catch {
      // Continue even if token deletion fails
    }

    setFcmToken(null);
    setStoredToken(null);
    registeredRef.current = false;
  }, []);

  const registerDevice = useCallback(async (): Promise<void> => {
    if (registeredRef.current) return;
    if (!isAuthenticated || !user) return;

    const token = getStoredToken() || (await requestPermissionAndGetToken());
    if (!token) return;

    try {
      await deviceApi.register(token, 'web', navigator.userAgent);
      registeredRef.current = true;
    } catch (err) {
      console.error('[useFcmToken] Register device error:', err);
    }
  }, [isAuthenticated, user, requestPermissionAndGetToken]);

  useEffect(() => {
    if (!isAuthenticated) return;

    registerDevice();
  }, [isAuthenticated, registerDevice]);

  useEffect(() => {
    if (permission !== 'granted') return;
    if (!isAuthenticated) return;

    const messaging = getFirebaseMessaging();
    const unsubscribe = onMessage(messaging, (payload) => {
      const { notification, data } = payload;
      if (notification?.title) {
        const event = new CustomEvent('lyrium-fcm-foreground', {
          detail: {
            title: notification.title,
            body: notification.body || '',
            url: data?.url || '/customer/orders',
            type: data?.type,
            id: data?.order_id || data?.ticket_id || data?.store_id,
          },
        });
        window.dispatchEvent(event);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [permission, isAuthenticated]);

  useEffect(() => {
    if (permission !== 'granted') return;
    if (!isAuthenticated) return;

    const checkTokenRefresh = async () => {
      if (document.visibilityState !== 'visible') return;
      try {
        const messaging = getFirebaseMessaging();
        const newToken = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        });
        if (!newToken) return;
        const oldToken = getStoredToken();
        if (oldToken === newToken) return;
        setFcmToken(newToken);
        setStoredToken(newToken);
        if (oldToken) await deviceApi.unregister(oldToken).catch(() => {});
        await deviceApi.register(newToken, 'web', navigator.userAgent).catch(() => {});
      } catch {
        // token refresh check failed silently
      }
    };

    document.addEventListener('visibilitychange', checkTokenRefresh);
    return () => document.removeEventListener('visibilitychange', checkTokenRefresh);
  }, [permission, isAuthenticated]);

  const prevAuthRef = useRef(isAuthenticated);
  useEffect(() => {
    if (prevAuthRef.current && !isAuthenticated) {
      unregisterToken();
    }
    prevAuthRef.current = isAuthenticated;
  }, [isAuthenticated, unregisterToken]);

  return {
    fcmToken,
    permission,
    loading,
    requestPermissionAndGetToken,
    unregisterToken,
    registerDevice,
  };
}
