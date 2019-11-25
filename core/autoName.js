const dlv = function(obj, key, def, p, undef) {
	key = key.split ? key.split('.') : key;
	for (p = 0; p < key.length; p++) {
		obj = obj ? obj[key[p]] : undef;
	}
	return obj === undef ? def : obj;
}

const isDate = (o) => ({}.toString.call(o) === "[object Date]" && o.toString() !== 'Invalid Date' && !isNaN(o))
const format = function (date, fmt) {
  if (!isDate(date)) {
    return date;
  }
  // date = new Date(date);
  if (fmt === undefined) {
    fmt = 'yyyy-MM-dd hh:mm:ss';
  }
  var o = {
    'M+': date.getMonth() + 1, //月份
    'd+': date.getDate(), //日
    'h+': date.getHours(), //小时
    'm+': date.getMinutes(), //分
    's+': date.getSeconds(), //秒
    'q+': Math.floor((date.getMonth() + 3) / 3), //季度
    'S': date.getMilliseconds() //毫秒
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp('(' + k + ')').test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
  return fmt;
};

module.exports = (autoName, config, path, index) => {
  const pathList = path.split('/');
  const [fileName, ext] = pathList.pop().split('.');
  const filePath = pathList.join('/');
  const matchReg = [
    {
      reg: /\$date\(\s*(.*?)\s*\)/ig,
      to: (_, dateFormat) => {
        return format(new Date(), dateFormat);
      }
    },
    {
      reg: /\$dirPath\(\s*(.*?)\s*\)/ig,
      to: (_, split) => {
        return filePath.replace(/\//ig, split);
      }
    },
    {
      reg: /\$conf\(\s*(.*?)\s*\)/ig,
      to: (_, dotPath) => {
        return dlv(config, dotPath, '');
      }
    },
    {
      reg: /\$random/ig,
      to: () => {
        return Math.ceil(Math.random() * 10000000);
      }
    },
    {
      reg: /\$index/ig,
      to: () => {
        return index || 0;
      }
    },
    {
      reg: /\$ext/ig,
      to: () => {
        return ext;
      }
    },
    {
      reg: /\$fileName/ig,
      to: () => {
        return fileName;
      }
    }
  ];
  matchReg.forEach(match => {
    if (match.reg && match.to) {
      autoName = autoName.replace(match.reg, match.to);
    }
  });
  return autoName
}

