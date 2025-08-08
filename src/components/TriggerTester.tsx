'use client';

import { useState } from 'react';
import { sendTrigger } from '@/actions/sendTrigger';

/**
 * UDP トリガー送信をテストするためのコンポーネント
 */
export default function TriggerTester() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [triggerMessage, setTriggerMessage] = useState<string>('1');

  const handleSendTrigger = async () => {
    setLoading(true);
    try {
      const response = await sendTrigger('task_start', triggerMessage, { source: 'tester' });
      setResult(JSON.stringify(response, null, 2));
    } catch (error) {
      setResult(`エラー: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-lg font-semibold mb-4">UDP トリガーテスター</h2>
      
      <div className="flex gap-4 mb-4 items-end">
        <div>
          <label className="block mb-2 text-sm font-medium">送信メッセージ:</label>
          <input
            type="text"
            value={triggerMessage}
            onChange={(e) => setTriggerMessage(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="トリガーメッセージを入力"
          />
        </div>
        <button
          onClick={handleSendTrigger}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          トリガー送信
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
    </>
  );
}