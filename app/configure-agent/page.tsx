'use client';

import { AgentSettingsForm } from '@/components/agent-settings-form';

export default function ConfigureAgentPage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Configure Agent</h1>
        <p className="text-muted-foreground mt-2">
          Configure your AI agent's settings and behavior for debt collection calls.
        </p>
      </div>
      
      <div className="border rounded-lg p-6">
        <AgentSettingsForm />
      </div>
    </div>
  );
} 