import { config } from "./config.js";

/**
 * Bounded execution capacity.
 *
 * Not a job platform. There is no persistence, no retry policy and no
 * distributed anything - a submission that is lost because this process
 * restarted is a submission the application still holds a row for and the
 * learner can run again. What this *is* is the one thing the service cannot do
 * without: a hard ceiling on how many containers exist at once, and an honest
 * answer when that ceiling is reached.
 *
 * The states are the ones an operator needs to reason about:
 *
 *   QUEUED     admitted, waiting for a slot
 *   RUNNING    holding a slot, container alive
 *   COMPLETED  finished, slot released
 *   FAILED     finished badly, slot released
 *   REJECTED   never admitted - the queue was full, or the wait was too long
 *
 * REJECTED is the important one. A service that accepts everything and lets it
 * time out looks healthy from the outside while being useless; one that says
 * "busy" lets the caller show a learner something true and lets a load balancer
 * shed traffic.
 */

export type QueueState = "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED" | "REJECTED";

export class QueueFull extends Error {
  constructor(readonly waited: number) {
    super("execution queue is full");
    this.name = "QueueFull";
  }
}

interface Waiter {
  admit: () => void;
  reject: (error: QueueFull) => void;
  timer: NodeJS.Timeout;
  since: number;
}

export class ExecutionQueue {
  private active = 0;
  private readonly waiting: Waiter[] = [];
  private readonly counts = { completed: 0, failed: 0, rejected: 0 };

  constructor(
    private readonly maxConcurrent = config.maxConcurrent,
    private readonly maxQueued = config.maxQueued,
    private readonly waitMs = config.queueWaitMs,
  ) {}

  get depth(): number {
    return this.waiting.length;
  }

  get running(): number {
    return this.active;
  }

  stats() {
    return {
      running: this.active,
      queued: this.waiting.length,
      capacity: this.maxConcurrent,
      ...this.counts,
    };
  }

  /**
   * Runs `work` once a slot is free.
   *
   * Rejects with QueueFull rather than queueing when there is no room, and
   * rejects the same way when a queued request has waited longer than a caller
   * would reasonably still be listening for. Both are refusals, not failures -
   * the caller is told to try again, and nothing has been executed.
   */
  async run<T>(work: () => Promise<T>): Promise<{ result: T; queuedMs: number }> {
    const queuedMs = await this.acquire();
    try {
      const result = await work();
      this.counts.completed += 1;
      return { result, queuedMs };
    } catch (error) {
      this.counts.failed += 1;
      throw error;
    } finally {
      this.release();
    }
  }

  private acquire(): Promise<number> {
    if (this.active < this.maxConcurrent) {
      this.active += 1;
      return Promise.resolve(0);
    }

    if (this.waiting.length >= this.maxQueued) {
      this.counts.rejected += 1;
      return Promise.reject(new QueueFull(0));
    }

    return new Promise<number>((resolve, reject) => {
      const since = Date.now();
      const waiter: Waiter = {
        since,
        admit: () => resolve(Date.now() - since),
        reject,
        timer: setTimeout(() => {
          const index = this.waiting.indexOf(waiter);
          if (index >= 0) this.waiting.splice(index, 1);
          this.counts.rejected += 1;
          reject(new QueueFull(Date.now() - since));
        }, this.waitMs),
      };
      this.waiting.push(waiter);
    });
  }

  private release(): void {
    const next = this.waiting.shift();
    if (!next) {
      this.active -= 1;
      return;
    }
    // The slot is handed straight over rather than freed and re-taken, so a
    // burst of arrivals cannot overtake a request that has already waited.
    clearTimeout(next.timer);
    next.admit();
  }
}
