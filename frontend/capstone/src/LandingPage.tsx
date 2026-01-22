"use client";
import { useNavigate } from "react-router-dom";
import { WavyBackground } from "./ui/wavy-background";
import { ContainerScroll } from "./ui/container-scroll-animation";
import { HoverEffect } from "./ui/card-hover-effect";
import { AceternityButton } from "./ui/aceternity-button";
import AceternityNavbar from "./AceternityNavbar";
import PricingComponent from "./PricingSection";
import Footer from "./Footer";

const content = {
  mainTitle: "Making the Impact Visible.",
  mainSubtitle:
    "DotLineage is an agentic AI ecosystem that transforms complex code into transparent data flows. From Scala to PySpark, we map every byte of your data journey with surgical precision.",
  getStartedBtn: "Get Started Now",
  learnSmarterTitle: "DotLineage. One dot. Infinite clarity.",
  tryNowTitle: "Try DotLineage Now",
  featuresTitle: "Features",
  projects: [
    {
      title: " Multi-Agent Intelligence",
      description:
        "Specialized agents for Scala (scala.meta), HiveSQL, and PySpark that parse ASTs to find hidden dependencies",
    },
    {
      title: "Evidence-Based Reasoning",
      description:
        'Our agents don\'t just guess; they extract "Neutral Evidence Tokens"—facts from your code—before the LLM infers the lineage.',
    },
    {
      title: "Precision Line Mapping:",
      description:
        "Don't just find the table; find the line. We pinpoint the exact code location for every READ and WRITE operation.",
    },
  ],
};

const LandingPage = () => {
  const navigate = useNavigate();

  const handleButtonClick = () => {
    navigate("/form ");
  };

  return (
    <div className="bg-black relative min-h-screen">
      {/* Navbar at the top */}
      <AceternityNavbar />

      {/* Main Content */}
      <WavyBackground className="max-w-4xl mx-auto pb-40">
        <p className="text-5xl text-white font-bold inter-var text-center">
          {content.mainTitle}
        </p>
        <p className="text-base md:text-lg mt-4 text-white font-normal inter-var text-center">
          {content.mainSubtitle}
        </p>
        <div className="flex justify-center mt-8">
          <AceternityButton onClick={handleButtonClick}>
            {content.getStartedBtn}
          </AceternityButton>
        </div>
      </WavyBackground>

      <div className="flex flex-col overflow-hidden">
        <ContainerScroll
          titleComponent={
            <>
              <h1 className="text-4xl font-semibold text-white dark:text-white">
                {content.learnSmarterTitle} <br />
                <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none">
                  {content.tryNowTitle}
                </span>
              </h1>
            </>
          }
        >
          <img
            src="/src/assets/dotlineage.jpeg"
            height={720}
            width={1400}
            className="mx-auto rounded-2xl object-cover h-full object-left-top"
            alt="DotLineage Preview"
          />
        </ContainerScroll>
      </div>

      <h2 className="text-white text-center text-3xl font-bold">
        {content.featuresTitle}
      </h2>
      <div className="max-w-7xl mx-auto px-8 py-10">
        <HoverEffect items={content.projects} />
      </div>
      <PricingComponent />
      <Footer />
    </div>
  );
};

export default LandingPage;
