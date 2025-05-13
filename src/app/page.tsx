import ExperimentSession from '@/components/ExperimentSession';
import TriggerTester from '@/components/TriggerTester';

export default function Home() {
  return (
    <main className="w-full min-h-screen">
      {/* <div className="mt-8 border-t pt-8">
        <h2 className="text-xl font-semibold mb-4">実験セッション</h2> */}
        <ExperimentSession 
          fixationDurationMin={4100}
          fixationDurationMax={4800}
          taskDuration={3000} // タスク指示表示時間（ミリ秒）
        />
      {/* </div> */}
    </main>
  );
}
