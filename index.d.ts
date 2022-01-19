export default class Workerjs {
    #private;
    commitHash: string;
    pollingTime: number;
    versionUrl: string;
    onUpdate: (message?: string | null) => {};
    constructor(opt: any);
    createWorkerjs(): void;
    close(): void;
}
