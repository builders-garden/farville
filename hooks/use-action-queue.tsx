import { useRef } from "react";
import type { BatchedAction } from "./use-batch-actions";

export class ActionQueue {
  private queue: BatchedAction[] = [];
  private batchWindowRef: NodeJS.Timeout | null = null;
  private isProcessing = false;
  private readonly maxBatchSize: number;

  constructor(
    private processCallback: (actions: BatchedAction[]) => void,
    private batchWindowDelay: number = 1000,
    maxBatchSize: number = 5
  ) {
    this.maxBatchSize = maxBatchSize;
  }

  add(action: BatchedAction) {
    // Check if there's already an action with same x,y coordinates
    const hasDuplicate = this.queue.some(
      existingAction => existingAction.x === action.x && existingAction.y === action.y
    );

    if (hasDuplicate) {
      console.log("⚠️ Duplicate action detected, skipping add");
      return;
    }

    console.log(
      "➕ Adding action to queue. Current length:",
      this.queue.length
    );
    this.queue.push(action);

    // Process immediately if we hit max batch size
    if (this.queue.length >= this.maxBatchSize) {
      console.log("📦 Max batch size reached, processing immediately");
      if (this.batchWindowRef) {
        clearTimeout(this.batchWindowRef);
        this.batchWindowRef = null;
      }
      this.processQueue();
      return;
    }

    this.scheduleProcessing();
  }

  private scheduleProcessing() {
    if (this.queue.length === 0 || this.isProcessing) {
      console.log("⏭️ Skipping schedule (empty queue or processing)");
      return;
    }

    // If there's no active batch window, start one
    if (!this.batchWindowRef) {
      console.log("🪟 Opening new batch window");
      this.batchWindowRef = setTimeout(() => {
        console.log("🪟 Batch window closed, processing queue");
        this.batchWindowRef = null;
        this.processQueue();
      }, this.batchWindowDelay);
      return;
    }

    // If we're already in a batch window, just log it
    console.log("📝 Action added to existing batch window");
  }

  private processQueue() {
    if (this.queue.length === 0 || this.isProcessing) {
      console.log("⏭️ Skipping process (empty queue or processing)");
      return;
    }

    // Clear any pending timeouts
    if (this.batchWindowRef) {
      clearTimeout(this.batchWindowRef);
      this.batchWindowRef = null;
    }

    console.log("🔄 Processing queue of length:", this.queue.length);
    const actionsToProcess = [...this.queue];
    this.queue = [];
    this.isProcessing = true;

    this.processCallback(actionsToProcess);
  }

  setProcessing(value: boolean) {
    console.log("🔒 Setting processing:", value);
    this.isProcessing = value;
    if (!value) {
      this.scheduleProcessing(); // Check for new actions when processing completes
    }
  }

  clear() {
    if (this.batchWindowRef) {
      clearTimeout(this.batchWindowRef);
      this.batchWindowRef = null;
    }
    this.queue = [];
    this.isProcessing = false;
  }
}

export function useActionQueue(
  processCallback: (actions: BatchedAction[]) => void,
  batchWindowDelay: number = 2000,
  maxBatchSize: number = 5
) {
  const queueRef = useRef<ActionQueue | null>(null);

  if (!queueRef.current) {
    queueRef.current = new ActionQueue(
      processCallback,
      batchWindowDelay,
      maxBatchSize
    );
  }

  return queueRef.current;
}
