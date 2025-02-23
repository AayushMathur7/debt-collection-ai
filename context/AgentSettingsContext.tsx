'use client';

import React, { createContext, useState, useContext } from 'react';

export interface AgentSettings {
  agentName: string;
  greeting: string;
  miniMiranda: string;
  disclaimers: string[];
}

type AgentSettingsContextType = {
  settings: AgentSettings;
  setSettings: React.Dispatch<React.SetStateAction<AgentSettings>>;
};

const defaultSettings: AgentSettings = {
  agentName: "Mark",
  greeting: "Hello, this is Mark calling from ABC Collections. I hope you are having a good day.",
  miniMiranda: "This is an attempt to collect a debt, and any information obtained will be used for that purpose.",
  disclaimers: [
    "This call may be recorded for quality and training purposes.",
    "Please be advised that we are required by law to inform you of your rights.",
  ],
};

const AgentSettingsContext = createContext<AgentSettingsContextType | undefined>(undefined);

export function AgentSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AgentSettings>(defaultSettings);

  return (
    <AgentSettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </AgentSettingsContext.Provider>
  );
}

export function useAgentSettings() {
  const ctx = useContext(AgentSettingsContext);
  if (!ctx) throw new Error('useAgentSettings must be used within an AgentSettingsProvider');
  return ctx;
} 