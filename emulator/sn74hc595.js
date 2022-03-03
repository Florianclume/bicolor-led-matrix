export class SN74HC595 {
    constructor () {
        this.ser = false
        this.srclk = false
        this.rclk = false
        this.register = [false, false, false, false, false, false, false, false]
        this.output = [false, false, false, false, false, false, false, false]
        this.chain = false
        this.listeners = []
    }

    write (ser, srclk, rclk) {
        this.ser = ser
        if (!this.srclk && srclk) {
            this.shiftRegister()
        }
        this.srclk = srclk
        if (!this.rclk && rclk) {
            this.storeRegister()
        }
        this.rclk = rclk
        return this.chain;
    }

    shiftRegister() {
        this.chain = this.register.pop()
        this.register.unshift(this.ser)
    }

    storeRegister() {
        this.output = [...this.register]
        for (const listener of this.listeners) {
            listener(this.output)
        }
    }

    addListener(listener) {
        this.listeners.push(listener)
    }
}
