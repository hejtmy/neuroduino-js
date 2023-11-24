const SerialController = require("./serial");

class Neuroduino {
	serialController;
	connected;
	messageCallback;

	constructor() {
		this.serialController = new SerialController();
	}

	async connect() {
		await this.serialController.init();
		if (this.connected) return;
		// Necessary for Arduino to "get its footing"
		await new Promise(resolve => setTimeout(resolve, 2000));
		// add timeout for the effort to conenct
		this.serialController.write("WHO!");
		await this.serialController.read((value) => {
			console.log("value came " + value);
			if (value == "NEURODUINO") {
				this.serialController.stopReading();
				this.serialController.write("DONE!");
				this.connected = true;
			}
		})
		return this.connected;
	}

	startReading(callback = (value) => { }) {
		this.serialController.messageCallback = callback;
		this.serialController.read();
	}

	stopReading() {
		this.serialController.stopReading();
	}

	blink() {
		if (!this.connected) return;
		this.serialController.write("BLINK!");
	}

	async pulseUp(callback = () => { }) {
		if (!this.connected) return;
		this.serialController.write("PULSE+0001!");
	}

	async pulseDown(callback = () => { }) {
		if (!this.connected) return;
		this.serialController.write("PULSE-!");
	}
}

export default Neuroduino;