var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _Workerjs_instances, _Workerjs_myWork, _Workerjs__error;
const workjsTemplate = "let commitHash, pollingTime, versionUrl                         \n" +
    "function checkUpdate() { \n" +
    "    fetch(versionUrl + '?time=' + new Date().getTime(), { \n" +
    "        method: 'GET', \n" +
    "    }) \n" +
    "        .then((response) => response.text()) \n" +
    "        .then((result) => { \n" +
    "            const data = result.trim().split(/\\n/) \n" +
    "            if (data.length > 0 && data[0].trim() && commitHash.trim() !== result.trim()) {\n" +
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
    "}\n";
export default class Workerjs {
    constructor(opt) {
        _Workerjs_instances.add(this);
        _Workerjs_myWork.set(this, void 0);
        if (!opt.commitHash) {
            __classPrivateFieldGet(this, _Workerjs_instances, "m", _Workerjs__error).call(this, 'commitHash is required');
        }
        let onUpdate = (message) => {
            console.log('update');
        };
        this.commitHash = opt.commitHash;
        this.pollingTime = opt.pollingTime || 15;
        this.versionUrl = opt.versionUrl || '/version.txt';
        this.onUpdate = opt.onUpdate || onUpdate;
        __classPrivateFieldSet(this, _Workerjs_myWork, undefined, "f");
    }
    // 创建worker线程
    createWorkerjs() {
        if (!this.commitHash)
            return;
        if (window.Worker) {
            const localWorkerUrl = window.URL.createObjectURL(new Blob([workjsTemplate], {
                type: 'application/javascript'
            }));
            __classPrivateFieldSet(this, _Workerjs_myWork, new Worker(localWorkerUrl), "f");
            __classPrivateFieldGet(this, _Workerjs_myWork, "f").postMessage({
                type: 'VERSION',
                hash: this.commitHash,
                pollingTime: this.pollingTime,
                versionUrl: window.location.origin + this.versionUrl
            });
            __classPrivateFieldGet(this, _Workerjs_myWork, "f").onmessage = (e) => __awaiter(this, void 0, void 0, function* () {
                const message = e.data;
                if (message.type && message.type === 'UPDATE') {
                    try {
                        yield this.onUpdate(message.updateMessage || '');
                    }
                    catch (error) {
                        __classPrivateFieldGet(this, _Workerjs_instances, "m", _Workerjs__error).call(this, error);
                    }
                    finally {
                        this.close();
                    }
                }
            });
        }
        else {
            __classPrivateFieldGet(this, _Workerjs_instances, "m", _Workerjs__error).call(this, 'Your browser does not support web workers.');
        }
    }
    close() {
        if (__classPrivateFieldGet(this, _Workerjs_myWork, "f")) {
            __classPrivateFieldGet(this, _Workerjs_myWork, "f").terminate();
            __classPrivateFieldSet(this, _Workerjs_myWork, undefined, "f");
        }
        else {
            __classPrivateFieldGet(this, _Workerjs_instances, "m", _Workerjs__error).call(this, 'The worker thread has been closed.');
        }
    }
}
_Workerjs_myWork = new WeakMap(), _Workerjs_instances = new WeakSet(), _Workerjs__error = function _Workerjs__error(msg) {
    console.error(msg);
};
