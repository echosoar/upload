#!/usr/bin/env node

const program = require('commander');
const Upload = require('../');
program
  .option('-c, --config', 'config path')
  .option('-f, --file <file>', 'upload file or dir path')
  .option('-t, --type <type>', 'cloud type')
  .option('-u, --upload', 'upload')

program.parse(process.argv);

new Upload(program);