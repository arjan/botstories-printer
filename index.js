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

  //const url = 'https://www.rubberstamps.net/images/sc4.jpg'
  //escpos.Image.load(url, function (image) {

  const authors = message.payload.authors.map(n => n.name).join(', ').replace(/^(.*), /, '$1 and ');

  // title
  printer
    .font('b')
    .align('ct')
    .size(2, 2)
    .text(authors)
    .control('lf')
    .control('lf')

  printer
    .size(1, 1)
    .align('lt')

  printer.text(message.payload.text)

  printer
    .control('lf')
    .control('lf')
    .text(dateFormat(new Date()))

  printer
    .control('lf')
    .control('lf')
    .control('lf')
    .control('lf')
    .control('lf')
    .flush()
    .cut()
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

    for (const event of r.events) {
      if (event.event === 'story') {
        // printStory(event)
      }
    }
  })

  channel.on('emit', (event) => {
    if (event.event === 'story') {
      printStory(event)
    }
    //printStory(message)
  })
})
