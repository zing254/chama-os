import { supabase } from './supabase';

interface PushSubscription {
  id: string;
  userId: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  createdAt: string;
}

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: Record<string, string>;
  actions?: { action: string; title: string }[];
}

class PushNotificationService {
  private vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

  async subscribe(userId: string): Promise<PushSubscription | null> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications not supported');
      return null;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('Notification permission denied');
        return null;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey),
      });

      const { data, error } = await supabase
        .from('push_subscriptions')
        .insert({
          id: `push${Date.now()}`,
          user_id: userId,
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.toJSON().keys?.p256dh || '',
            auth: subscription.toJSON().keys?.auth || '',
          },
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Push subscription error:', error);
      return null;
    }
  }

  async unsubscribe(subscriptionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('id', subscriptionId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Unsubscribe error:', error);
      return false;
    }
  }

  async notify(userId: string, payload: NotificationPayload): Promise<boolean> {
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId);

    if (!subscriptions?.length) return false;

    const { data: result } = await supabase.functions.invoke('send-push', {
      body: {
        subscriptions: subscriptions.map(s => ({
          endpoint: s.endpoint,
          keys: s.keys,
        })),
        payload,
      },
    });

    return result?.success || false;
  }

  async notifyAllMembers(payload: NotificationPayload, chamaId?: string): Promise<number> {
    let query = supabase.from('members').select('id, email');
    if (chamaId) query = query.eq('chama_id', chamaId);
    const { data: members } = await query;

    if (!members?.length) return 0;

    const results = await Promise.allSettled(
      members.map(member => this.notify(member.id, payload))
    );
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;

    return successCount;
  }

  private urlBase64ToUint8Array(base64String: string): ArrayBuffer {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray.buffer;
  }

  async showLocalNotification(title: string, body: string, icon?: string): Promise<boolean> {
    if (!('Notification' in window)) return false;

    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon });
      return true;
    }

    return false;
  }
}

export const pushService = new PushNotificationService();

export const notifyTypes = {
  contributionReceived: (memberName: string, amount: string) => ({
    title: '💰 Contribution Received',
    body: `${memberName} paid KSh ${amount}`,
  }),
  loanApproved: (memberName: string, amount: string) => ({
    title: '✅ Loan Approved',
    body: `Your KSh ${amount} loan has been approved`,
  }),
  meetingReminder: (title: string, date: string) => ({
    title: '📅 Meeting Reminder',
    body: `${title} - ${date}`,
  }),
  repaymentDue: (amount: string, dueDate: string) => ({
    title: '⏰ Repayment Due',
    body: `KSh ${amount} due on ${dueDate}`,
  }),
};