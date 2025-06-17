// File: frontend/app/hooks/useCountdown.ts

"use client";

import { useState, useEffect } from "react";

// Tipe data untuk output dari hook kita
interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function useCountdown(deadline: bigint): TimeLeft {
  // Konversi deadline bigint (detik) ke milidetik number
  const deadlineInMs = Number(deadline) * 1000;

  const calculateTimeLeft = (): TimeLeft => {
    const difference = deadlineInMs - new Date().getTime();
    let timeLeft: TimeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  useEffect(() => {
    // Set interval untuk update countdown setiap detik
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Bersihkan interval saat komponen dilepas untuk menghindari memory leak
    return () => clearInterval(timer);
  }, [deadlineInMs]);

  return timeLeft;
}
