const workjsTemplate =
    "let commitHash, pollingTime, versionUrl                         \n" +
    "function checkUpdate() { \n" +
    "    fetch(versionUrl + '?time=' + new Date().getTime(), { \n" +
    "        method: 'GET', \n" +
    "    }) \n" +
    "        .then((response) => response.text()) \n" +
    "        .then((result) => { \n" +
    "            const data = result.trim().split(/\\n/) \n" +
    "            if (data.length > 0 && data[0].trim() && commitHash.trim() !== data[0].trim()) {\n" +
    "                postMessage({\n" +
    "                    type: 'UPDATE',\n" +
    "                    updateMessage: data[1] || null \n" + 
    "                })\n" +
    "            }\n" +
    "        })\n" +
    "        .catch((error) => console.log('error', error))\n" +
    "}\n" +
    "\n" +
    "// 监听消息\n" +
    "onmessage = function (e) {\n" +
    "    if (e.data.type === 'VERSION' && e.data.hash) {\n" +
    "        pollingTime = e.data.pollingTime\n" +
    "        commitHash = e.data.hash\n" +
    "        versionUrl = e.data.versionUrl\n" +
    "        setInterval(() => {\n" +
    "            checkUpdate()\n" +
    "        }, pollingTime * 1000)\n" +
    "    }\n" +
    "}\n"

export default class Workerjs {
    commitHash: string;
    pollingTime: number;
    versionUrl: string;
    onUpdate: (message?: string | null) =>{};
    #myWork: any;

    constructor(opt: any) {
        if (!opt.commitHash) {
            this.#_error('commitHash is required')
        }
        let onUpdate = (message?: string | null) => {
            console.log('update')
        }
        this.commitHash = opt.commitHash
        this.pollingTime = opt.pollingTime || 15
        this.versionUrl = opt.versionUrl || '/version.txt'
        this.onUpdate = opt.onUpdate || onUpdate
        this.#myWork = undefined
    }
    // 创建worker线程
    createWorkerjs() {
        if (!this.commitHash) return
        if (window.Worker) {
            const localWorkerUrl = window.URL.createObjectURL(new Blob([workjsTemplate], {
                type: 'application/javascript'
            }));
            this.#myWork = new Worker(localWorkerUrl)
            this.#myWork.postMessage({
                type: 'VERSION',
                hash: this.commitHash,
                pollingTime: this.pollingTime,
                versionUrl: window.location.origin + this.versionUrl
            })
            this.#myWork.onmessage = async (e: any) => {
                const message = e.data
                if (message.type && message.type === 'UPDATE') {
                    try {
                        await this.onUpdate(message.updateMessage || '')
                    } catch (error) {
                        this.#_error(error)
                    } finally {
                        this.close()
                    }
                }
            }
        } else {
            this.#_error('Your browser does not support web workers.')
        }
    }
    #_error(msg: any) {
        console.error(msg)
    }
    close() {
        if (this.#myWork) {
            this.#myWork.terminate()
            this.#myWork = undefined
        } else {
            this.#_error('The worker thread has been closed.')
        }
    }
}
