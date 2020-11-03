var GrovePi = require('grovepi').GrovePi
var MotionSensor = require('./motionSensor')
var Board = GrovePi.board

let Service, Characteristic;

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory('homebridge-pir-motion-sensor-grove', 'Motion Sensor', MotionSensor);
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
          onError: function(err) 
          {
            console.log('Something wrong just happened')
            console.log(err)
          },
          onInit: function(res) {
            if (res) 
            {
              console.log('GrovePi Version :: ' + board.version())
              board.pinMode(board.INPUT)
              var motionSensor = new MotionSensor(this.pirPin)
              console.log('Motion Sensor (start watch)')
              
              motionSensor.on('change', function(res) 
              {
                if (res)
                {
                  this.motionDetected = true;
                  this.service.setCharacteristic(Characteristic.MotionDetected, this.motionDetected);
                }
                else
                {
                  this.motionDetected = false;
                  this.service.setCharacteristic(Characteristic.MotionDetected, this.motionDetected);
                }
              })
        
              motionSensor.watch()
            }
          }
        })
      
      board.init()

    gpio.on('change', (channel, value) => {
      if (channel === this.pirPin) {
        this.motionDetected = value;
        this.service.setCharacteristic(Characteristic.MotionDetected, this.motionDetected);
      }
    });

    this.service
      .getCharacteristic(Characteristic.Name)
      .on('get', callback => {
        callback(null, this.name);
      });

    return [informationService, this.service];
  }
}
