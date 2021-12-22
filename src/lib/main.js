import workjsTemplate from '../public/work.js'
export default class Workerjs {
    constructor(opt) {
        if (!opt.commitHash) {
            this.error('commitHash is required')
        }
        let onUpdate = () => {
            console.log('update')
        }
        this.commitHash = opt.commitHash
        this.pollingTime = opt.pollingTime || 15
        this.versionUrl = opt.versionUrl || '/version.txt'
        this.onUpdate = opt.onUpdate || onUpdate
        this.myWork = undefined
    }
    // 创建worker线程
    createWorkerjs() {
        if (!this.commitHash) return
        if (window.Worker) {
            const localWorkerUrl = window.URL.createObjectURL(new Blob([workjsTemplate], {
                type: 'application/javascript'
            }));
            this.myWork = new Worker(localWorkerUrl)
            this.myWork.postMessage({
                type: 'VERSION',
                hash: this.commitHash,
                pollingTime: this.pollingTime,
                versionUrl: window.location.origin + this.versionUrl
            })
            this.myWork.onmessage = async (e) => {
                const message = e.data
                if (message.type && message.type === 'UPDATE') {
                    try {
                        await this.onUpdate()
                    } catch (error) {
                        this.error(error)
                    } finally {
                        this.close()
                    }
                }
            }
        } else {
            this.error('Your browser does not support web workers.')
        }
    }
    error(msg) {
        console.error(msg)
    }
    close() {
        if (this.myWork) {
            this.myWork.terminate()
            this.myWork = undefined
        } else {
            this.error('The worker thread has been closed.')
        }

    }
}
