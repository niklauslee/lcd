// commands
const CMD_CLEAR = 0x01;
const CMD_HOME = 0x02;
const CMD_MODESET = 0x04;
const CMD_DISPCTRL = 0x08;
const CMD_CURSHIFT = 0x10;
const CMD_FUNSET = 0x20;
const CMD_SETCGRAMADDR = 0x40;
const CMD_SETDDRAMADDR = 0x80;

// flags for display entry mode
const ENTRY_RIGHT = 0x00;
const ENTRY_LEFT = 0x02;
const ENTRY_INC = 0x01;
const ENTRY_DEC = 0x00;

// flags for display on/off control
const DISP_ON = 0x04;
const DISP_OFF = 0x00;
const CUR_ON = 0x02;
const CUR_OFF = 0x00;
const BLK_ON = 0x01;
const BLK_OFF = 0x00;

// flags for display/cursor shift
const DISP_MOVE = 0x08;
const CUR_MOVE = 0x00;
const MOVE_RIGHT = 0x04;
const MOVE_LEFT = 0x00;

// flags for function set
const BIT8 = 0x10;
const BIT4 = 0x00;
const ROW2 = 0x08;
const ROW1 = 0x00;
const DOT5X10 = 0x04;
const DOT5X8 = 0x00;

/**
 * rs: register selection (0=instruction, 1=data)
 * en: enable
 * db: data bus
 */
class LCD {
  constructor(rs, en, db) {
    this.rs = rs;
    this.en = en;
    this.db = db;
    this.cols = 16;
    this.rows = 2;
    this.charsz = 0;
    this._func = 0;
    this._ctrl = 0;
    this._mode = 0;
  }

  /**
   * @param {number} cols. default: 16
   * @param {number} rows. default: 2
   * @param {number} charsz. 0 = 5x8, 1 = 5x10
   */
  begin(cols, rows, charsz) {
    if (cols !== undefined) this.cols = cols;
    if (rows !== undefined) this.rows = rows;
    if (charsz !== undefined) this.charsz = charsz;

    pinMode(this.rs, OUTPUT);
    pinMode(this.en, OUTPUT);
    for (var i = 0; i < this.db.length; i++) {
      pinMode(this.db[i], OUTPUT);
    }
    delay(50);
    digitalWrite(this.rs, LOW);
    digitalWrite(this.en, LOW);

    // 4-pin mode
    this.write4bits(0x03);
    delay(5);
    this.write4bits(0x03);
    delay(5);
    this.write4bits(0x03);
    delay(1);
    this.write4bits(0x02);

    var _bits = BIT4;
    var _rows = this.rows > 1 ? ROW2 : ROW1;
    var _charsz = this.charsz === 0 ? DOT5X8 : DOT5X10;
    this._func = _bits | _rows | _charsz;
    this.cmd(CMD_FUNSET | this._func);

    this._ctrl = DISP_ON | CUR_OFF | BLK_OFF;
    this.cmd(CMD_DISPCTRL | this._ctrl);

    this._mode = ENTRY_LEFT | ENTRY_DEC;
    this.cmd(CMD_MODESET | this._mode);

    this.clear();
  }

  write4bits(value) {
    for (var i = 0; i < 4; i++) {
      digitalWrite(this.db[i], (value >> i) & 0x01);
    }
    digitalWrite(this.en, 0);
    digitalWrite(this.en, 1);
    digitalWrite(this.en, 0);
  }

  /**
   * Send data
   */
  send(v, m) {
    digitalWrite(this.rs, m);
    this.write4bits(v >> 4);
    this.write4bits(v);
  }

  /**
   * Write a value to data pins.
   */
  write(value) {
    this.send(value, HIGH);
  }

  /**
   * Send a command to data pins.
   */
  cmd(cmd) {
    this.send(cmd, LOW);
  }

  /**
   * Clear display and home cursor
   */
  clear() {
    this.cmd(CMD_CLEAR);
    delay(2);
  }

  /**
   * Set cursor position to home (0, 0)
   */
  home() {
    this.cmd(CMD_HOME);
    delay(2);
  }

  /**
   * Turn on the display
   */
  on() {
    this._ctrl |= DISP_ON;
    this.cmd(CMD_DISPCTRL | this._ctrl);
  }

  /**
   * Turn off the display
   */
  off() {
    this._ctrl &= ~DISP_ON;
    this.cmd(CMD_DISPCTRL | this._ctrl);
  }

  /**
   * Show the cursor or not
   */
  cursor(onoff = true) {
    if (onoff) {
      this._ctrl |= CUR_ON;
    } else {
      this._ctrl &= ~CUR_ON;
    }
    this.cmd(CMD_DISPCTRL | this._ctrl);
  }

  /**
   * Blink the cursor or not
   */
  blink(onoff = true) {
    if (onoff) {
      this._ctrl |= BLK_ON;
    } else {
      this._ctrl &= ~BLK_ON;
    }
    this.cmd(CMD_DISPCTRL | this._ctrl);
  }

  /**
   * Scroll the display left
   */
  scrollLeft() {
    this.cmd(CMD_CURSHIFT | DISP_MOVE | MOVE_LEFT);
  }

  /**
   * Scroll the display right
   */
  scrollRight() {
    this.cmd(CMD_CURSHIFT | DISP_MOVE | MOVE_RIGHT);
  }

  /**
   * Text flows left to right
   */
  ltr() {
    this._mode |= ENTRY_LEFT;
    this.cmd(CMD_MODESET | this._mode);
  }

  /**
   * Text flows right to left
   */
  rtl() {
    this._mode &= ~ENTRY_LEFT;
    this.cmd(CMD_MODESET | this._mode);
  }

  /**
   * Justify text to right from the cursor
   */
  justifyRight() {
    this._mode |= ENTRY_INC;
    this.cmd(CMD_MODESET | this._mode);
  }

  /**
   * Justify text to left from the cursor
   */
  justifyLeft() {
    this._mode &= ~ENTRY_INC;
    this.cmd(CMD_MODESET | this._mode);
  }

  /**
   * Create a custom character
   * @param {number} index (0~7)
   * @param {number[]} bitmap
   */
  createChar(index, bitmap) {
    this.cmd(CMD_SETCGRAMADDR | ((index & 0x07) << 3));
    for (var i = 0; i < 8; i++) {
      this.write(bitmap[i]);
    }
    this.cmd(CMD_SETDDRAMADDR);
  }

  /**
   * Move cursor to the position of col and row.
   */
  setCursor(col, row) {
    var l = [0x00, 0x40, 0x10 + this.cols, 0x40 + this.cols];
    this.cmd(CMD_SETDDRAMADDR | (l[row] + col));
  }

  /**
   * Print a string
   */
  print(str) {
    for (var i = 0; i < str.length; i++) {
      this.write(str.charCodeAt(i));
    }
  }
}

exports.LCD = LCD;
