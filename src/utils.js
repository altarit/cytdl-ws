module.exports.pad = function (s, len = 2, filler = '0') {
  return ((new Array(len + 1).join(filler)) + s).slice(-len)
}
