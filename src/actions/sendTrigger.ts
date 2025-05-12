'use server';

type TriggerType = 'task_start' | 'task_end';

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

