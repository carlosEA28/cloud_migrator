import { NextResponse } from "next/server"
import { redis } from "@/lib/redis/redis"
import { transferWorker } from "@/lib/bullMQ/worker"

export const dynamic = "force-dynamic"

export async function POST() {
  try {
    await redis.ping()
    
    const [waiting, active, completed, failed] = await Promise.all([
      redis.zcard("bull:file-transfer:waiting"),
      redis.zcard("bull:file-transfer:active"),
      redis.zcard("bull:file-transfer:completed"),
      redis.zcard("bull:file-transfer:failed"),
    ])
    
    return NextResponse.json({ 
      success: true, 
      worker: "running",
      waitingJobs: waiting,
      activeJobs: active,
      completedJobs: completed,
      failedJobs: failed,
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Worker error" 
    }, { status: 500 })
  }
}

export async function GET() {
  return POST()
}