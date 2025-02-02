# Neuroduino-JS

A JavaScript interface for communicating with the Neuroduino Arduino project. This package provides a simple way to connect to and control a Neuroduino device through the Web Serial API.

## Prerequisites

- A modern web browser that supports the Web Serial API (Chrome, Edge, Opera)
- Node.js and npm installed
- Arduino with Neuroduino firmware installed

## Installation

1. Clone this repository:
```bash
git clone [repository-url]
cd neuroduino-js
```

2. Install dependencies:
```bash
npm install
```

## Development

To start the development server:

```bash
npm run dev
```

This will start a development server at http://localhost:9000 where you can test the Neuroduino interface.

## Building

To build the package for production:

```bash
npm run build
```

The built files will be available in the `dist` directory.

## Usage

### In Browser

```html
<script src="path/to/neuroduino.js"></script>
<script>
    const arduino = new Neuroduino.ArduinoController();
    
    // Connect to the device
    async function connect() {
        const connected = await arduino.connect();
        if (connected) {
            console.log('Connected to Neuroduino!');
            // Start listening for messages
            arduino.startReading((message) => {
                console.log('Received:', message);
            });
        }
    }
    
    // Send commands
    arduino.blink(); // Blink the LED
    arduino.pulseUp(); // Send pulse up command
    arduino.pulseDown(); // Send pulse down command
</script>
```

### As a Module

```javascript
import { ArduinoController } from 'neuroduino-js';

const arduino = new ArduinoController();
// ... rest of the code is the same as above
```

## API Reference

### ArduinoController

The main class for interacting with the Neuroduino device.

#### Methods

- `connect()`: Connects to the Neuroduino device. Returns a Promise that resolves to `true` if connected successfully.
- `disconnect()`: Disconnects from the device.
- `startReading(callback)`: Starts listening for messages from the device. The callback receives each message as it arrives.
- `stopReading()`: Stops listening for messages.
- `blink()`: Sends the blink command to flash the LED.
- `pulseUp()`: Sends the pulse up command.
- `pulseDown()`: Sends the pulse down command.

## Testing

1. Open the test interface at http://localhost:9000
2. Click "Connect to Device" and select your Arduino from the port list
3. Once connected, you can use the buttons to test different commands
4. The log window will show all communication with the device

## Browser Support

The Web Serial API is currently supported in:
- Chrome/Chromium (version 89+)
- Edge (version 89+)
- Opera (version 75+)

For other browsers, you'll need to enable the Web Serial API flag:
- chrome://flags/#enable-experimental-web-platform-features
- edge://flags/#enable-experimental-web-platform-features
- opera://flags/#enable-experimental-web-platform-features 