export class FPSMonitor {
    constructor(engine) {
        this.engine = engine;
        this.frameWeights = [];
        this.lastFrameTime = performance.now();
        this.isRunning = false;
        this._boundCheck = this.check.bind(this);
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.frameWeights = [];
        requestAnimationFrame(this._boundCheck);
    }

    stop() {
        this.isRunning = false;
    }

    check() {
        if (!this.isRunning || this.engine.isPaused || this.engine.isCalibrating) {
            if (this.isRunning) requestAnimationFrame(this._boundCheck);
            return;
        }

        const now = performance.now();
        const delta = now - this.lastFrameTime;
        const currentFps = Math.round(1000 / delta);
        this.lastFrameTime = now;

        this.frameWeights.push(currentFps);
        if (this.frameWeights.length > 60) this.frameWeights.shift();

        const avgFps = this.frameWeights.reduce((a, b) => a + b, 0) / this.frameWeights.length;
        this.engine.fps = Math.round(avgFps);
        this.engine.latency = delta;

        // Umbral de degradación (30 FPS sostenidos)
        if (this.engine.fps < 30 && this.frameWeights.length === 60 && this.engine.profile !== 'eco') {
            this.engine.degrade();
            this.frameWeights = [];
            window.dispatchEvent(new CustomEvent('buca:perf_critical'));
        }

        requestAnimationFrame(this._boundCheck);
    }
}
