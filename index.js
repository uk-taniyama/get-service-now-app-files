const request = require('request');
const fs = require('fs-extra');

const SN_CONFIG = require('./sn-config');

const TABLE_API = 'api/now/table';
const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

function getTable(table, query) {
  const options = {
    method: 'GET',
    url: [SN_CONFIG.URL, TABLE_API, table].join('/') + '?' + query,
    headers: headers,
    proxy: SN_CONFIG.PROXY_URL,
    auth: {
      user: SN_CONFIG.USER,
      password: SN_CONFIG.PASS,
    },
    json: true,
  };
  return new Promise(function(resolve, reject) {
    request(options, function(error, response, body) {
      if(error) {
        reject(error);
      } else {
        resolve([response, body]);
      }
    });
  });
}

function saveText(path, text) {
  console.log('save ' + path);
  fs.writeFileSync(path, text);
}
function saveJson(name, json) {
  saveText(name + '.json', JSON.stringify(json, null, 2));
}
const APP_TABLE = 'sys_app';
const META_TABLE = 'sys_metadata';
console.log('get ' + APP_TABLE + ' ' + SN_CONFIG.APP_NAME);
getTable(APP_TABLE, 'sysparm_query=name=' + SN_CONFIG.APP_NAME).then(function([response, body]) {
  saveJson(APP_TABLE, body);
  const app = body.result[0];
  const appId = app.sys_id;
  console.log('get ' + META_TABLE + ' ' + appId);
  return getTable(META_TABLE, 'sysparm_query=sys_package=' + appId);
}).then(function([response, body]) {
  saveJson(META_TABLE, body);
  body.result.forEach(function(meta) {
    const table = meta.sys_class_name;
    const sysId = meta.sys_id;
    return getTable(table, 'sysparm_query=sys_id=' + sysId).then(function([response, body]) {
      fs.mkdirsSync(table);
      const name = [table, sysId].join('/');
      const result = body.result[0];
      saveJson(name, result);
      if(result.xml) {
        saveText(name + '.xml', result.xml);
      }
      if(result.script) {
        saveText(name + '.js', result.script);
      }
    });
  });
}).catch(function(error) {
  console.error(error);
});
