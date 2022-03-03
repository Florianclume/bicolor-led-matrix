/**
 * AVR8js
 *
 * Copyright (C) 2019, 2020, Uri Shaked
 */
export { CPU } from './cpu/cpu.js';
export { avrInstruction } from './cpu/instruction.js';
export { avrInterrupt } from './cpu/interrupt.js';
export { adcConfig, ADCMuxInputType, ADCReference, atmega328Channels, AVRADC, } from './peripherals/adc.js';
export { AVRTimer, timer0Config, timer1Config, timer2Config, } from './peripherals/timer.js';
export { AVRIOPort, PCINT0, PCINT1, PCINT2, INT0, INT1, portAConfig, portBConfig, portCConfig, portDConfig, portEConfig, portFConfig, portGConfig, portHConfig, portJConfig, portKConfig, portLConfig, PinState, } from './peripherals/gpio.js';
export { AVRUSART, usart0Config } from './peripherals/usart.js';
export { AVREEPROM, EEPROMMemoryBackend, eepromConfig, } from './peripherals/eeprom.js';
export * from './peripherals/twi.js';
export { spiConfig, AVRSPI } from './peripherals/spi.js';
export { AVRClock, clockConfig } from './peripherals/clock.js';
export { AVRWatchdog, watchdogConfig } from './peripherals/watchdog.js';
