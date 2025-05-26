import { env } from "@/lib/env";

class Logger {
  private static formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `${level.toUpperCase()} - [${timestamp}]: ${message}`;
  }

  static log(message: string): void {
    console.log(this.formatMessage("log", message));
  }

  static logTest(message: string): void {
    const isTestMode =
      !!env.NEXT_PUBLIC_IS_TEST_MODE &&
      env.NEXT_PUBLIC_APP_ENV === "development";
    if (isTestMode) console.log(this.formatMessage("log", message));
  }

  static info(message: string): void {
    console.info(this.formatMessage("info", message));
  }

  static warn(message: string): void {
    console.warn(this.formatMessage("warn", message));
  }

  static error(message: string): void {
    console.error(this.formatMessage("error", message));
  }

  static debug(message: string): void {
    console.debug(this.formatMessage("debug", message));
  }
}

export default Logger;
