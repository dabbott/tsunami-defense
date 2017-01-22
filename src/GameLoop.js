class GameLoop {
  constructor() {
    this.enabled = false
    this.callbacks = new Map()
    this.elapsedTime = 0
    this.initialTime = 0
    this.isTimeValid = false
    this.run = this.run.bind(this)
  }
  start() {
    if (!this.enabled) {
      this.enabled = true
      requestAnimationFrame(this.run)
    }
  }
  stop() {
    if (this.enabled) {
      this.enabled = false
      this.isTimeValid = false
    }
  }
  run(time) {
    if (this.isTimeValid) {
      let delta = time - this.initialTime
      this.initialTime = time
      this.elapsedTime += delta
      this.callbacks.forEach(f => {
        f(delta, this.elapsedTime)
      })
    } else {
      this.isTimeValid = true
      this.initialTime = time
    }
    if (this.enabled) {
      requestAnimationFrame(this.run)
    }
  }
  remove(f) {
    this.callbacks.delete(f)
  }
  add(f) {
    this.callbacks.set(f, f)

    return this.remove.bind(this, f)
  }
}

export default new GameLoop()
