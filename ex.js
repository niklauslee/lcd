var rs = 3;
var en = 5;
var dp = [6, 7, 8, 9];

// initialize
var LCD = require("./index").LCD;
var lcd = new LCD(rs, en, dp);
lcd.begin();

// 1. hello
lcd.print("Hello, world!");
delay(3000);

// 2. two lines
lcd.clear();
lcd.setCursor(0, 0);
lcd.print("The first line.");
lcd.setCursor(0, 1);
lcd.print("The second line.");
delay(3000);

// 3. scroll
for (var i = 0; i < lcd.cols; i++) {
  lcd.scrollRight();
  delay(300);
}
for (var i = 0; i < lcd.cols; i++) {
  lcd.scrollLeft();
  delay(300);
}
delay(3000);

// 4. cursor and blink
lcd.clear();
lcd.cursor();
delay(2000);
lcd.cursor(false);
delay(2000);
lcd.blink();
delay(2000);
lcd.blink(false);
delay(3000);

// custom chars
var heart = [
  0b00000, 0b01010, 0b11111, 0b11111, 0b11111, 0b01110, 0b00100, 0b00000,
];

var smiley = [
  0b00000, 0b00000, 0b01010, 0b00000, 0b00000, 0b10001, 0b01110, 0b00000,
];

lcd.clear();
lcd.createChar(0, heart);
lcd.createChar(1, smiley);
lcd.write(0);
lcd.write(1);
lcd.write(0);
lcd.write(1);
lcd.write(0);
lcd.write(1);
lcd.write(0);
lcd.write(1);

global.lcd = lcd;
