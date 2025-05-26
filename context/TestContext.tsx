import { env } from "@/lib/env";
import { createContext, useContext, useEffect, useState } from "react";

interface TestContextType {
  isTestMode: boolean;
  setIsTestMode: (isTestMode: boolean) => void;
}

export const TestContext = createContext<TestContextType | null>(null);

export function TestProvider({ children }: { children: React.ReactNode }) {
  const [isTestMode, setIsTestMode] = useState(false);

  useEffect(() => {
    if (
      env.NEXT_PUBLIC_APP_ENV === "development" &&
      !!env.NEXT_PUBLIC_IS_TEST_MODE
    ) {
      setIsTestMode(true);
    }
  }, []);

  return (
    <TestContext.Provider value={{ isTestMode, setIsTestMode }}>
      {children}
    </TestContext.Provider>
  );
}

export const useTestMode = (): TestContextType => {
  const context = useContext(TestContext);
  if (!context) throw new Error("useTestMode must be used within TestProvider");
  return context;
};
