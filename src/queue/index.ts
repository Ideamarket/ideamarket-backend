/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable promise/prefer-await-to-callbacks */
/* eslint-disable promise/prefer-await-to-then */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
export type QueueWork = {
  work: any
  resolve: (v?: any) => void
  reject: (v: any) => void
}

export class Queue {
  isRunning: boolean

  queue: QueueWork[]

  workerFn: (w: QueueWork[]) => Promise<void>

  constructor(workerFn: (w: QueueWork[]) => Promise<void>) {
    this.isRunning = false
    this.queue = []
    this.workerFn = workerFn
  }

  pushWork(work: any): Promise<any> {
    const queueWork = {
      work,
    } as QueueWork

    const promise = new Promise<any>((resolve, reject) => {
      queueWork.resolve = resolve
      queueWork.reject = reject
    })

    this.queue.push(queueWork)

    if (!this.isRunning) {
      this.isRunning = true
      new Promise<void>(async (resolve) => {
        await this.workerFn(this.queue)
        resolve()
      })
        .then(() => {
          this.isRunning = false
        })
        .catch((error) => {
          console.log(`Uncaught in queue: ${error}`)
          this.isRunning = false
        })
    }

    return promise
  }
}
