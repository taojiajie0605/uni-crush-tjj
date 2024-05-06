// 获取两个数之间的随机数
export const selectFrom = (startNumber, endNumber) => {

    var choice = endNumber - startNumber + 1;

    return Math.floor(Math.random() * choice + startNumber)
}

// 节流
let last = 0
export const throttle = (f, wait = 200) => {
  // console.log('1111111', last);
  return function (...args) {
    let now = Date.now()
    if (now - last > wait) {
      last = now
      f.apply(this, args)
    }
  }
}