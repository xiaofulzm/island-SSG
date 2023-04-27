import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

import fse from "fs-extra";
import * as execa from "execa";

const exampleDir = path.resolve(__dirname, '../e2e/playground/basic');
const ROOT = path.resolve(__dirname,'..');

const defaultOpttions = {  // 子进程log信息传入到父进程
  stdout: process.stdout,
  stdin: process.stdin,
  stderr: process.stderr
}

async function prepareE2E() {
    // 判断产物是否存在
    if(!fse.existsSync(path.resolve(__dirname, '../dist'))){
        //  运行pnpm build
      execa.commandSync('pnpm build', {
        cwd: ROOT,  // 执行目录为项目根目录
        ...defaultOpttions
      })
    }

    execa.commandSync('npx playwright install', {
      cwd: ROOT,
      ...defaultOpttions

    });

    execa.commandSync('pnpm dev',{
      cwd: exampleDir,
      ...defaultOpttions
    })
}

prepareE2E();