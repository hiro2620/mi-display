'use client'
import React, { useEffect, useState } from 'react';

interface LoadingScreenProps {
  duration: number; // ミリ秒単位での表示時間
  onComplete: () => void; // 読み込み完了時に呼び出されるコールバック
}

export default function LoadingScreen({ duration, onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const startTime = Date.now();
    const interval = 16; // アニメーションの更新間隔（ミリ秒）
    
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);
      
      if (elapsed >= duration) {
        clearInterval(timer);
        onComplete();
      }
    }, interval);
    
    return () => clearInterval(timer);
  }, [duration, onComplete]);
  
  // 円形プログレスバーの計算
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  return (
    <div className="flex flex-col items-center justify-center h-full bg-black">
      <div className="relative">
        <svg className="w-40 h-40 transform -rotate-90">
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="transparent"
            stroke="#333333"
            strokeWidth="8"
          />
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="transparent"
            stroke="#3b82f6"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        {/* <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-semibold text-white">{Math.round(progress)}%</span>
        </div> */}
      </div>
      <p className="mt-6 text-xl font-medium text-white">実験開始まで準備中...</p>
      <p className="mt-2 text-gray-400">準備を整えてお待ちください</p>
    </div>
  );
}