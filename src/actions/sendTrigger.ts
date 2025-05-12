'use server';

import { createSocket } from "node:dgram";

type TriggerType = 'task_start' | 'task_end';

const socket = createSocket('udp4');
const PORT = 50000; // 送信先のポート番号
const HOST = '172.16.191.147'; // 送信先のホスト名

/**
 * 外部システムにトリガーを送信するServer Action
 * @param triggerType トリガーの種類（タスク開始/終了）
 * @param taskId 現在のタスクID（オプション）
 * @param additionalInfo 追加情報（オプション）
 */
export async function sendTrigger(
  triggerType: TriggerType,
  taskId?: string, 
  additionalInfo?: Record<string, any>
) {
  // 現在のタイムスタンプ
  const timestamp = new Date().toISOString();
  
  // 送信するデータを構築
  const data = {
    triggerType,
    timestamp,
    taskId,
    ...additionalInfo
  };

  if (triggerType === 'task_start') {
    socket.send('t', PORT, HOST, (err) => {
      if (err) {
        console.error('UDP送信エラー:', err);
      }
    });
  }
  
  console.log(`トリガー送信: ${JSON.stringify(data)}`);
  
  try {
    // ここで実際の送信処理を実装
    // 例: WebSocketや外部APIへのPOSTリクエストなど
    
    // 開発用のモックレスポンス
    return { success: true, message: `${triggerType} トリガーを送信しました`, data };
  } catch (error) {
    console.error('トリガー送信エラー:', error);
    return { success: false, message: 'トリガー送信に失敗しました', error };
  }
}

