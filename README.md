# LCD

Kaluma library for liquid crystal display (HD44780 driver)

# Wiring

Here is a wiring example for LCD (4-bits mode).

| Raspberry Pi Pico | LCD                | Potentiometer |
| ----------------- | ------------------ | ------------- |
| VBUS              | VDD, LED+          | +             |
| GND               | VSS(GND), LED-, RW | -             |
| GP3               | RS                 |               |
| GP5               | E                  |               |
| GP6               | D4                 |               |
| GP7               | D5                 |               |
| GP8               | D6                 |               |
| GP9               | D7                 |               |
|                   | V0                 | OUT (middle)  |

![wiring](https://github.com/niklauslee/lcd/blob/main/images/wiring.jpg?raw=true)

> You may need to adjust the potentiometer to find proper brightness of the display.

# Install

```sh
npm install https://github.com/niklauslee/lcd
```

# Usage

Here is an example code.

```js
const rs = 3;
const en = 5;
const dp = [6, 7, 8, 9];
const {LCD} = require('lcd');
const lcd = new LCD(rs, en, dp);
lcd.begin();
lcd.print('Hello, world!');
```

# API

## Class: LCD

### new LCD(rs, en, data)

- **`rs`** `<number>` The pin number for RS (register selection).
- **`en`** `<number>` The pin number for E (enable).
- **`data`** `<number[]>` An array for data pins. Currently only 4-pins mode is supported.

### lcd.begin([cols[, rows[, charsz]]])

- **`cols`** `<number>` The number of columns. Default: `16`.
- **`rows`** `<number>` The number of rows. Default: `2`.
- **`charsz`** `<number>` Indicates the size of character. `0` for 5x8 and `1` for 5x10. Default: `0`.

Initialize the display.

### lcd.clear()

Clear the display and set cursor position to home (left-top).

### lcd.home()

Set cursor position to home (left-top).

### lcd.setCursor(col, row);

- **`col`** `<number>`
- **`row`** `<number>`

Move the cursor to the position at (col, row).

### lcd.write(value)

- **`value`** `<number>` A character code to write.

Write a character at the cursor position.

### lcd.print(str)

- **`str`** `<string>`

Print a string at the cursor position.

### lcd.on()

Turn on the display.

### lcd.off()

Turn off the display.

### lcd.cursor([onoff])

- **`onoff`** `<boolean>` Default: `true`.

Show the cursor or hide.

### lcd.blink([onoff])

- **`onoff`** `<boolean>` Default: `true`.

Blink the cursor or not.

### lcd.scrollLeft()

Scroll the display left.

### lcd.scrollRight()

Scroll the display right.

### lcd.ltr()

Text flows left to right.

### lcd.rtl()

Text flows right to left.

### lcd.justifyRight()

Justify text to right from the cursor

### lcd.justifyLeft()

Justify text to left from the cursor

### lcd.createChar(index, bitmap)

- **`index`** `<number>` Index of the bank where the char to be stored. We have only 8 banks (`0`~`7`). 
- **`bitmap`** `<number[]>` Bitmap data of the custom character.

Create a custom character.

```js
var smiley = [
  0b00000,
  0b00000,
  0b01010,
  0b00000,
  0b00000,
  0b10001,
  0b01110,
  0b00000
];
lcd.createChar(0, smiley); // store at 0 bank.
lcd.write(0); // write the custom char at 0 bank.
```