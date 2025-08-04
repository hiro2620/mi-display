import React from 'react';
import { Task } from '@/utils/csvParser';

interface ExecuteDisplayProps {
  task?: Task;
  showTaskContent?: boolean;
}

/**
 * 「実行」を表示するコンポーネント
 */
export default function ExecuteDisplay({ task, showTaskContent = false }: ExecuteDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-black text-white">
      <div className="text-6xl font-bold mb-8">実行</div>
      {showTaskContent && task && (
        <div className="text-center max-w-4xl px-8">
          <div className="text-2xl font-semibold mb-4">タスク #{task.id}</div>
          <div className="text-xl">{task.description}</div>
        </div>
      )}
    </div>
  );
}
