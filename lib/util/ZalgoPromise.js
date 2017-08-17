'use strict';

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var isThenable = function isThenable(value) {
  return value && typeof value.then === 'function';
};
var isValidThenable = function isValidThenable(value) {
  if (!isThenable(value)) return false;
  if (value.__isZalgo) return true;
  throw new Error('Cannot convert an real promise to a synchronous one');
};

function resolve(inst, value) {
  if (inst.status) return;
  inst.value = value;
  inst.status = 'fulfilled';
}

function reject(inst, value) {
  if (inst.status) return;
  inst.value = value;
  inst.status = 'rejected';
}

var ZalgoPromise = function () {
  ZalgoPromise.all = function all(values, sync) {
    if (!sync) return Promise.all(values);

    var all = new ZalgoPromise(true, function (yes, no) {
      var left = values.length;
      var result = new Array(left);
      if (left === 0) return yes(result);

      values.forEach(function (v, idx) {
        return ZalgoPromise.resolve(v, true).then(function (resolveValue) {
          result[idx] = resolveValue;
          if (--left <= 0) yes(result);
        }, function (err) {
          no(err);
        });
      });
    });
    //console.log('all', all)
    return all;
  };

  ZalgoPromise.resolve = function resolve(value, sync) {
    //console.log('start', value)
    if (!sync) return Promise.resolve(value);
    if (isValidThenable(value)) return value;
    // console.log('end', value)
    return new ZalgoPromise(sync, function (resolve) {
      return resolve(value);
    });
  };

  ZalgoPromise.reject = function reject(value, sync) {
    if (!sync) return Promise.reject(value);
    if (isValidThenable(value)) return value;
    //console.log('reject', value)
    return new ZalgoPromise(sync, function (_, reject) {
      return reject(value);
    });
  };

  function ZalgoPromise(sync, fn) {
    _classCallCheck(this, ZalgoPromise);

    if (!sync) return new Promise(fn);

    try {
      fn(resolve.bind(null, this), reject.bind(null, this));
    } catch (err) {
      reject(this, err);
    }

    if (!this.status) throw new Error('Sync Promises must resolve synchronously');
  }

  ZalgoPromise.prototype.catch = function _catch(fn) {
    return this.then(null, fn);
  };

  ZalgoPromise.prototype.then = function then(fnResolve, fnCatch) {
    var nextValue = this.value;
    var resolved = this.status === 'fulfilled';

    try {
      if (resolved && fnResolve) nextValue = fnResolve(nextValue);
      if (!resolved && fnCatch) {
        nextValue = fnCatch(this.value);
        resolved = true; // if catch didn't throw the next promise is not an error
      }
    } catch (err) {
      var e = ZalgoPromise.reject(err, true);
      return e;
    }

    return resolved ? ZalgoPromise.resolve(nextValue, true) : ZalgoPromise.reject(nextValue, true);
  };

  return ZalgoPromise;
}();

exports.default = ZalgoPromise;


ZalgoPromise.prototype.__isZalgo = true;