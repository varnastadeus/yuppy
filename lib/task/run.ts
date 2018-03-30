import { Package } from '../model/package';
import { runCommand } from '../cmd-util/cmd-util';
import { SUCCESS_CODE } from '../model/constant';

export interface RunTaskOptions {
    scriptNames: string[];
    parallel?: boolean;
    maxParallelScripts?: number;
    stopOnFail?: boolean;
    skipUnchanged?: boolean; // TODO
}

type TaskFn = () => Promise<any>;

export async function runTask(opt: RunTaskOptions, projects: Package[]): Promise<number> {

    const runInParallel = async (tasksFn: TaskFn[]) => {
        if (opt.maxParallelScripts) {
            const buckets = createTasksBuckets(tasksFn, opt.maxParallelScripts);
            let success = true;
            for (const bucket of buckets) {
                try {
                    const tasks = bucket.map(t => t());
                    await Promise.all(tasks)
                } catch {
                    success = false;
                }
            }
            return success ? Promise.resolve() : Promise.reject(null);
        } else {
            const tasks = tasksFn.map(t => t());
            return Promise.all(tasks);
        }
    };

    const runInOrder = async (tasksFn: TaskFn[]) => {
        let success = true;
        for (const tFn of tasksFn) {
            try {
                await tFn();
            } catch (err) {
                success = false;
                if (opt.stopOnFail) {
                    return Promise.reject(err);
                }
            }
        }
        return success ? Promise.resolve() : Promise.reject(null);
    };

    const runTask = async (taskName: string) => {
        const tasksFn: TaskFn[] = [];
        for (const project of projects) {
            const cmd = project.getCmd(taskName);
            if (cmd) {
                tasksFn.push(() => runCommand(cmd));
            }
        }
        if (tasksFn.length === 0) {
            return Promise.reject(`Runnable commands for script "${taskName}" was not found`);
        }

        if (opt.parallel) {
            return runInParallel(tasksFn);
        } else {
            return runInOrder(tasksFn);
        }
    };

    for (let taskName of opt.scriptNames) {
        try {
            await runTask(taskName);
        } catch (err) {
            return Promise.reject(err);
        }
    }
    return Promise.resolve(SUCCESS_CODE);
};


function createTasksBuckets(tasksFn: TaskFn[], bucketSize: number): TaskFn[][] {
    let bucket: TaskFn[] = [];
    return tasksFn.reduce((c, n, i) => {
        bucket.push(n);
        if (bucket.length === bucketSize || i === tasksFn.length - 1) {
            c.push(bucket);
            bucket = [];
        }
        return c;
    }, []);
}
