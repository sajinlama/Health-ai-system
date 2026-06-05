'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { MessageCircle, Copy, CheckCircle, AlertCircle, Link2, Unlink, RefreshCw, Send } from 'lucide-react';

export default function TelegramSettingsPage() {
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [testStatus, setTestStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Fetch Telegram settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['telegram-settings'],
    queryFn: async () => {
      const res = await fetch('/api/telegram/settings');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
  });
  
  // Unlink mutation
  const unlinkMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/telegram/settings', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to unlink');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telegram-settings'] });
    },
  });
  
  // Test notification mutation
  const testNotificationMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/telegram/test', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to send test');
      return res.json();
    },
    onSuccess: () => {
      setTestStatus({ type: 'success', message: 'Test notification sent! Check your Telegram.' });
      setTimeout(() => setTestStatus(null), 5000);
    },
    onError: () => {
      setTestStatus({ type: 'error', message: 'Failed to send test notification. Make sure your Telegram is linked.' });
      setTimeout(() => setTestStatus(null), 5000);
    },
  });
  
  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen py-8 px-6 bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-32 bg-secondary/40 rounded-xl mb-6" />
            <div className="h-64 bg-secondary/40 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen py-8 px-6 bg-background relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>
      
      <div className="max-w-4xl mx-auto space-y-6 relative">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/50 flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Telegram Integration</h1>
            <p className="text-muted-foreground mt-1">Connect your Telegram to receive health reminders</p>
          </div>
        </div>
        
        {/* Status Card */}
        <Card className="p-6 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Connection Status</h2>
            {settings?.linked ? (
              <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-medium flex items-center gap-2">
                <CheckCircle className="w-3 h-3" />
                Connected
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-sm font-medium flex items-center gap-2">
                <AlertCircle className="w-3 h-3" />
                Not Connected
              </span>
            )}
          </div>
          
          {settings?.linked ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-secondary/40 border border-border/50">
                <p className="text-sm text-muted-foreground mb-1">Connected Chat ID</p>
                <p className="font-mono text-foreground">{settings.chatId}</p>
              </div>
              
              {testStatus && (
                <div className={`p-3 rounded-lg ${testStatus.type === 'success' ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                  <p className={`text-sm ${testStatus.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                    {testStatus.message}
                  </p>
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={() => testNotificationMutation.mutate()}
                  disabled={testNotificationMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-white hover:shadow-lg transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {testNotificationMutation.isPending ? 'Sending...' : 'Send Test Notification'}
                </button>
                
                <button
                  onClick={() => unlinkMutation.mutate()}
                  disabled={unlinkMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                >
                  <Unlink className="w-4 h-4" />
                  {unlinkMutation.isPending ? 'Disconnecting...' : 'Disconnect'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-primary" />
                  How to Connect:
                </h3>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li>1. Open Telegram and search for <span className="font-mono text-foreground">@YourBotUsername</span></li>
                  <li>2. Start a chat with the bot by sending <span className="font-mono text-foreground">/start</span></li>
                  <li>3. Copy the code below</li>
                  <li>4. Send <span className="font-mono text-foreground">/link YOUR_CODE</span> to the bot</li>
                </ol>
              </div>
              
              {/* Linking Code */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Your Linking Code (Valid for 10 minutes)
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 p-3 rounded-lg bg-secondary/40 border border-border/50 font-mono text-lg text-center text-foreground">
                    {settings?.linkingCode}
                  </div>
                  <button
                    onClick={() => copyToClipboard(settings?.linkingCode)}
                    className="px-4 py-2 rounded-lg bg-secondary/40 border border-border/50 text-foreground hover:bg-secondary/60 transition-colors"
                  >
                    {copied ? <CheckCircle className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Code expires in {settings?.codeExpiresIn} minutes. Refresh to generate a new one.
                </p>
              </div>
              
              <button
                onClick={() => queryClient.invalidateQueries({ queryKey: ['telegram-settings'] })}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-white hover:shadow-lg transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Generate New Code
              </button>
            </div>
          )}
        </Card>
        
        {/* Notification Types */}
        <Card className="p-6 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50">
          <h2 className="text-lg font-semibold text-foreground mb-4">Notifications You'll Receive</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
              <span className="text-2xl">🍽️</span>
              <div>
                <h3 className="font-medium text-foreground">Meal Reminders</h3>
                <p className="text-xs text-muted-foreground">Get notified when it's time for your planned meals</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
              <span className="text-2xl">🏋️</span>
              <div>
                <h3 className="font-medium text-foreground">Exercise Reminders</h3>
                <p className="text-xs text-muted-foreground">Stay on track with your workout schedule</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
              <span className="text-2xl">😴</span>
              <div>
                <h3 className="font-medium text-foreground">Sleep Reminders</h3>
                <p className="text-xs text-muted-foreground">Get bedtime reminders based on your schedule</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
              <span className="text-2xl">💊</span>
              <div>
                <h3 className="font-medium text-foreground">Medication Reminders</h3>
                <p className="text-xs text-muted-foreground">Never miss your medication with timely alerts</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}