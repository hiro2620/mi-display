export interface Task {
  id: string;
  description: string;
}

export interface TaskSequence {
  order: number;
  taskId: string;
}

/**
 * タスク定義CSVテキストからタスクデータを解析する関数
 * @param csvText CSVテキスト（1行目はヘッダー行、その後はタスクデータ）
 * @returns タスクの配列
 */
export function parseTaskDefinitionsCSV(csvText: string): Task[] {
  const lines = csvText.trim().split('\n');
  
  // ヘッダー行をスキップ（2行目以降からデータを読み込む）
  const tasks: Task[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line) {
      const [id, description] = line.split(',').map(item => item.trim());
      if (id && description) {
        tasks.push({ id, description });
      }
    }
  }
  
  return tasks;
}

/**
 * タスク順序CSVテキストから順序データを解析する関数
 * @param csvText CSVテキスト（1行目はヘッダー行、その後は順序データ）
 * @returns 順序データの配列
 */
export function parseTaskSequenceCSV(csvText: string): TaskSequence[] {
  const lines = csvText.trim().split('\n');
  
  // ヘッダー行をスキップ（2行目以降からデータを読み込む）
  const sequences: TaskSequence[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line) {
      const [orderStr, taskId] = line.split(',').map(item => item.trim());
      const order = parseInt(orderStr, 10);
      if (!isNaN(order) && taskId) {
        sequences.push({ order, taskId });
      }
    }
  }
  
  // 順序でソート
  return sequences.sort((a, b) => a.order - b.order);
}

/**
 * タスク定義と順序データを組み合わせて、順序通りのタスク配列を生成する
 * @param tasks タスク定義の配列
 * @param sequences 順序データの配列
 * @returns 順序に基づいて並べられたタスクの配列
 */
export function createOrderedTasks(tasks: Task[], sequences: TaskSequence[]): Task[] {
  // タスクをIDでインデックス化
  const taskMap = new Map<string, Task>();
  tasks.forEach(task => {
    taskMap.set(task.id, task);
  });
  
  // 順序に基づいてタスクを並べる
  return sequences
    .map(seq => taskMap.get(seq.taskId))
    .filter((task): task is Task => !!task); // undefinedをフィルタリング
}

// 後方互換性のために残す
export function parseCSV(csvText: string): Task[] {
  return parseTaskDefinitionsCSV(csvText);
}