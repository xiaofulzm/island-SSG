import cac from 'cac';
import { build } from './build';

import { resolveConfig } from './config';

const cli = cac('lsland').version('0.0.1').help();

// 1. bin 字段
// 2. npm link
// 3. island dev

// 注册子命令
cli.command('dev [root]', 'start devserver').action(async (root: string) => {
  const createServer = async () => {
    const { createDevServer } = await import('./dev.js');
    const server = await createDevServer(root, async () => {
      await server.close();
      await createServer();
    })
    await server.listen();
    server.printUrls();
  }
  await createServer();
});

cli
  .command('build [root]', 'build in production')
  .action(async (root: string) => {
    // console.log('build', root);
    const config = await resolveConfig(root, 'build', 'production')
    await build(root, config);
  });

cli.parse(); // 全局解析 传入的参数
