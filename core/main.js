const { resolve } = require('path');
const globby = require('globby');
const { existsSync, readFileSync } = require('fs');
const Utils = require('./utils');
const TypeList = ['qiniu', 'aliyun']
const QiNiu = require('./qiniu.js');
const pwd = process.env.PWD;
class Upload {
  constructor(options) {
    this.options = options || {};
    this.init()
  }

  // 初始化，获取配置信息
  async init() {
    this.getConfig();
    if (!this.config) return;
    this.files = await this.getFiles() || [];
    if (this.options.upload) {
      this.upload();
    } else {
      this.log(this.files.length ? `Match ${this.files.length} file:` : 'Not match any file');
      this.files.slice(0, 50).forEach(file => {
        this.log(' -', file);
      });
      if (this.files.length > 50) {
        this.log(` - and more ${this.files.length - 50} files`);
      }
    }
  }

  getConfig() {
    const baseConfigPath = this.options.config || 'upload.conf.json';
    this.getConfigByPath(baseConfigPath);
    let currentDir = pwd;
    const rootConfigDir = require('os').homedir();
    while (currentDir != rootConfigDir) {
      const currentPath = resolve(currentDir, baseConfigPath);
      this.getConfigByPath(currentPath);
      currentDir = resolve(currentDir, '../');
    }
  }

  getConfigByPath(configPath) {
    if (!this.config) this.config = {};
    if (!existsSync(configPath)) {
      return this.config;
    }
    const temConf = readFileSync(configPath).toString();
    try {
      const temConfig = JSON.parse(temConf);
      Utils.deepMerge(temConfig, this.config);
    } catch (e) {
    }
    return this.config;
  }

  async getFiles() {
    let pathList = [];
    if (this.options.file) {
      pathList.push(this.options.file);
    }
    if (this.config.files) {
      pathList = pathList.concat(this.config.files);
    }

    if (!pathList.length && !this.options.file) {
      this.error('need -f <fileName or dirName>');
    }

    return globby(pathList);
  }

  error(msg) {
    console.log('[error] ' + msg);
  }

  upload() {
    const type = this.options.type || this.config.defaultType;
    if (!type || TypeList.indexOf(type) == -1) {
      this.error(`type ${type} is unsupport`);
    }
    if (type == 'qiniu') {
      const qiniu = new QiNiu({
        config: this.config,
        error: this.error,
        log: this.log
      });
      return qiniu.upload(this.files)
    }
    this.log('type', type, this.files);
  }


  log(...msg) {
    console.log(...msg);
  }
}

module.exports = Upload;