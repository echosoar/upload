const { resolve } = require('path');
const globby = require('globby');
const { existsSync, readFileSync } = require('fs');
const TypeList = ['qiniu', 'aliyun']
const QiNiu = require('./qiniu.js');
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
    this.configPath = this.getConfigPath();
    if (!this.configPath) {
      this.error('no upload config');
    }
    const temConf = readFileSync(this.configPath).toString();
    try {
      this.config = JSON.parse(temConf);
    } catch (e) {
      this.error('config parse error: ' + e.message);
    }
  }

  getConfigPath() {
    let configPath = this.options.config || 'upload.conf.json';
    if (existsSync(configPath)) return configPath;
    configPath = resolve(__dirname, configPath);
    if (existsSync(configPath)) return configPath;
    configPath = resolve(require('os').homedir(), configPath);
    if (existsSync(configPath)) return configPath;
  }

  async getFiles() {
    let pathList = [];
    if (this.options.file) {
      pathList.push(this.options.file);
    }
    if (this.config.files) {
      pathList = pathList.concat(this.config.files);
    }

    if (!pathList.length) {
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