const { Socket } = require('phoenix-channels')
const escpos = require('escpos')

var dateFormat = require('dateformat')
const wrap = require('word-wrap')

// Select the adapter based on your printer type
const device  = new escpos.USB()
// const device  = new escpos.Network('localhost');
// const device  = new escpos.Serial('/dev/usb/lp0');

const printer = new escpos.Printer(device);
const socket = new Socket('wss://botsqd.com/socket')

function printStory(message) {

  if (!message.payload.id) {
    // legacy; no id in emit payload
    printer
      .text(message.payload.text)
      .control('lf')
      .control('lf')
      .cut()
    return
  }

  const url = `http://render.miraclethings.nl:8080/?u=https://botstory.net/print/${message.payload.id}&s=580x2500&d=100&crop=true`
  escpos.Image.load(url, function (image) {
    for (let i=0; i<2; i++) {
      printer
        .image(image)
        .control('lf')
        .control('lf')
        .cut()
    }
  })
}

device.open(function () {

  socket.connect()

  // Now that you are connected, you can join channels with a topic:
  const channel = socket.channel('meta:be37d0a8-377d-4cc9-8a31-3bc14821aff7', {})
  channel.join()
                        .receive('ok', resp => { console.log('Joined successfully', resp) })
                        .receive('error', resp => { console.log('Unable to join', resp) })

  channel.on('history', (r) => {
    printer
      .font('b')
      .align('ct')
      .control('lf')
      .text(dateFormat(new Date()))
      .control('lf')
      .control('lf')
      .text('Printer online and waiting for stories.')
      .control('lf')
      .control('lf')
      .control('lf')
      .control('lf')
      .cut()
  })

  channel.on('emit', (event) => {
    if (event.event === 'story') {
      printStory(event)
    }
  })
})
