import LineBreakTransformer from "./helpers";

class SerialController {
	reader;
	writer;
	encoder = new TextEncoder();
	lastValue;
	port;
	isReading;
	messageCallback = (val) => { };

	async init() {
		if (this.port != null) return;
		if ('serial' in navigator) {
			try {
				this.port = await navigator.serial.requestPort();
				await this.port.open({ baudRate: 9600 });
				//this.reader = this.port.readable.getReader();
				this.writer = this.port.writable.getWriter();
				await this.port.setSignals({ dataTerminalReady: true, requestToSend: true });
				let signals = await this.port.getSignals();
				console.log(signals)
			} catch (err) {
				console.error('There was an error opening the serial port:', err);
			}
		} else {
			console.error('Web serial doesn\'t seem to be enabled in your browser. Try enabling it by visiting:')
			console.error('chrome://flags/#enable-experimental-web-platform-features');
			console.error('opera://flags/#enable-experimental-web-platform-features');
			console.error('edge://flags/#enable-experimental-web-platform-features');
		}
	}

	async write(data) {
		this.keepReading = false;
		const dataArrayBuffer = this.encoder.encode(data);
		return await this.writer.write(dataArrayBuffer);
	}

	stopReading() {
		this.isReading = false;
	}

	async read(onMessage = (val) => { }, onFinished = () => { }) {
		if (this.isReading) return;
		let keepReading = true;
		while (this.port.readable && keepReading) {
			const textDecoder = new TextDecoderStream();
			const readableStreamClosed = this.port.readable.pipeTo(textDecoder.writable);
			const decodingReader = textDecoder.readable
				.pipeThrough(new TransformStream(new LineBreakTransformer()))
				.getReader();
			this.isReading = true;
			try {
				while (this.isReading) {
					const { value, done } = await decodingReader.read();
					if (done) {
						decodingReader.releaseLock();
						break;
					}
					// Shoot an event
					this.lastValue = value;
					console.log(value);
					onMessage(value);
					this.messageCallback(value);
					if (value == "DONE" || value == "TIME IS UP") {
						break;
					}
				}
			} finally {
				keepReading = false;
				this.isReading = false;
				onFinished();
				decodingReader.cancel();
				decodingReader.releaseLock();
				await readableStreamClosed.catch(() => { /* Ignore the error */ });
			}
		}
	}
}

export default SerialController;