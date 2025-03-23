"use client";

import dashboardImage from "@/../assets/dashboard.png";
import { Button } from "@/components/ui/button";
import { FlipWords } from "@/components/ui/flip-words";
import { MacbookScroll } from "@/components/ui/macbook-scroll";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);

  // Check if the view is mobile
  useEffect(() => {
    const checkScreenSize = () => setIsMobile(window.innerWidth < 768);
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Importing styles dynamically
  // so that it can be unloaded when the page unmounts
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
        *, *::before, *::after {
          box-sizing: inherit;
        }
        html, body {
          overflow-x: hidden;
          overflow-y: auto;
          scroll-behavior: smooth;
        }
        @media (max-width: 768px) {
          body {
            width: 100%;
          }
        }
       `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const flipWordsArray = [
    "Unmask Questions, Mask Identity",
    "No Names, Just Answers",
    "Reveal Curiosity, Conceal Yourself",
  ];

  const TypewriterEffectArray = [
    {
      text: "Join",
    },
    {
      text: "the",
    },
    {
      text: "adventure.",
    },
    {
      text: "Stay",
    },
    {
      text: "Anonymous",
      className: "text-blue-500 dark:text-blue-500",
    },
    {
      text: "!",
    },
  ];
  const typeWriterEffectArraySplitIndexOnMobile = 3;

  return (
    <>
      <main className="flex flex-col items-center justify-center h-screen px-4 md:px-24 text-black">
        <section className="text-center">
          <div
            className="relative flex justify-center items-center"
            style={{ minHeight: "80px" }}
          >
            <div className="text-6xl font-normal text-neutral-600 dark:text-neutral-400">
              <FlipWords words={flipWordsArray} />
            </div>
          </div>
          <p className="mt-3 md:mt-4 md:text-2xl">
            Your Questions. Their Answers. No Identity Required
          </p>
        </section>
      </main>

      {!isMobile && (
        <div className="overflow-hidden dark:bg-[#0B0B0F] bg-white w-full">
          <MacbookScroll
            title={<div>A Simple Dashboard to Ask and Answer...</div>}
            src={dashboardImage}
            showGradient={false}
          />
        </div>
      )}

      <div className="flex flex-col items-center justify-center h-svh">
        <p className="text-neutral-600 text-2xl lg:text-4xl xl:text-5xl text-center">
          The road to freedom starts from here
        </p>
        {!isMobile ? (
          <TypewriterEffectSmooth
            words={TypewriterEffectArray}
            className="text-3xl lg:text-5xl xl:text-6xl font-bold"
            cursorClassName="h-6 sm:h-8 xl:h-16"
          />
        ) : (
          <>
            <TypewriterEffectSmooth
              words={TypewriterEffectArray.slice(
                0,
                typeWriterEffectArraySplitIndexOnMobile,
              )}
              className="text-3xl lg:text-5xl xl:text-6xl font-bold"
              cursorClassName="h-8 xl:h-12"
            />
            <TypewriterEffectSmooth
              words={TypewriterEffectArray.slice(
                typeWriterEffectArraySplitIndexOnMobile,
              )}
              className="text-3xl lg:text-5xl xl:text-6xl font-bold"
              cursorClassName="h-8 xl:h-12"
            />
          </>
        )}
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 space-x-0 md:space-x-4">
          <Link href="/sign-up">
            <Button className="h-6 w-14 xl:h-8 xl:w-20 text-sm xl:text-lg hover:bg-white hover:text-black hover:border-2 border-2 bg-black text-white border-neutral-800">
              Join Now
            </Button>
          </Link>
        </div>
      </div>

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
