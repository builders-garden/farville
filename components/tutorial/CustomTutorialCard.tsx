"use client";

import React from "react";
import { Step } from "nextstepjs";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CustomTutorialCardProps {
  step: Step;
  currentStep: number;
  totalSteps: number;
  nextStep: () => void;
  prevStep: () => void;
  skipTour?: () => void;
  arrow: React.ReactNode;
}

const CustomTutorialCard = ({
  step,
  currentStep,
  totalSteps,
  nextStep,
  prevStep,
  skipTour,
  arrow,
}: CustomTutorialCardProps) => {
  return (
    <Card className="min-w-[300px] xs:min-w-[360px] bg-[#7E4E31] border-none p-0">
      <CardHeader className="flex flex-row justify-between items-center p-4">
        <CardTitle className="flex items-center gap-4 text-md text-white/90">
          {step.icon && <span>{step.icon}</span>}
          {step.title}
        </CardTitle>
        <button
          onClick={skipTour}
          className="flex items-center text-white/70 hover:text-white hover:bg-white/10 rounded-full px-[8px] py-[4px]"
        >
          ×
        </button>
      </CardHeader>

      <CardContent className="px-4 py-2">
        <div className="mb-2 text-[12px] text-white/90">{step.content}</div>
        {arrow}
      </CardContent>

      <CardFooter className="flex flex-col w-full gap-2 px-4 py-2 pb-4">
        <div className="flex flex-row w-full justify-between gap-4">
          {currentStep > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={prevStep}
              className="w-full border-white/20 text-xs text-white/90 bg-white/30 hover:bg-white/10 hover:text-white"
            >
              Previous
            </Button>
          )}

          <Button
            size="sm"
            onClick={nextStep}
            className="w-full bg-[#f2a311] text-xs text-white hover:bg-[#e39410] border-none"
          >
            {currentStep === totalSteps - 1 ? "Finish" : "Next"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CustomTutorialCard;
