var GrovePi = require('grovepi').GrovePi
var PirMotionSensor = require('./motionSensor')
var Board = GrovePi.board

let Service, Characteristic;

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory('homebridge-pir-motion-sensor-grove', 'GroveMotionSensor', MotionSensor);
};

class MotionSensor {
  constructor(log, config) {
    this.log = log;
    this.name = config.name;
    this.pirPin = config.pirPin;
    this.motionDetected = false;
  }

  identify(callback) {
    this.log('Identify requested!');
    callback(null);
  }

  motionError(err) 
  {
    this.log('Something wrong just happened')
    this.log(err)
  }

  motionInit()
  {
    this.log('GrovePi Version :: ' + board.version())
    board.pinMode(board.INPUT)
    var motionSensor = new PirMotionSensor(3)
    this.log('Motion Sensor (start watch)')
    
    motionSensor.on('change', motionChange(res))

    motionSensor.watch()
  }

  motionChange(res)
  {
    if (res)
    {
      this.log('Motion Sensor: motion detected')
      this.motionDetected = true;
      this.service.setCharacteristic(Characteristic.MotionDetected, this.motionDetected);
    }
    else
    {
      this.motionDetected = false;
      this.service.setCharacteristic(Characteristic.MotionDetected, this.motionDetected);
    }
  }

  getServices() {
    const informationService = new Service.AccessoryInformation();

    informationService
      .setCharacteristic(Characteristic.Manufacturer, 'SEED Labs')
      .setCharacteristic(Characteristic.Model, 'Pi Motion Sensor')
      .setCharacteristic(Characteristic.SerialNumber, 'Raspberry Pi');

    this.service = new Service.MotionSensor(this.name);
    this.service
      .getCharacteristic(Characteristic.MotionDetected)
      .on('get', (callback) => {
        callback(null, this.motionDetected);
      });

      var board = new Board(
      {
        debug: true,
        onError: this.motionError,
        onInit: this.motionInit,
      })
      
      board.init()

    this.service
      .getCharacteristic(Characteristic.Name)
      .on('get', callback => {
        callback(null, this.name);
      });

    return [informationService, this.service];
  }
}
