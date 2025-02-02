/**
 * Utility class for transforming serial data stream into lines
 */
export class LineBreakTransformer {
    constructor() {
        this.container = '';
    }

    transform(chunk, controller) {
        this.container += chunk;
        const lines = this.container.split('\r\n');
        this.container = lines.pop();
        lines.forEach(line => controller.enqueue(line));
    }

    flush(controller) {
        controller.enqueue(this.container);
    }
} 