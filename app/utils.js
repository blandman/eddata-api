exports.getReqJson = function(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return str;
  }
  return JSON.parse(str);
}

exports.pageNext = function (o,l,t,r) {
  var n = o + l;
  if (n > t) {
    n = o;
    return;
  } else {
    return process.env.API_URL + '/'+ r +'?offset=' + n + '&limit=' + l;
  }
}

exports.pagePrev = function (o,l,t,r) {
  var p = o - l;
  if (p < 0) {
    return;
  } else {
    return process.env.API_URL + '/'+ r +'?offset=' + p + '&limit=' + l;
  }
}

exports.setLimit = function (l) {
  if (l && l < 50) {
    var limit = l;
  } else {
    var limit = 50
  }
  return limit;
}

exports.setOffset = function (o) {
  if (o && o > 0) {
    var offset = o;
  } else {
    var offset = 0
  }
  return offset;
}