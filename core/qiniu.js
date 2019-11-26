const qiniu = require("qiniu");
const autoName = require('./autoName');
class QiNiu {
  constructor(options) {
    this.options = options || {};
    if (!this.options.config || !this.options.config.cloud || !this.options.config.cloud.qiniu) {
      this.options.error('need qiniu cloud config');
      return;
    }
    this.config = this.options.config;
    this.typeConfig = this.config.cloud.qiniu;
    this.bucket = this.typeConfig.bucket;

    

    this.uploadConfig = new qiniu.conf.Config();
    this.formUploader = new qiniu.form_up.FormUploader(this.uploadConfig);
    this.fileAutoName = this.typeConfig.fileAutoName || this.config.fileAutoName;
  }

  getToken() {
    if (this.uploadToken) return this.uploadToken;
    const mac = new qiniu.auth.digest.Mac(this.typeConfig.accessKey, this.typeConfig.secretKey);

    const putPolicy = new qiniu.rs.PutPolicy({
      scope: this.bucket,
      expires: 7200
    });
    this.uploadToken = putPolicy.uploadToken(mac);
    return this.uploadToken;
  }

  getFileSaveName(filePath, index) {
    if (!this.fileAutoName) return filePath.replace(/\//g, '_');
    return autoName(this.fileAutoName, this.config, filePath, this.options.pkg, index);
  }
  
  upload(fileList) {
    const putExtra = new qiniu.form_up.PutExtra();
    const allUpload = fileList.map((filePath, index) => {
      this.uploadSingle(putExtra, filePath, index);
    });
  }

  uploadSingle(putExtra, filePath, index) {
    const fileSaveName = this.getFileSaveName(filePath, index);
    const token = this.getToken();
    this.formUploader.putFile(token, fileSaveName, filePath, putExtra, (err, body, info) => {
      this.options.log(
        ` - [${info.statusCode == 200 ? 'success' : info.statusCode}]`,
        `upload '${filePath}' to '${fileSaveName}'`);
    });
  }
}

module.exports = QiNiu;