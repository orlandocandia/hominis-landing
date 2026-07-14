'use client';

import { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { HelpContent } from './HelpContent';
import { HelpChat } from './HelpChat';

export function HelpButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'chat'>('content');

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition"
        aria-label="Ayuda"
      >
        <HelpCircle className="h-6 w-6" />
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 flex max-h-[600px] w-[min(92vw,24rem)] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
          <div className="flex items-center justify-between border-b border-border bg-muted/30 p-4">
            <h3 className="font-semibold text-foreground">💡 Ayuda</h3>
            <button onClick={() => setIsOpen(false)} className="rounded-lg p-1 transition hover:bg-muted">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab('content')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition ${
                activeTab === 'content'
                  ? 'border-b-2 border-primary bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              📚 Guía
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition ${
                activeTab === 'chat'
                  ? 'border-b-2 border-primary bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              🤖 Chat IA
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'content' ? <HelpContent /> : <HelpChat />}
          </div>
        </div>
      )}
    </>
  );
}
