const childProcess = require('child_process')
const { Socket } = require('phoenix-channels')
const escpos = require('escpos')
var dateFormat = require('dateformat')

const { ledControl } = require('./leds')

// Select the adapter based on your printer type
const device  = new escpos.USB()
// const device  = new escpos.Network('localhost');
// const device  = new escpos.Serial('/dev/usb/lp0');

const socket = new Socket('wss://bsqd.me/socket')
const BOT_ID = '88d565e3-f007-41cc-b86a-7e9a19344433'

function withPrinter(fun) {
  const printer = new escpos.Printer(device);
  fun(printer)
  printer.close()
}

function printStory(message) {
  if (!message.payload.id) {
    // legacy; no id in emit payload
    withPrinter(function(printer) {
      printer
        .text(message.payload.text)
        .control('lf')
        .control('lf')
        .cut()
    })
    return
  }

  console.log('Print story: ' + message.payload.id);
  childProcess.execSync("python3 ./print.py " + message.payload.id)
}

device.open(function () {

  socket.connect()

  const channel = socket.channel('bot:' + BOT_ID, { user_id: 'master' })
  channel.join()
                        .receive('ok', resp => { console.log('Joined successfully', resp) })
                        .receive('error', resp => { console.log('Unable to join', resp) })

  channel.on('history', (r) => {
    withPrinter(function(printer) {
      printer
        .align('ct')
        .control('lf')
        .text(dateFormat(new Date()))
        .control('lf')
        .control('lf')
        .text('Printer online and waiting for stories.')
        .control('lf')
        .text(childProcess.execSync('ifconfig |grep \'inet \'|grep -v 127.0.0.1'))
        .control('lf')
        .control('lf')
        .cut()
    })
  })

  channel.on('emit', (event) => {
    console.log('event', event)

    if (event.event === 'story') {
      printStory(event)
    }
    if (event.event === 'leds') {
      ledControl(event.payload)
    }
  })
})
