'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FixationCross from '@/components/FixationCross';
import TaskInstruction from '@/components/TaskInstruction';
import ExecuteDisplay from '@/components/ExecuteDisplay';
import { Task } from '@/utils/csvParser';
import { sendTrigger } from '@/actions/sendTrigger';

export default function ExperimentPage() {
  const router = useRouter();
  const [orderedTasks, setOrderedTasks] = useState<Task[]>([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState<number>(-1);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [showFixation, setShowFixation] = useState<boolean>(true);
  const [showTaskInstruction, setShowTaskInstruction] = useState<boolean>(false);
  const [showExecute, setShowExecute] = useState<boolean>(false);
  const [fixationDurationMin, setFixationDurationMin] = useState<number>(4100);
  const [fixationDurationMax, setFixationDurationMax] = useState<number>(4800);
  const [taskInstructionDuration] = useState<number>(2000); // 指示表示時間: 2秒
  const [executeDuration] = useState<number>(3000); // 実行表示時間: 3秒
  const [currentFixationDuration, setCurrentFixationDuration] = useState<number>(4100);

  // 初期化時にセッションストレージからデータを取得
  useEffect(() => {
    const tasksJson = sessionStorage.getItem('orderedTasks');
    if (!tasksJson) {
      // データがない場合は準備ページにリダイレクト
      router.push('/');
      return;
    }

    const tasks = JSON.parse(tasksJson) as Task[];
    setOrderedTasks(tasks);
    
    // 他のパラメータも取得
    const minDuration = sessionStorage.getItem('fixationDurationMin');
    const maxDuration = sessionStorage.getItem('fixationDurationMax');
    
    if (minDuration) setFixationDurationMin(parseInt(minDuration));
    if (maxDuration) setFixationDurationMax(parseInt(maxDuration));
    
    // 実験を自動的に開始
    startExperiment(tasks);
  }, [router]);

  // 実験を開始する関数
  const startExperiment = (tasks: Task[]) => {
    if (tasks.length === 0) return;
    
    // 実験開始時にトリガーを送信
    sendTrigger('experiment_start', 'start', {
      totalTasks: tasks.length
    });
    
    setIsRunning(true);
    setCurrentTaskIndex(0);
    setShowFixation(true);
    setShowTaskInstruction(false);
    setShowExecute(false);
    setCurrentFixationDuration(
      Math.floor(Math.random() * (fixationDurationMax - fixationDurationMin + 1)) + fixationDurationMin
    );
  };

  // タスク表示を制御するエフェクト
  useEffect(() => {
    if (!isRunning || currentTaskIndex < 0 || currentTaskIndex >= orderedTasks.length) {
      return;
    }

    let timer: NodeJS.Timeout;

    if (showFixation) {
      // 注視点表示後、タスク指示に切り替え
      timer = setTimeout(() => {
        setShowFixation(false);
        setShowTaskInstruction(true);
      }, currentFixationDuration);
    } else if (showTaskInstruction) {
      // タスク指示表示後、「実行」表示に切り替え
      timer = setTimeout(() => {
        setShowTaskInstruction(false);
        setShowExecute(true);

        // タスク開始時にトリガーを送信（実行表示開始時）
        const currentTask = orderedTasks[currentTaskIndex];
        sendTrigger('task_start', currentTask.id, {
          taskIndex: currentTaskIndex,
          taskDescription: currentTask.description
        });
      }, taskInstructionDuration);
    } else if (showExecute) {
      // 「実行」表示後、次のタスクの注視点に切り替えるか、実験終了
      timer = setTimeout(() => {
        // タスク終了時にトリガーを送信
        const currentTask = orderedTasks[currentTaskIndex];
        sendTrigger('task_end', currentTask.id, {
          taskIndex: currentTaskIndex,
          taskDescription: currentTask.description
        });

        setShowExecute(false);

        if (currentTaskIndex + 1 < orderedTasks.length) {
          setCurrentTaskIndex(currentTaskIndex + 1);
          setShowFixation(true);
          setCurrentFixationDuration(
            Math.floor(Math.random() * (fixationDurationMax - fixationDurationMin + 1)) + fixationDurationMin
          );
        } else {
          // すべてのタスクが終了
          setIsRunning(false);
          // 実験終了時にトリガーを送信
          sendTrigger('experiment_end', 'end', {
            totalTasks: orderedTasks.length
          });
          // 終了したら準備画面に戻る
          setTimeout(() => {
            router.push('/');
          }, 2000);
        }
      }, executeDuration);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isRunning, currentTaskIndex, showFixation, showTaskInstruction, showExecute, orderedTasks.length, fixationDurationMin, fixationDurationMax, taskInstructionDuration, executeDuration, orderedTasks, currentFixationDuration, router]);

  // 実験終了ボタン
  const stopExperiment = () => {
    setIsRunning(false);
    setShowFixation(false);
    setShowTaskInstruction(false);
    setShowExecute(false);
    sendTrigger('experiment_abort', 'abort', {
      completedTasks: currentTaskIndex
    });
  };

  // キーボードショートカットを設定（ESCキーで実験終了）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        stopExperiment();
        e.preventDefault(); // デフォルトのESC動作を防ぐ
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // 現在表示するコンテンツを決定
  if (showFixation) {
    return <FixationCross />;
  } else if (showTaskInstruction && currentTaskIndex >= 0 && currentTaskIndex < orderedTasks.length) {
    return <TaskInstruction task={orderedTasks[currentTaskIndex]} />;
  } else if (showExecute) {
    return <ExecuteDisplay />;
  } else {
    // 待機中または終了時の表示
    return (
      <div className="flex flex-col items-center justify-center w-full h-screen bg-black text-white">
        <div className="text-2xl">{isRunning ? '実験準備中...' : '実験終了'}</div>
        <button
          onClick={() => router.push('/')}
          className="mt-8 px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          実験を中止する
        </button>
      </div>
    );
  }
}
