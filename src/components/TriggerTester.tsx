'use client';

import { useState } from 'react';
import { sendTrigger } from '@/actions/sendTrigger';

/**
 * UDP トリガー送信をテストするためのコンポーネント
 */
export default function TriggerTester() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSendStart = async () => {
    setLoading(true);
    try {
      const response = await sendTrigger('task_start', 'test_task', { source: 'tester' });
      setResult(JSON.stringify(response, null, 2));
    } catch (error) {
      setResult(`エラー: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSendEnd = async () => {
    setLoading(true);
    try {
      const response = await sendTrigger('task_end', 'test_task', { source: 'tester' });
      setResult(JSON.stringify(response, null, 2));
    } catch (error) {
      setResult(`エラー: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-md max-w-md mx-auto my-4 bg-gray-50">
      <h2 className="text-lg font-semibold mb-4">UDP トリガーテスター</h2>
      
      <div className="flex gap-4 mb-4">
        <button
          onClick={handleSendStart}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          開始トリガー送信
        </button>
        
        <button
          onClick={handleSendEnd}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          終了トリガー送信
        </button>
      </div>
      
      {loading && <p className="text-gray-500">送信中...</p>}
      
      {result && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">結果:</h3>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-60">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}