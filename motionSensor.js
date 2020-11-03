var GrovePi = require('grovepi').GrovePi
var DigitalSensor = GrovePi.sensors.base.Digital
var commands = GrovePi.commands

function MotionDigitalSensor(pin) {
  DigitalSensor.apply(this, Array.prototype.slice.call(arguments))
}
MotionDigitalSensor.prototype = new DigitalSensor()

MotionDigitalSensor.prototype.read = function() {
  var write = this.board.writeBytes(commands.dRead.concat([this.pin, commands.unused, commands.unused]))
  if (write) 
  {
    this.board.wait(200)
    this.board.readByte()
    var bytes = this.board.readBytes()
    return bytes[1]
  }
  else 
  {
    return false
  }
}

module.exports = MotionDigitalSensor
