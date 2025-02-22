'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAgentSettings } from '@/context/AgentSettingsContext';

export function AgentSettingsForm() {
  const { settings, setSettings } = useAgentSettings();
  const [disclaimers, setDisclaimers] = useState<string>('');

  // Initialize disclaimers from context
  useEffect(() => {
    setDisclaimers(settings.disclaimers.join('\n'));
  }, [settings.disclaimers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update settings with form values
    setSettings({
      ...settings,
      disclaimers: disclaimers.split('\n').filter(d => d.trim() !== '')
    });

    // Show success toast
    toast.success('Settings saved successfully', {
      description: 'Your agent configuration has been updated.'
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="agentName">Agent Name</Label>
        <Input
          id="agentName"
          value={settings.agentName}
          onChange={(e) => setSettings({ ...settings, agentName: e.target.value })}
          placeholder="Enter agent name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="greeting">Greeting</Label>
        <p className="text-sm text-muted-foreground mb-2">
          Use {"{agentName}"} to include the agent name in your greeting
        </p>
        <Textarea
          id="greeting"
          value={settings.greeting}
          onChange={(e) => setSettings({ ...settings, greeting: e.target.value })}
          placeholder="Enter greeting message"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="miniMiranda">Mini-Miranda Warning</Label>
        <Textarea
          id="miniMiranda"
          value={settings.miniMiranda}
          onChange={(e) => setSettings({ ...settings, miniMiranda: e.target.value })}
          placeholder="Enter Mini-Miranda warning"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="disclaimers">Disclaimers</Label>
        <Textarea
          id="disclaimers"
          value={disclaimers}
          onChange={(e) => setDisclaimers(e.target.value)}
          placeholder="Enter disclaimers (one per line)"
          rows={5}
        />
        <p className="text-sm text-muted-foreground">Enter each disclaimer on a new line</p>
      </div>

      <Button type="submit">Save Settings</Button>
    </form>
  );
} 