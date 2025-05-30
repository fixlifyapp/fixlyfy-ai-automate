
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { secureStorage, logSecurityEvent } from '@/utils/security';

interface SessionInfo {
  isActive: boolean;
  expiresAt: Date | null;
  lastActivity: Date;
}

export const useSecureSession = () => {
  const [sessionInfo, setSessionInfo] = useState<SessionInfo>({
    isActive: false,
    expiresAt: null,
    lastActivity: new Date()
  });

  // Session timeout (30 minutes of inactivity)
  const SESSION_TIMEOUT = 30 * 60 * 1000;
  
  const updateLastActivity = useCallback(() => {
    const now = new Date();
    setSessionInfo(prev => ({ ...prev, lastActivity: now }));
    secureStorage.set('lastActivity', now.toISOString());
  }, []);

  const checkSessionExpiry = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      setSessionInfo({ isActive: false, expiresAt: null, lastActivity: new Date() });
      return;
    }

    const lastActivity = secureStorage.get('lastActivity');
    const lastActivityTime = lastActivity ? new Date(lastActivity) : new Date();
    const timeSinceLastActivity = Date.now() - lastActivityTime.getTime();

    if (timeSinceLastActivity > SESSION_TIMEOUT) {
      await handleSessionTimeout();
      return;
    }

    const expiresAt = session.expires_at ? new Date(session.expires_at * 1000) : null;
    setSessionInfo({
      isActive: true,
      expiresAt,
      lastActivity: lastActivityTime
    });
  }, []);

  const handleSessionTimeout = useCallback(async () => {
    await logSecurityEvent('session_timeout', { 
      reason: 'inactivity',
      lastActivity: sessionInfo.lastActivity 
    });
    
    await supabase.auth.signOut();
    secureStorage.clear();
    setSessionInfo({ isActive: false, expiresAt: null, lastActivity: new Date() });
  }, [sessionInfo.lastActivity]);

  const invalidateSession = useCallback(async (reason: string = 'manual') => {
    await logSecurityEvent('session_invalidated', { reason });
    await supabase.auth.signOut();
    secureStorage.clear();
    setSessionInfo({ isActive: false, expiresAt: null, lastActivity: new Date() });
  }, []);

  // Set up activity listeners
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const activityHandler = () => {
      updateLastActivity();
    };

    events.forEach(event => {
      document.addEventListener(event, activityHandler, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, activityHandler, true);
      });
    };
  }, [updateLastActivity]);

  // Check session expiry periodically
  useEffect(() => {
    checkSessionExpiry();
    
    const interval = setInterval(checkSessionExpiry, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [checkSessionExpiry]);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        await logSecurityEvent('user_signed_out', { event });
        secureStorage.clear();
        setSessionInfo({ isActive: false, expiresAt: null, lastActivity: new Date() });
      } else if (event === 'SIGNED_IN') {
        await logSecurityEvent('user_signed_in', { event });
        updateLastActivity();
      }
    });

    return () => subscription.unsubscribe();
  }, [updateLastActivity]);

  return {
    sessionInfo,
    updateLastActivity,
    invalidateSession,
    checkSessionExpiry
  };
};
