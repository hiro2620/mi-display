import React from 'react';

/**
 * 黒い画面の中央に白い+を表示するコンポーネント
 */
export default function FixationCross() {
  return (
    <div className="flex items-center justify-center w-full h-screen bg-black">
      <div className="text-white text-6xl font-bold">+</div>
    </div>
  );
}