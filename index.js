const { Socket } = require('phoenix-channels')
const escpos = require('escpos')

const wrap = require('word-wrap')

// Select the adapter based on your printer type
const device  = new escpos.USB()
// const device  = new escpos.Network('localhost');
// const device  = new escpos.Serial('/dev/usb/lp0');

const printer = new escpos.Printer(device);
const socket = new Socket('wss://botsqd.com/socket')

function printStory(message) {

  //const url = 'https://www.rubberstamps.net/images/sc4.jpg'
  //escpos.Image.load(url, function (image) {

    // title
    printer
      .font('b')
      .align('ct')
      .size(2, 2)
      .text('Story by: ' + message.user.first_name)
      .control('lf')
      .control('lf')

    printer
      .size(1, 1)
      .align('lt')

  //printer
      //.raster(image)
      //.control('lf')

    printer.text(message.payload.text)
    printer
      .control('lf')
      .control('lf')
      .control('lf')
      .control('lf')
      .control('lf')
      .flush()
//})

}

device.open(function () {

  socket.connect()

  // Now that you are connected, you can join channels with a topic:
  const channel = socket.channel('meta:be37d0a8-377d-4cc9-8a31-3bc14821aff7', {})
  channel.join()
                        .receive('ok', resp => { console.log('Joined successfully', resp) })
                        .receive('error', resp => { console.log('Unable to join', resp) })

  channel.on('history', (r) => {
    console.log('history', r.events.length)
  })

  channel.on('emit', (message) => {
    printStory(message)
  })
})
