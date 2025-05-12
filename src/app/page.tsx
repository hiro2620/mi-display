import ExperimentSession from '@/components/ExperimentSession';

export default function Home() {
  return (
    <main className="w-full h-screen">
      <ExperimentSession 
        fixationDurationMin={4100}
        fixationDurationMax={4800}
        taskDuration={3000} // タスク指示表示時間（ミリ秒）
      />
    </main>
  );
}
