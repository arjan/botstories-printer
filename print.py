import os
import sys
from escpos import printer

Epson = printer.Usb(0x04b8,0x0e15)

id = sys.argv[1]
url = "http://render.miraclethings.nl:8080/?u=https://botstory.net/print/%s&s=580x2500&d=3000&crop=true" % id
os.system("wget -O /tmp/print.png '" + url + "'")

Epson.image("/tmp/print.png")
Epson.cut()
Epson.image("/tmp/print.png")
Epson.cut()

print("OK")
