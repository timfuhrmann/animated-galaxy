import GUI from "lil-gui";
import fragmentShader from "./shaders/fragment.glsl";
import vertexShader from "./shaders/vertex.glsl";
import {
    AdditiveBlending,
    BufferAttribute,
    BufferGeometry,
    Clock,
    Color,
    PerspectiveCamera,
    Points,
    Scene,
    ShaderMaterial,
    WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export class Galaxy {
    private gui: GUI;

    private scene: Scene;
    private renderer: WebGLRenderer;
    private camera: PerspectiveCamera;
    private clock: Clock;
    private controls: OrbitControls;

    private geometry: BufferGeometry | null = null;
    private material: ShaderMaterial | null = null;
    private points: Points | null = null;

    private size = {
        width: window.innerWidth,
        height: window.innerHeight,
    };

    private parameters = {
        count: 200000,
        size: 0.005,
        radius: 5,
        branches: 3,
        spin: 1,
        randomness: 0.2,
        randomnessPower: 3,
        insideColor: "#ff6030",
        outsideColor: "#1b3984",
    };

    private animationFrame: number = 0;

    constructor() {
        this.gui = new GUI();

        this.clock = new Clock();

        this.scene = new Scene();

        this.camera = new PerspectiveCamera(75, this.size.width / this.size.height, 0.1, 100);
        this.camera.position.x = 3;
        this.camera.position.y = 3;
        this.camera.position.z = 3;
        this.scene.add(this.camera);

        this.renderer = new WebGLRenderer();
        this.renderer.setSize(this.size.width, this.size.height);
        this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
        document.body.appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;

        this.generateGalaxy();
        this.initGui();
        this.tick();
    }

    private generateGalaxy(): void {
        if (this.points !== null) {
            this.geometry?.dispose();
            this.material?.dispose();
            this.scene.remove(this.points);
        }

        this.geometry = new BufferGeometry();

        const positions = new Float32Array(this.parameters.count * 3);
        const randomness = new Float32Array(this.parameters.count * 3);
        const colors = new Float32Array(this.parameters.count * 3);
        const scales = new Float32Array(this.parameters.count);

        const insideColor = new Color(this.parameters.insideColor);
        const outsideColor = new Color(this.parameters.outsideColor);

        for (let i = 0; i < this.parameters.count; i++) {
            const i3 = i * 3;

            const radius = Math.random() * this.parameters.radius;

            const branchAngle =
                ((i % this.parameters.branches) / this.parameters.branches) * Math.PI * 2;

            const randomX =
                Math.pow(Math.random(), this.parameters.randomnessPower) *
                (Math.random() < 0.5 ? 1 : -1) *
                this.parameters.randomness *
                radius;
            const randomY =
                Math.pow(Math.random(), this.parameters.randomnessPower) *
                (Math.random() < 0.5 ? 1 : -1) *
                this.parameters.randomness *
                radius;
            const randomZ =
                Math.pow(Math.random(), this.parameters.randomnessPower) *
                (Math.random() < 0.5 ? 1 : -1) *
                this.parameters.randomness *
                radius;

            positions[i3] = Math.cos(branchAngle) * radius;
            positions[i3 + 1] = 0;
            positions[i3 + 2] = Math.sin(branchAngle) * radius;

            randomness[i3] = randomX;
            randomness[i3 + 1] = randomY;
            randomness[i3 + 2] = randomZ;

            const mixedColor = insideColor.clone();
            mixedColor.lerp(outsideColor, radius / this.parameters.radius);

            colors[i3] = mixedColor.r;
            colors[i3 + 1] = mixedColor.g;
            colors[i3 + 2] = mixedColor.b;

            scales[i] = Math.random();
        }

        this.geometry.setAttribute("position", new BufferAttribute(positions, 3));
        this.geometry.setAttribute("aRandomness", new BufferAttribute(randomness, 3));
        this.geometry.setAttribute("color", new BufferAttribute(colors, 3));
        this.geometry.setAttribute("aScale", new BufferAttribute(scales, 1));

        this.material = new ShaderMaterial({
            depthWrite: false,
            blending: AdditiveBlending,
            vertexColors: true,
            uniforms: {
                uTime: { value: 0 },
                uSize: { value: 30 * this.renderer.getPixelRatio() },
            },
            vertexShader,
            fragmentShader,
        });

        this.points = new Points(this.geometry, this.material);
        this.scene.add(this.points);
    }

    private initGui(): void {
        this.gui
            .add(this.parameters, "count")
            .min(100)
            .max(1000000)
            .step(100)
            .onFinishChange(this.generateGalaxy.bind(this));
        this.gui
            .add(this.parameters, "radius")
            .min(0.01)
            .max(20)
            .step(0.01)
            .onFinishChange(this.generateGalaxy.bind(this));
        this.gui
            .add(this.parameters, "branches")
            .min(2)
            .max(20)
            .step(1)
            .onFinishChange(this.generateGalaxy.bind(this));
        this.gui
            .add(this.parameters, "randomness")
            .min(0)
            .max(2)
            .step(0.001)
            .onFinishChange(this.generateGalaxy.bind(this));
        this.gui
            .add(this.parameters, "randomnessPower")
            .min(1)
            .max(10)
            .step(0.001)
            .onFinishChange(this.generateGalaxy.bind(this));
        this.gui
            .addColor(this.parameters, "insideColor")
            .onFinishChange(this.generateGalaxy.bind(this));
        this.gui
            .addColor(this.parameters, "outsideColor")
            .onFinishChange(this.generateGalaxy.bind(this));
    }

    private tick(): void {
        this.renderer.render(this.scene, this.camera);

        if (this.material) {
            this.material.uniforms.uTime.value = this.clock.getElapsedTime();
        }

        this.controls.update();

        this.animationFrame = window.requestAnimationFrame(this.tick.bind(this));
    }

    public destroy(): void {
        this.renderer.dispose();
        this.renderer.domElement.remove();
    }
}
