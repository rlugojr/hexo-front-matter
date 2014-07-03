var yaml = require('yamljs'),
  rYFM = /^(?:-{3,}\s*\n+)?([\s\S]+?)(?:\n+-{3,})(?:\s*\n+([\s\S]*))?/;

exports = module.exports = function(str){
  return parse(str);
};

var split = exports.split = function(str){
  if (!rYFM.test(str)) return {content: str};

  var match = str.match(rYFM),
    data = match[1],
    content = match[2] || '';

  return {data: data, content: content};
};

var parse = exports.parse = function(str){
  var splitData = split(str),
    raw = splitData.data,
    content = splitData.content;

  if (!raw) return {_content: str};

  try {
    var data = yaml.parse(raw);

    if (typeof data === 'object'){
      data._content = content;
      return data;
    } else {
      return {_content: str};
    }
  } catch (e){
    return {_content: str};
  }
};

var formatNumber = function(num){
  return (num < 10 ? '0' : '') + num;
};

var formatDate = function(date){
  var out = date.getFullYear() + '-';
  out += formatNumber(date.getMonth() + 1) + '-';
  out += formatNumber(date.getDate()) + ' ';
  out += formatNumber(date.getHours()) + ':';
  out += formatNumber(date.getMinutes()) + ':';
  out += formatNumber(date.getSeconds());

  return out;
};

exports.stringify = function(obj){
  var content = obj._content || '',
    keys = Object.keys(obj);

  if (!keys.length) return content;

  var data = {},
    nullKeys = [],
    dateKeys = [],
    i,
    len,
    key,
    value;

  for (i = 0, len = keys.length; i < len; i++){
    key = keys[i];
    if (key === '_content') continue;
    value = obj[key];

    if (value == null){
      nullKeys.push(key);
    } else if (value instanceof Date){
      dateKeys.push(key);
    } else {
      data[key] = value;
    }
  }

  if (!Object.keys(data).length) return content;

  var result = yaml.stringify(data);

  if (dateKeys.length){
    var date;

    for (i = 0, len = dateKeys.length; i < len; i++){
      key = dateKeys[i];
      result += key + ': ' + formatDate(obj[key]) + '\n';
    }
  }

  if (nullKeys.length){
    for (i = 0, len = nullKeys.length; i < len; i++){
      result += nullKeys[i] + ':\n';
    }
  }

  result += '---\n' + content;

  return result;
};