import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/utils/trpc';
import type { RunningText as RunningTextType } from '../../../server/src/schema';

export function RunningText() {
  const [runningText, setRunningText] = useState<RunningTextType | null>(null);

  const loadRunningText = useCallback(async () => {
    try {
      const result = await trpc.runningText.getActive.query();
      setRunningText(result);
    } catch (error) {
      console.error('Failed to load running text:', error);
      // Fallback text
      setRunningText({
        id: 0,
        content: 'Selamat datang di PT. Nusantara Project Konsultan - Solusi Konsultasi Terpercaya untuk Proyek Anda',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      });
    }
  }, []);

  useEffect(() => {
    loadRunningText();
  }, [loadRunningText]);

  if (!runningText) {
    return null;
  }

  return (
    <div className="running-text">
      <div className="running-text-content">
        📢 {runningText.content}
      </div>
    </div>
  );
}