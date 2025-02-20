"use client";

import { FlipWords } from "@/components/ui/flip-words";
import { MacbookScroll } from "@/components/ui/macbook-scroll";
import rickRoll from "@/../assets/rick-roll.webp";
import { Label } from "@/components/ui/label";
import { Heart } from "lucide-react";

export default function Home() {
  const words = [
    "Unmask Questions, Mask Identity",
    "No Names, Just Answers",
    "Reveal Curiosity, Conceal Yourself",
  ];

  return (
    <>
      <main className="flex flex-col items-center justify-center h-screen px-4 md:px-24 text-black">
        <section className="text-center">
          <div className="flex flex-col justify-center items-center h-full">
            <div className="text-6xl font-normal text-neutral-600 dark:text-neutral-400">
              <FlipWords words={words} />
            </div>
            <p className="mt-3 md:mt-4 text-xl md:text-2xl">
              Your Questions. Their Answers. No Identity Required
            </p>
          </div>
        </section>
      </main>

      <div className="overflow-hidden dark:bg-[#0B0B0F] bg-white w-full">
        <MacbookScroll
          title={<div>Watch a demo?</div>}
          src={rickRoll}
          showGradient={false}
        />
      </div>

      {/* Footer */}
      <footer className="text-center p-4 md:p-6 bg-black text-white">
        <div>
          <div>
            © {new Date().getFullYear()} Anonymous QnA. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}
