export default class Workerjs {
    #private;
    commitHash: string;
    pollingTime: number;
    versionUrl: string;
    onUpdate: Function;
    constructor(opt: any);
    createWorkerjs(): void;
    close(): void;
}
