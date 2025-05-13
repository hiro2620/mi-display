'use client'
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingScreen from '@/components/LoadingScreen';

export default function LoadingPage() {
  const router = useRouter();

  // 読み込み完了後に実験ページに移動
  const handleLoadingComplete = () => {
    router.push('/experiment');
  };

  // ページ読み込み時にセッションストレージのデータをチェック
  useEffect(() => {
    const orderedTasks = sessionStorage.getItem('orderedTasks');
    if (!orderedTasks) {
      // データがない場合は準備ページにリダイレクト
      router.push('/');
    }
  }, [router]);

  return (
    <div className="w-full min-h-screen">
      <LoadingScreen duration={5000} onComplete={handleLoadingComplete} />
    </div>
  );
}
