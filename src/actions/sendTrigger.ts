'use server';

import { createSocket } from "node:dgram";

type TriggerType = 'experiment_start' | 'experiment_end' | 'experiment_abort' | 'task_start' | 'task_end';

const socket = createSocket('udp4');
const PORT = 50000; // 送信先のポート番号
const HOST = '172.16.191.129'; // 送信先のホスト名

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

  // トリガータイプに応じた数字を文字列として送信
  let triggerCode: string;
  
  switch (triggerType) {
    case 'experiment_start':
      triggerCode = '1';
      break;
    case 'experiment_end':
      triggerCode = '0';
      break;
    case 'experiment_abort':
      triggerCode = '2';
      break;
    case 'task_start':
      // taskIdに基づいてtriggerCodeを決定
      if (taskId) {
        switch (taskId) {
          case '1':
            triggerCode = '5';
            break;
          case '2':
            triggerCode = '6';
            break;
          case '3':
            triggerCode = '7';
            break;
          case '4':
            triggerCode = '8';
            break;
          default:
            triggerCode = '4'; // デフォルト値
        }
      } else {
        triggerCode = '4'; // taskIdが未指定の場合のデフォルト
      }
      break;
    case 'task_end':
      triggerCode = '3';
      break;
    default:
      console.error('不明なトリガータイプ:', triggerType);
      return { success: false, message: '不明なトリガータイプです', error: 'Invalid trigger type' };
  }

  // UDP送信
  socket.send(triggerCode, PORT, HOST, (err) => {
    if (err) {
      console.error('UDP送信エラー:', err);
    }
  });
  
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

