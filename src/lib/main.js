// default options
const DEFAUTL_OPTIONS = {
    commitHash: null,
    onError(msg) {
        console.error(msg)
    }, onUpdate() { },
    pollingTime: 15,
    versionUrl: '/version.txt'
}
export default async function createWorkjs(opts) {
    let options = Object.assign({}, DEFAUTL_OPTIONS, opts);
    if (window.Worker) {
        if (options.commitHash) {
            const codeString = await fetch('https://static.flytodream.cn/work.js').then(res => res.text());
            // 因此不再会有跨域问题
            const localWorkerUrl = window.URL.createObjectURL(new Blob([codeString], {
                type: 'application/javascript'
            }));
            let myWork = new Worker(localWorkerUrl)
            myWork.postMessage({
                type: 'VERSION',
                hash: options.commitHash,
                pollingTime: options.pollingTime,
                versionUrl: options.versionUrl
            })
            myWork.onmessage = async (e) => {
                const message = e.data
                if (message.type && message.type === 'UPDATE') {
                    try {
                        await options.onUpdate()
                    } catch (error) {
                        options.onError(error)
                    } finally {
                        // 关闭worker线程
                        myWork.terminate()
                        myWork = undefined
                    }
                }
            }
        } else {
            options.onError('commitHash is required')
        }
    } else {
        options.onError('Your browser does not support web workers.')
    }
}