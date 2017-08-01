function lockify(f) {
  var lock = Promise.resolve()
  return function () {
    var params = [].slice.apply(arguments)
    var result =
      lock.then(function () { return f.apply(undefined, params) })
    lock = result.catch(function () {})
    return result
  }
}

module.exports = lockify
