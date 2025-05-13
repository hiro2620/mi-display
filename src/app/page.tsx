'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Task,
  TaskSequence,
  parseTaskDefinitionsCSV,
  parseTaskSequenceCSV,
  createOrderedTasks
} from '@/utils/csvParser';

export default function PreparationPage() {
  const router = useRouter();
  const [taskDefinitions, setTaskDefinitions] = useState<Task[]>([]);
  const [taskSequences, setTaskSequences] = useState<TaskSequence[]>([]);
  const [orderedTasks, setOrderedTasks] = useState<Task[]>([]);
  const [taskDefinitionsUploaded, setTaskDefinitionsUploaded] = useState<boolean>(false);
  const [taskSequencesUploaded, setTaskSequencesUploaded] = useState<boolean>(false);
  const [showOrderPreview, setShowOrderPreview] = useState<boolean>(false);
  const [showTaskListPreview, setShowTaskListPreview] = useState<boolean>(false);

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

  // タスク一覧プレビューの表示/非表示を切り替える関数
  const toggleTaskListPreview = () => {
    setShowTaskListPreview(!showTaskListPreview);
  };

  // 実験を開始する関数
  const startExperiment = () => {
    if (orderedTasks.length === 0) return;
    
    // 実験パラメータをセッションストレージに保存
    sessionStorage.setItem('orderedTasks', JSON.stringify(orderedTasks));
    sessionStorage.setItem('fixationDurationMin', '4100');
    sessionStorage.setItem('fixationDurationMax', '4800');
    sessionStorage.setItem('taskDuration', '3000');
    
    // 読み込み画面へ移動
    router.push('/loading');
  };

  return (
    <div className="w-full min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">実験準備</h1>
      
      <div className="mb-8 p-6 bg-gray-50 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">ファイルのアップロード</h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block mb-2">タスク定義ファイル (.csv):</label>
            <input
              type="file"
              accept=".csv"
              onChange={handleTaskDefinitionUpload}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            {taskDefinitionsUploaded && (
              <p className="text-green-600 mt-1">✓ タスク定義ファイルが読み込まれました ({taskDefinitions.length} タスク)</p>
            )}
          </div>
          
          <div>
            <label className="block mb-2">タスク順序ファイル (.csv):</label>
            <input
              type="file"
              accept=".csv"
              onChange={handleTaskSequenceUpload}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            {taskSequencesUploaded && (
              <p className="text-green-600 mt-1">✓ タスク順序ファイルが読み込まれました ({taskSequences.length} シーケンス)</p>
            )}
          </div>
          
          <button
            onClick={loadSampleFiles}
            className="mt-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 w-fit"
          >
            サンプルファイルを読み込む
          </button>
        </div>
      </div>
      
      {taskDefinitionsUploaded && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-semibold">タスク一覧</h2>
            <button
              onClick={toggleTaskListPreview}
              className="px-3 py-1 text-sm bg-gray-200 rounded-md hover:bg-gray-300"
            >
              {showTaskListPreview ? '非表示' : '表示'}
            </button>
          </div>
          
          {showTaskListPreview && (
            <div className="bg-white p-4 rounded-md border max-h-60 overflow-y-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">ID</th>
                    <th className="text-left p-2">説明</th>
                  </tr>
                </thead>
                <tbody>
                  {taskDefinitions.map((task) => (
                    <tr key={task.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">{task.id}</td>
                      <td className="p-2">{task.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      
      {orderedTasks.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-semibold">タスク順序</h2>
            <button
              onClick={toggleOrderPreview}
              className="px-3 py-1 text-sm bg-gray-200 rounded-md hover:bg-gray-300"
            >
              {showOrderPreview ? '非表示' : '表示'}
            </button>
          </div>
          
          {showOrderPreview && (
            <div className="bg-white p-4 rounded-md border max-h-60 overflow-y-auto">
              <ol className="list-decimal pl-6">
                {orderedTasks.map((task, index) => (
                  <li key={index} className="mb-1">
                    <strong>#{task.id}:</strong> {task.description}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-8">
        <button
          onClick={startExperiment}
          disabled={orderedTasks.length === 0}
          className={`px-6 py-3 rounded-md font-medium text-white ${
            orderedTasks.length > 0
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          実験を開始する
        </button>
        {orderedTasks.length === 0 && (
          <p className="text-red-500 mt-2">
            タスク定義ファイルとタスク順序ファイルを両方アップロードしてください。
          </p>
        )}
      </div>
    </div>
  );
}
