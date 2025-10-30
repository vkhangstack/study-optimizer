import cron, { ScheduledTask } from "node-cron"
import { logger } from "../utils/logger"

type JobCallback = () => Promise<void> | void

export class CrobService {
  private static instance: CrobService
  private running: Map<string, boolean> = new Map()
  private jobs: Map<string, ScheduledTask> = new Map()
  private fileNameBackup: string = "./crob_state.json"

  private constructor() {}

  public static getInstance(): CrobService {
    if (!CrobService.instance) {
      CrobService.instance = new CrobService()
    }
    return CrobService.instance
  }

  public addJob(name: string, cronExpr: string, callback: JobCallback) {
    // Wrap to guard overlap
    const task = cron.schedule(
      cronExpr,
      async () => {
        if (this.running.get(name)) {
          logger.info(`[Crob] Job ${name} already running. Skipping this run.`)
          return
        }
        this.running.set(name, true)
        try {
          await callback()
        } catch (err) {
          logger.error(`[Crob] Error in job ${name}:`, err)
        } finally {
          this.running.set(name, false)
        }
      },
      {
        timezone: "Asia/Ho_Chi_Minh",
        name,
      }
    )

    this.jobs.set(name, task)

    task.start()
  }

  public stopJob(name: string) {
    const t = this.jobs.get(name)
    if (t) t.stop()
  }

  public pauseJob(name: string) {
    const t = this.jobs.get(name)
    if (t) t.stop()
  }

  public removeJob(name: string) {
    const t = this.jobs.get(name)
    if (t) {
      t.destroy()
      this.jobs.delete(name)
      this.running.delete(name)
    }
  }

  public getStatusJob(name: string) {
    const t = this.jobs.get(name)
    if (!t) return "not_found"
    return t.getStatus ? t.getStatus() : t.getStatus() ? "running" : "stopped"
  }

  public getMetrics(name: string) {
    // node-cron không cung cấp metrics tích hợp; trả về thông tin thủ công
    const t = this.jobs.get(name)
    if (!t) return {}
    // Không có API chính thức để metrics, có thể mở rộng bằng custom counters
    return {
      running: !!this.running.get(name),
      // thêm counters nếu bạn có trong code
    }
  }

  public getJobs() {
    return Array.from(this.jobs.keys())
  }

  public stopAll() {
    for (const [, t] of this.jobs) t.stop()
  }

  public destroyAll() {
    for (const [, t] of this.jobs) t.destroy()
    this.jobs.clear()
    this.running.clear()
  }

  public async saveState() {
    // node-cron không có API lưu trạng thái sẵn; tích hợp nếu có external store
    logger.info("[Crob] Saving job states save state.")
    Bun.file(this.fileNameBackup).write(
      JSON.stringify({
        jobs: Array.from(this.jobs.keys()).map((name) => ({
          name,
          running: this.running.get(name) || false,
        })),
      })
    )
  }

  public async restoreAllJobs() {
    // Tùy trường hợp: reload từ store và reschedule lại
    logger.info("[Crob] Restoring job states is restoring.")
    try {
      if (!(await Bun.file(this.fileNameBackup).exists())) return

      const data = await Bun.file(this.fileNameBackup).text()
      if (!data) return
      const state = JSON.parse(data)
      logger.info(`[Crob] Restored jobs: ${state.jobs.length}`)
      for (const job of state.jobs) {
        if (job.running) {
          this.running.set(job.name, false) // reset trạng thái chạy
        }
        this.jobs.get(job.name)?.start() // kích hoạt lại job
      }
    } catch (err) {
      logger.error("[Crob] Error restoring job states:", err)
    }
  }
}
