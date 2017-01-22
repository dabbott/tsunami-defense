let id = 0

export default (callback, interval = 0) => {

  let lastTime = interval
  let once = false
  let myId = id++

  return (delta, elapsed) => {
    if (!once) {
      once = true
      lastTime = elapsed + interval
      return
    }

    if (elapsed > lastTime + interval) {
      // if (myId === 4) {
      //   debugger
      //   console.log('timer', id, elapsed, lastTime, interval)
      // }

      callback(myId)
      lastTime += interval
    }
  }
}
