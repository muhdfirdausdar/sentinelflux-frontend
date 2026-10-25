// Example usage of the generic useSSE hook for other endpoints

import { useSSE, useSSESelector } from '../hooks/useSSE';

// Example 1: Simple SSE connection without authentication
export function usePublicNotifications() {
  return useSSE({
    endpoint: '/public/notifications',
    requireAuth: false,
    enabled: true
  });
}

// Example 2: Authenticated SSE with custom message handler
export function useUserUpdates() {
  return useSSE({
    endpoint: '/user/updates',
    requireAuth: true,
    enabled: true,
    onMessage: (data) => {
      console.log('User update received:', data);
    }
  });
}

// Example 3: Using selector for specific data
export function useNotificationCount() {
  return useSSESelector('/notifications', (s: any) => s?.data?.count ?? 0);
}

// Example 4: Chat messages SSE
export function useChatMessages(roomId: string) {
  const endpoint = `/chat/room/${roomId}/messages`;
  
  return useSSE({
    endpoint,
    requireAuth: true,
    enabled: !!roomId // only connect if roomId is provided
  });
}

// Example 5: Real-time logs with selector
export function useSystemLogs() {
  const { data, running, stop } = useSSE({
    endpoint: '/admin/logs',
    requireAuth: true
  });
  
  const latestLogs = useSSESelector('/admin/logs', (s: any) => s?.data?.logs ?? []);
  const logLevel = useSSESelector('/admin/logs', (s: any) => s?.data?.level ?? 'info');
  
  return { logs: latestLogs, level: logLevel, running, stop };
}
