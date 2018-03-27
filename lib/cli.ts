
import * as path from 'path';
import * as fs from 'fs';
import * as program from 'commander';
import startTask from './task/start';
import runTask from './task/run';
import { YuppyConfig } from './model/config';

const DEFAULT_CONFIG_NAME = 'yuppy.config.json';

exports.run = function () {
    program.version('0.0.1');

    program
        .command('start')
        .description('Select and run project command')
        .option("-c, --config [config]", "Optional yuppy config file path")
        .action((args) => {
            const config = getYuppyConfig(args.config);
            startTask(config).then((code) => {
                process.stdin.pause();
                process.exit(code);
            });
        });

    program
        .command('run <command>')
        .description('Run given command for all project')
        .option("-c, --config [config]", "Optional yuppy config file path")
        .option("-s, --stop-on-fail", "Stop first failed command")
        .option("-p, --parallel", "Run in parallel")
        .action((command, args) => {
            const config = getYuppyConfig(args.config);
            runTask({ command: command, parallel: args.parallel, stopOnFail: args.stopOnFail }, config).then((code) => {
                process.stdin.pause();
                process.exit(code);
            }).catch((err) => {
                console.log(err);
            });
        });

    program.parse(process.argv);

    if (!process.argv.slice(2).length) {
        program.outputHelp();
    }
}

function getYuppyConfig(configPath: string): YuppyConfig {
    configPath = configPath || DEFAULT_CONFIG_NAME;
    try {
        const projects = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), configPath), 'utf8'));
        return projects;
    } catch (err) {
        throw new Error(`yuppy config not found in path "${configPath}": ` + err);
    }
}
