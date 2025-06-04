import React from 'react';
import { Task } from '@/utils/csvParser';

interface TaskInstructionProps {
  task: Task;
}

/**
 * タスク指示を表示するコンポーネント
 */
export default function TaskInstruction({ task }: TaskInstructionProps) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-black text-white">
      {/* <div className="text-2xl font-bold mb-4">タスク #{task.id}</div> */}
      <div className="text-5xl max-w-2xl text-center mb-4">{task.description}</div>
      <p className='text-lg'>「実行」と表示されたら想起してください。</p>
    </div>
  );
}