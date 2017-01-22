export default (callback, interval = 0) => {

  let lastTime = interval

  return (delta, elapsed) => {
    if (elapsed > lastTime + interval) {
      callback()
      lastTime += interval
    }
  }
}
