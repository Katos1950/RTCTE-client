import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';

export default class SceneInit {
  constructor(canvasId) {
    // NOTE: Core components to initialize Three.js app.
    this.scene = undefined;
    this.camera = undefined;
    this.renderer = undefined;
    this.ball = null;

    // NOTE: Camera params;
    this.fov = 45;
    this.nearPlane = 1;
    this.farPlane = 1000;
    this.canvasId = canvasId;

    // NOTE: Additional components.
    this.clock = undefined;
    this.stats = undefined;
    this.controls = undefined;

    // NOTE: Lighting is basically required.
    this.ambientLight = undefined;
    this.directionalLight = undefined;
  }

  initialize() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
        this.fov,
        window.innerWidth / window.innerHeight,
        1,
        1000
    );
    this.camera.position.z = 48;

    // Select the canvas created in the parent container
    const canvas = document.getElementById(this.canvasId);
    this.renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
    });

    // Set the renderer to the container's size
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    this.clock = new THREE.Clock();
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    // Add lighting to the scene
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(this.ambientLight);

    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    this.directionalLight.position.set(0, 32, 64);
    this.scene.add(this.directionalLight);

    window.addEventListener('resize', () => this.onWindowResize(), false);
}


animate() {
    window.requestAnimationFrame(this.animate.bind(this));
    
    // Rotate the ball if it exists
    if (this.ball) {
      this.ball.rotation.y += 0.005; // Adjust rotation speed as needed
    }
  
    this.render();
    this.controls.update();
  }
  

  render() {
    // NOTE: Update uniform data on each render.
    // this.uniforms.u_time.value += this.clock.getDelta();
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    const canvas = this.renderer.domElement;
    const container = canvas.parentElement;
    this.camera.aspect = container.clientWidth / container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(container.clientWidth, container.clientHeight);
}

}
