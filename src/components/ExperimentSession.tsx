'use client'
import React, { useState, useEffect } from 'react';
import { 
  Task, 
  TaskSequence, 
  parseTaskDefinitionsCSV, 
  parseTaskSequenceCSV, 
  createOrderedTasks 
} from '@/utils/csvParser';
import FixationCross from '@/components/FixationCross';
import TaskInstruction from '@/components/TaskInstruction';
import { sendTrigger } from '@/actions/sendTrigger';

interface ExperimentSessionProps {
  fixationDuration?: number; // 注視点表示時間（ミリ秒）
  taskDuration?: number; // タスク指示表示時間（ミリ秒）
}

/**
 * 実験セッションを管理するコンポーネント
 */
export default function ExperimentSession({
  fixationDuration = 3000, // デフォルト3秒
  taskDuration = 5000, // デフォルト5秒
}: ExperimentSessionProps) {
  const [taskDefinitions, setTaskDefinitions] = useState<Task[]>([]);
  const [taskSequences, setTaskSequences] = useState<TaskSequence[]>([]);
  const [orderedTasks, setOrderedTasks] = useState<Task[]>([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState<number>(-1);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [showFixation, setShowFixation] = useState<boolean>(false);
  const [showTaskInstruction, setShowTaskInstruction] = useState<boolean>(false);
  const [taskDefinitionsUploaded, setTaskDefinitionsUploaded] = useState<boolean>(false);
  const [taskSequencesUploaded, setTaskSequencesUploaded] = useState<boolean>(false);
  const [showOrderPreview, setShowOrderPreview] = useState<boolean>(false);

  // タスク定義ファイルをアップロードして処理する関数
  const handleTaskDefinitionUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const parsedTasks = parseTaskDefinitionsCSV(content);
      setTaskDefinitions(parsedTasks);
      setTaskDefinitionsUploaded(true);
      
      // 両方のファイルがアップロードされた場合、順序付きタスクを生成
      if (taskSequencesUploaded) {
        const ordered = createOrderedTasks(parsedTasks, taskSequences);
        setOrderedTasks(ordered);
      }
    };
    reader.readAsText(file);
  };

  // タスク順序ファイルをアップロードして処理する関数
  const handleTaskSequenceUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const parsedSequences = parseTaskSequenceCSV(content);
      setTaskSequences(parsedSequences);
      setTaskSequencesUploaded(true);
      
      // 両方のファイルがアップロードされた場合、順序付きタスクを生成
      if (taskDefinitionsUploaded) {
        const ordered = createOrderedTasks(taskDefinitions, parsedSequences);
        setOrderedTasks(ordered);
      }
    };
    reader.readAsText(file);
  };

  // 実験を開始する関数
  const startExperiment = () => {
    if (orderedTasks.length === 0) return;
    setIsRunning(true);
    setCurrentTaskIndex(0);
    setShowFixation(true);
    setShowTaskInstruction(false);
  };

  // 実験を停止する関数
  const stopExperiment = () => {
    setIsRunning(false);
    setShowFixation(false);
    setShowTaskInstruction(false);
  };

  // サンプルファイルをロードする関数
  const loadSampleFiles = async () => {
    try {
      // タスク定義ファイルのロード
      const definitionsResponse = await fetch('/task-definitions.csv');
      const definitionsText = await definitionsResponse.text();
      const parsedDefinitions = parseTaskDefinitionsCSV(definitionsText);
      setTaskDefinitions(parsedDefinitions);
      setTaskDefinitionsUploaded(true);
      
      // タスク順序ファイルのロード
      const sequenceResponse = await fetch('/task-sequence.csv');
      const sequenceText = await sequenceResponse.text();
      const parsedSequences = parseTaskSequenceCSV(sequenceText);
      setTaskSequences(parsedSequences);
      setTaskSequencesUploaded(true);
      
      // 順序付きタスクの生成
      const ordered = createOrderedTasks(parsedDefinitions, parsedSequences);
      setOrderedTasks(ordered);
    } catch (error) {
      console.error('サンプルファイルの読み込みに失敗しました:', error);
    }
  };

  // 実行順序プレビューの表示/非表示を切り替える関数
  const toggleOrderPreview = () => {
    setShowOrderPreview(!showOrderPreview);
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
        
        // タスク開始時にトリガーを送信
        const currentTask = orderedTasks[currentTaskIndex];
        sendTrigger('task_start', currentTask.id, {
          taskIndex: currentTaskIndex,
          taskDescription: currentTask.description
        });
      }, fixationDuration);
    } else if (showTaskInstruction) {
      // タスク指示表示後、次のタスクの注視点に切り替えるか、実験終了
      timer = setTimeout(() => {
        // タスク終了時にトリガーを送信
        const currentTask = orderedTasks[currentTaskIndex];
        sendTrigger('task_end', currentTask.id, {
          taskIndex: currentTaskIndex,
          taskDescription: currentTask.description
        });
        
        setShowTaskInstruction(false);
        
        if (currentTaskIndex + 1 < orderedTasks.length) {
          setCurrentTaskIndex(currentTaskIndex + 1);
          setShowFixation(true);
        } else {
          // すべてのタスクが終了
          setIsRunning(false);
        }
      }, taskDuration);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isRunning, currentTaskIndex, showFixation, showTaskInstruction, orderedTasks.length, fixationDuration, taskDuration, orderedTasks]);

  // 現在表示するコンテンツを決定
  let content;
  if (isRunning) {
    if (showFixation) {
      content = <FixationCross />;
    } else if (showTaskInstruction && currentTaskIndex >= 0 && currentTaskIndex < orderedTasks.length) {
      content = <TaskInstruction task={orderedTasks[currentTaskIndex]} />;
    }
  } else {
    content = (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-8">
        <h1 className="text-3xl font-bold">運動想起実験UI</h1>
        
        <div className="w-full max-w-md">
          <h2 className="text-xl font-semibold mb-4">タスクファイルをアップロード</h2>
          
          <div className="mb-6">
            <label className="block mb-2 font-semibold">
              タスク定義ファイル
              <p className="text-sm font-normal text-gray-600 mb-2">
                形式: id,description（1行目はヘッダー行）
              </p>
              <input 
                type="file" 
                accept=".csv" 
                onChange={handleTaskDefinitionUpload}
                className="block w-full text-sm border border-gray-300 rounded-lg cursor-pointer bg-gray-50 p-2.5"
              />
            </label>
          </div>
          
          <div className="mb-6">
            <label className="block mb-2 font-semibold">
              タスク順序ファイル
              <p className="text-sm font-normal text-gray-600 mb-2">
                形式: order,task_id（1行目はヘッダー行）
              </p>
              <input 
                type="file" 
                accept=".csv" 
                onChange={handleTaskSequenceUpload}
                className="block w-full text-sm border border-gray-300 rounded-lg cursor-pointer bg-gray-50 p-2.5"
              />
            </label>
          </div>
          
          <button
            onClick={loadSampleFiles}
            className="w-full px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 mb-6"
          >
            サンプルファイルを読み込む
          </button>
        </div>

        {taskDefinitionsUploaded && (
          <div className="w-full max-w-md mb-6">
            <h2 className="text-xl font-semibold mb-2">タスク定義一覧</h2>
            <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left pb-2 pr-4">ID</th>
                    <th className="text-left pb-2">説明</th>
                  </tr>
                </thead>
                <tbody>
                  {taskDefinitions.map((task, index) => (
                    <tr key={index} className="border-b border-gray-200 last:border-0">
                      <td className="py-2 pr-4 font-medium">{task.id}</td>
                      <td className="py-2">{task.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {taskDefinitionsUploaded && taskSequencesUploaded && (
          <div className="w-full max-w-md">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">実行順序</h2>
              <button 
                onClick={toggleOrderPreview}
                className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                {showOrderPreview ? '非表示' : '表示'}
              </button>
            </div>
            
            {showOrderPreview && (
              <ul className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-auto">
                {orderedTasks.map((task, index) => (
                  <li key={index} className="mb-2 pb-2 border-b border-gray-200 last:border-0">
                    <span className="font-semibold">#{index + 1}:</span> {task.description} (ID: {task.id})
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="flex gap-4 mt-4">
          <button
            onClick={startExperiment}
            disabled={orderedTasks.length === 0}
            className={`px-6 py-2 rounded-lg font-semibold
              ${orderedTasks.length > 0 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
          >
            実験開始
          </button>
          
          <button
            onClick={stopExperiment}
            disabled={!isRunning}
            className={`px-6 py-2 rounded-lg font-semibold
              ${isRunning 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
          >
            実験停止
          </button>
        </div>

        <div className="mt-6 text-sm text-gray-600">
          <p>
            注視点表示時間: {fixationDuration / 1000}秒 / タスク指示表示時間: {taskDuration / 1000}秒
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {content}
    </div>
  );
}