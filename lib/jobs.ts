import { db, hasDatabase, schema } from "@/db";

// Background-job plumbing: every unit of out-of-band work runs through runJob,
// which retries transient failures and writes the outcome to job_events so a
// failure is never silently dropped.

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function record(job: string, ref: string | undefined, status: string, error?: string) {
  if (!hasDatabase()) return;
  try {
    await db().insert(schema.jobEvents).values({ job, ref: ref ?? null, status, error: error ?? null });
  } catch {
    // logging must never take down the caller
  }
}

export interface RunJobOptions {
  attempts?: number;
  backoffMs?: number;
  ref?: string;
}

export async function runJob<T>(
  job: string,
  fn: () => Promise<T>,
  opts: RunJobOptions = {}
): Promise<{ ok: true; value: T } | { ok: false; error: string }> {
  const attempts = opts.attempts ?? 3;
  const backoff = opts.backoffMs ?? 250;
  let lastError = "unknown error";
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const value = await fn();
      await record(job, opts.ref, "ok");
      return { ok: true, value };
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      if (attempt < attempts) await sleep(backoff * 2 ** (attempt - 1));
    }
  }
  await record(job, opts.ref, "failed", lastError);
  return { ok: false, error: lastError };
}
