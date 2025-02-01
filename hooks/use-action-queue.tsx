import { useRef } from "react";
import type { BatchedAction } from "./use-batch-actions";

export class ActionQueue {
  private currentAction: BatchedAction | null = null;
  private debounceTimer: NodeJS.Timeout | null = null;
  private isProcessing = false;

  constructor(
    private processCallback: (action: BatchedAction) => void,
    private debounceDelay: number = 500
  ) {}

  add(action: BatchedAction) {
    // If already processing, ignore new actions
    if (this.isProcessing) {
      console.log("⚠️ Already processing, ignoring new action");
      return;
    }

    // Clear any pending timeout
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.currentAction = action;

    // Set new timeout
    this.debounceTimer = setTimeout(() => {
      this.processAction();
    }, this.debounceDelay);
  }

  private processAction() {
    if (!this.currentAction || this.isProcessing) return;

    const actionToProcess = this.currentAction;
    this.currentAction = null;
    this.isProcessing = true;

    this.processCallback(actionToProcess);
  }

  setProcessing(value: boolean) {
    this.isProcessing = value;
  }

  clear() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.currentAction = null;
    this.isProcessing = false;
  }
}

export function useActionQueue(
  processCallback: (action: BatchedAction) => void,
  debounceDelay: number = 500
) {
  const queueRef = useRef<ActionQueue | null>(null);

  if (!queueRef.current) {
    queueRef.current = new ActionQueue(processCallback, debounceDelay);
  }

  return queueRef.current;
}
