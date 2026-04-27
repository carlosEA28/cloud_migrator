import { Queue } from "bullmq"
import { redis } from "@/lib/redis/redis"
import type { TransferJobData } from "@/lib/bullMQ/types"

export const transferQueue = new Queue<TransferJobData>("file-transfer", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 30000,
    },
    removeOnComplete: false,
    removeOnFail: false,
  },
})

import "@/lib/bullMQ/worker"
