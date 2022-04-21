import * as avr8js from './avr8js/index.js';
import { SN74HC595 } from './sn74hc595.js';
import { loadHex, buildHex } from './builder.js';

const BASE_CODE = `const int rclk = 4;
const int srclk = 3;
const int ser = 2;

void setup()
{
    pinMode(rclk, OUTPUT);
    pinMode(srclk, OUTPUT);
    pinMode(ser, OUTPUT);
}


void loop()
{
    for (int i = 0; i < 8; i++)
    {
        digitalWrite(rclk, LOW);
        
        shiftOut(ser, srclk, LSBFIRST, 0x01 << i);
        shiftOut(ser, srclk, LSBFIRST, 0x01 << i);
        shiftOut(ser, srclk, LSBFIRST, ~(0x01 << i));
        
        digitalWrite(rclk, HIGH);
        
        delay(5);
    }
}`

var persistence = 100;
var stop = false;

const editorElement = document.getElementById('codeArduino');
const runButton = document.getElementById('runButton');
const stopButton = document.getElementById('stopButton');
const compilingOutput = document.getElementById('compilingOutput');
const persistenceInput = document.getElementById('persistenceInput');
const display = document.getElementById('display');
const matrix = new Array(64).fill(undefined).map((_, i) => display.querySelector(`#r${Math.floor(i / 8) + 1}c${i % 8 + 1}`));


let editor;
window.require.config({
    paths: {
        vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.26.1/min/vs'
    }
    });
    window.require(['vs/editor/editor.main'], () => {
    editor = monaco.editor.create(editorElement, {
        value: BASE_CODE,
        language: 'cpp',
        minimap: { enabled: false }
    });
});

persistenceInput.addEventListener('input', () => {
    persistence = parseInt(persistenceInput.value, 10);
});
runButton.addEventListener('click', () => {
    run(editor.getModel().getValue());
});
stopButton.addEventListener('click', () => {
    stop = true;
});

const colors = ['grey', 'lime', 'red', 'orange'];
const state = new Array(64).fill(0);
const timeouts = new Array(64).fill(null);

function updateMatrix(cathods, greens, reds) {
    state.forEach((previous, i) => {
        const next = (!cathods[Math.floor(i / 8)] && greens[i % 8] + reds[i % 8] * 2) + 0; // dirty :)
        if (next != previous) {
            if (timeouts[i] !== null) {
                clearTimeout(timeouts[i]);
                timeouts[i] = null;
            }
            if (next == 0) {
                timeouts[i] = setTimeout(() => matrix[i].setAttribute('fill', colors[next]), persistence);
            } else {
                matrix[i].setAttribute('fill', colors[next]);
            }
            state[i] = next;
        }
    });
}

async function run(code) {
    stop = true;
    runButton.setAttribute('disabled', 'true');
    const result = await buildHex(code);
    compilingOutput.textContent = result.stdout + result.stderr;
    const program = new Uint16Array(0x8000);
    loadHex(result.hex, new Uint8Array(program.buffer));
    
    const cpu = new avr8js.CPU(program);
    const timer0 = new avr8js.AVRTimer(cpu, avr8js.timer0Config);
    const portB = new avr8js.AVRIOPort(cpu, avr8js.portBConfig);
    const portD = new avr8js.AVRIOPort(cpu, avr8js.portDConfig);
    
    const first74hc595 = new SN74HC595();
    const second74hc595 = new SN74HC595();
    const third74hc595 = new SN74HC595();
    
    third74hc595.addListener(() => {
        updateMatrix(first74hc595.output, second74hc595.output, third74hc595.output);
    });
    
    portD.addListener(() => {
        const ser = portD.pinState(2) === avr8js.PinState.High;
        const srclk = portD.pinState(3) === avr8js.PinState.High;
        const rclk = portD.pinState(4) === avr8js.PinState.High;
        const chain = first74hc595.write(ser, srclk, rclk);
        const chain2 = second74hc595.write(chain, srclk, rclk);
        third74hc595.write(chain2, srclk, rclk);
    });
    
    function runCode() {
        for (let i = 0; i < 50000; i++) {
            avr8js.avrInstruction(cpu);
            cpu.tick();
        }
        if (!stop) {
            setTimeout(runCode, 0);
        } else {
            stop = false;
            console.log('STOPPED !');
        }
    }

    stop = false;
    runButton.removeAttribute('disabled');
    runCode();
}
