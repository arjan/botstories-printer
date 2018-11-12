from escpos import printer

Epson = printer.Usb(0x04b8,0x0e15)

Epson.image("test_trim.png")
Epson.cut()
