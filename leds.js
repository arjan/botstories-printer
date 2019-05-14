const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
const port = new SerialPort('/dev/ttyACM1', {
  baudRate: 19200
})

const parser = port.pipe(new Readline({ delimiter: '\r\n' }))

function reportError(err) {
  if (err) {
    console.log('error'); return
  } else {
    console.log('ok')
  }
}

let commandConfirmed = true

function ledControl(payload) {
  if (!commandConfirmed) {
    console.log('Command not yet confirmed!')
    return;
  }
  commandConfirmed = false

  let cmd = null
  const delay = payload.delay || 10
  const fade = payload.fade || 10

  switch (payload.mode) {
    case 'computer':
      cmd = [0xff, 65, delay, fade]
      break;

    case 'facebook':
      cmd = [0xff, 66];
      break;

    case 'nightrider':
      cmd = [0xff, 67];
      break;

    case 'pulse':
      cmd = [0xff, 68, delay, fade];
      break;

    case 'shelves':
      cmd = [0xff, 69];
      break;
  }

  port.write(Buffer.from(cmd), function() {
    if (payload.color) {
      port.write(Buffer.from([0xff, 88]), function() {
        port.write(Buffer.from(payload.color, 'utf8'), function() {
          port.flush();
        });
      });
    } else {
      port.flush();
    }
  });

}

parser.on('data', function(data) {
  if (data == 'OK') {
    console.log('ok!')
    commandConfirmed = true
  }
})

module.exports = { ledControl }
