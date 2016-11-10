export function uuid():string{
  var s = [];
  var hexDigits = "0123456789abcdef";
  for (var i = 0; i < 5; i++) {
      s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  return s.join("");
}