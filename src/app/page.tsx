import ExperimentSession from '@/components/ExperimentSession';

export default function Home() {
  return (
    <main className="w-full h-screen">
      <ExperimentSession 
        fixationDuration={2000} // 注視点表示時間（ミリ秒）
        taskDuration={3000} // タスク指示表示時間（ミリ秒）
      />
    </main>
  );
}
