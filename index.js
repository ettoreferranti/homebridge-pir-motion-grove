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
  board = null;
  log = null;
  pirPin = 0;
  motionDetected = false;
  motionSensor = null;

  constructor(log, config) 
  {
    this.log = log;
    this.name = config.name;
    this.pirPin = config.pirPin;
    this.motionDetected = false;
    this.board = new Board(
    {
        debug: true,
        onError: function(err)
        {
          console.log('Something wrong just happened');
          console.log(err);
        },
        onInit: this.initMethod
    });
  }

  startSensor()
  {
    this.board.init();
  }

  initMethod(res)
  {
    if (res) 
    {
      this.log('GrovePi Version :: ' + this.board.version());
      this.board.pinMode(this.board.INPUT);
      this.motionSensor = new PirMotionSensor(this.pirPin);
      this.log('Motion Sensor (start watch)');

      this.motionSensor.on('change', function(res) 
      {
        if (res)
        {
          this.log('Motion detected')
        }
      })
      this.motionSensor.watch();
    }
  }

  identify(callback) 
  {
    this.log('Identify requested!');
    callback(null);
  }

  motionChange(res)
  {
    if (res)
    {
      this.log('Motion Sensor: motion detected');
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

    this.service
      .getCharacteristic(Characteristic.Name)
      .on('get', callback => {
        callback(null, this.name);
      });

      this.startSensor();

    return [informationService, this.service];
  }
}
