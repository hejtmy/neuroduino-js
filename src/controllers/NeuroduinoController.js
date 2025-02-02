import { SerialController } from './SerialController.js';

/**
 * Controller for interfacing with the Neuroduino Arduino device
 */
export class NeuroduinoController {
    serialController;
    connected = false;
    messageCallback;

    constructor() {
        this.serialController = new SerialController();
    }

    /**
     * Connects to the Neuroduino device
     * @returns {Promise<boolean>} True if connection is successful
     */
    async connect() {
        await this.serialController.init();
        if(this.connected) return true;
        
        // Necessary for Arduino to "get its footing"
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // add timeout for the effort to connect
        let connectionTimeout = setTimeout(() => {
            this.serialController.stopReading();
            return false;
        }, 5000);

        this.serialController.write("WHO!");
        return new Promise((resolve) => {
            this.serialController.read((value) => {
                console.log("value came " + value);
                if(value == "NEURODUINO"){
                    this.serialController.stopReading();
                    this.serialController.write("DONE!");
                    this.connected = true;
                    clearTimeout(connectionTimeout);
                    resolve(true);
                }
            });
        });
    }

    /**
     * Starts listening for messages from the device
     * @param {Function} callback Callback function for received messages
     */
    startReading(callback = (value) => {}) {
        if (!this.connected) return;
        this.serialController.messageCallback = callback;
        this.serialController.read();
    }

    /**
     * Stops listening for messages
     */
    stopReading() {
        this.serialController.stopReading();
    }

    /**
     * Disconnects from the device
     */
    disconnect() {
        if (!this.connected) return;
        this.serialController.write("DISCONNECT!");
        this.connected = false;
        this.serialController.close();
    }

    /**
     * Sends the blink command to flash the LED
     */
    blink() {
        if(!this.connected) return;
        this.serialController.write("BLINK!");
    }

    /**
     * Sends a pulse pattern to the device
     * @param {number} value Number between 0-15 representing the 4-bit pulse pattern
     */
    async sendPulse(value) {
        if(!this.connected) return;
        if(value < 0 || value > 15) {
            throw new Error('Pulse value must be between 0 and 15');
        }
        // Convert number to 4-bit binary string
        const binaryStr = value.toString(2).padStart(4, '0');
        this.serialController.write(`PULSE+${binaryStr}!`);
    }

    /**
     * Stops any active pulse
     */
    async pulseDown() {
        if(!this.connected) return;
        this.serialController.write("PULSE-!");
    }
} 