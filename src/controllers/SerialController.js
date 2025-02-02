import { LineBreakTransformer } from '../utils/LineBreakTransformer.js';

/**
 * Controller for handling serial communication with devices
 */
export class SerialController {
    reader;
    writer;
    encoder = new TextEncoder();
    decoder = new TextDecoder();
    lastValue;
    port;
    isReading = false;
    messageCallback = (val) => {};
    readableStreamClosed;
    writableStreamClosed;

    async init() {
        if(this.port != null) return;
        if ('serial' in navigator) {
            try {
                this.port = await navigator.serial.requestPort();
                await this.port.open({ baudRate: 9600 });
                this.writer = this.port.writable.getWriter();
                await this.port.setSignals({ dataTerminalReady: true, requestToSend: true});
                let signals = await this.port.getSignals();
                console.log(signals)
            } catch(err) {
                console.error('There was an error opening the serial port:', err);
                throw err;
            }
        } else {
            const error = new Error('Web Serial API is not supported in your browser');
            console.error(error.message);
            throw error;
        }
    }

    async close() {
        if (this.reader) {
            await this.reader.cancel();
            await this.readableStreamClosed?.catch(() => { /* Ignore the error */ });
            this.reader = null;
        }
        if (this.writer) {
            await this.writer.close();
            await this.writableStreamClosed?.catch(() => { /* Ignore the error */ });
            this.writer = null;
        }
        if (this.port) {
            await this.port.close();
            this.port = null;
        }
    }

    async write(data) {
        const dataArrayBuffer = this.encoder.encode(data);
        return await this.writer.write(dataArrayBuffer);
    }

    stopReading() {
        this.isReading = false;
    }

    async read(onMessage = (val) => {}, onFinished = () => {}) {
        if (this.isReading) return;
        this.isReading = true;

        try {
            while (this.port.readable && this.isReading) {
                const textDecoder = new TextDecoderStream();
                const transformStream = new TransformStream(new LineBreakTransformer());
                
                // Create the pipeline
                this.readableStreamClosed = this.port.readable
                    .pipeThrough(textDecoder)
                    .pipeThrough(transformStream);

                // Get a reader for the transformed stream
                const reader = this.readableStreamClosed.getReader();

                try {
                    while (this.isReading) {
                        const { value, done } = await reader.read();
                        if (done) break;

                        // Process the value
                        if (value) {
                            this.lastValue = value;
                            console.log(value);
                            onMessage(value);
                            this.messageCallback(value);
                            if (value === "DONE" || value === "TIME IS UP") {
                                break;
                            }
                        }
                    }
                } finally {
                    reader.releaseLock();
                }
            }
        } catch (error) {
            console.error('Error in read:', error);
        } finally {
            this.isReading = false;
            onFinished();
        }
    }
} 