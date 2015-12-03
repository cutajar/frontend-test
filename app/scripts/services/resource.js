//This module deals with API calls on behalf of stores.
var BProm = require('bluebird');
var JSON_MIMETYPE_FULL = 'application/json; charset=UTF-8';
var JSON_MIMETYPE_TYPE = 'application/json';
var API_VERSION = 'v1';
var API_URL_BASE ='http://127.0.0.1:3000/api';

function http(url, method, body) {
  if (method === undefined) {
    method = 'GET';
  }

  return new BProm(function(resolve, reject) {
    // make basic object
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('error', reject);
    xhr.addEventListener('load', resolve);
    // open it up, ready to start writing headers
    xhr.open(method, url);

    // if body, set mimetype
    if (body !== undefined) {
      // default to JSON mimetype      
      xhr.setRequestHeader('Content-Type', JSON_MIMETYPE_FULL);
    }

    // send off the request
    xhr.send(body);
  });
}
function parseIfJSON(xhr) {
  try {
    var ct = xhr.getResponseHeader('Content-Type');
    if (ct !== undefined && ct !== null && ct.indexOf(JSON_MIMETYPE_TYPE) === 0){
      var returnObj = JSON.parse(xhr.responseText);
      returnObj.status = xhr.status;
      return returnObj;
    }
    else {
      return xhr;
    }
  }
  catch(err) {
    console.log('Error received' + err.message);
  }
}
function pathJoin(a, b) {
  if (a[a.length-1] !== '/') {
    a += '/';
  }
  if (b[0] === '/') {
    b = b.slice(1);
  }
  return a+b;
}
function getJoinedPath(path) {
  return pathJoin(
    pathJoin(API_URL_BASE, API_VERSION),
    path
  );
}

var Resource = {    
  get: function(path) {
    var url = getJoinedPath(path);
     
    //http(url, method, body)
    var p = http(url, 'GET', undefined)
      .then(function(e) {
        return parseIfJSON(e.target);
      });

    return p;
  },

  create: function(path, data) {
    var url = getJoinedPath(path);

    var jd = JSON.stringify(data);

    var p = http(url, 'POST', jd)
      .then(function(e) {
        var xhr = e.target;

        // there was an error
        if (xhr.status < 200 || xhr.status > 299) {
          throw xhr;
        } else {
          return parseIfJSON(xhr);          
        }
      });
    return p;
  },  
  delete: function(path, data) {
    var url = getJoinedPath(path);

    var jd = JSON.stringify(data);

    var p = http(url, 'DELETE', jd)
      .then(function(e) {
        var xhr = e.target;
        // there was an error
        if (xhr.status < 200 || xhr.status > 299) {
          throw xhr;
        } else {
          return parseIfJSON(xhr);
        }
      });
    return p;
  },  

};
module.exports = Resource;