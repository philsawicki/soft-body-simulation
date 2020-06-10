import * as dat from 'dat.gui';
import { World } from 'ecsy';
import Stats from 'stats.js/src/Stats.js';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import AmmoLoader from './libs/ammo.wasm.js';
import { Ball, Object3D, PhysicsWorld, RigidBody, Scene, SoftBody } from './components';
import { BallSystem, RigidBodySystem, SimulationSystem, SoftBodySystem } from './systems';
// import { OBJLoader } from './libs/OBJLoader.js';
// import { MTLLoader } from './libs/MTLLoader.js';
import * as Materials from './materials.js';
// import { GLTFLoader } from './libs/GLTFLoader.js';


// Graphics variables:
/**
 * @type {Stats[]}
 */
const stats = [];
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.2, 2000);
const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls(camera, renderer.domElement);
const scene = new THREE.Scene();
const clock = new THREE.Clock();
let launchRequested = false;
const mouseCoords = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
let ballMaterial = new THREE.MeshPhongMaterial({ color: 0x202020 });
const position = new THREE.Vector3();
const quaternion = new THREE.Quaternion();

// Physics variables
self.Ammo = null;
const margin = 0.05;

// ECSY
const world = new World();


/**
 * Initialize the application.
 */
function initializeApplication() {
    // Initialize application components and create world objects:
    initializeWorld();
    initializeGraphics();
    createObjects();
    initializeInputs();
    initializeGUI();

    // Once the DOM is ready, display the canvas and start the animation loop:
    onDOMReady(() => {
        const infoContainer = document.getElementById('info');
        infoContainer.classList.remove('hidden');

        const container = document.getElementById('container');
        container.innerHTML = '';
        container.appendChild(renderer.domElement);

        // Add Stats widgets:
        for (let i = 0; i < 3; ++i) {
            const stat = new Stats();
            stat.showPanel(i);

            stat.dom.style.position = 'absolute';
            stat.dom.style.top = '5px';
            stat.dom.style.left = `${80 * i + 5}px`;
            container.appendChild(stat.dom);

            stats.push(stat);
        }

        clock.start();
        animate();
    });
}

/**
 * Initialize the World.
 */
function initializeWorld() {
    world
        .registerComponent(Object3D)
        .registerComponent(PhysicsWorld)
        .registerComponent(Scene)
        .registerComponent(SoftBody)
        .registerComponent(RigidBody)
        .registerComponent(Ball)
        .registerSystem(RigidBodySystem)
        .registerSystem(SoftBodySystem)
        .registerSystem(BallSystem)
        .registerSystem(SimulationSystem);
}

/**
 * Initialize the GUI system.
 */
function initializeGUI() {
    const saveTextFile = (data, filename) => {
        const output = JSON.stringify(data, null, 2);
        const blob = new Blob([output], {
            type: 'text/plain'
        });

        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const guiData = {
        exportScene: () => {
            new GLTFExporter().parse(scene, gltfScene => {
                saveTextFile(gltfScene, 'scene.gltf');
            });
        },
        exportECS: () => {
            const systemsData = {
                systems: []
            };

            for (const system of world.getSystems()) {
                systemsData.systems.push(system.toJSON())
            }

            saveTextFile(systemsData, 'ecs.json');
        }
    };

    const gui = new dat.GUI({
        exportScene: 'Export to glTF',
        exportECS: 'Export ECS data'
    });

    gui
        .add(guiData, 'exportScene')
        .name('Export to glTF');
    gui
        .add(guiData, 'exportECS')
        .name('Export ECS data');
}

/**
 * Initialize the THREE environment.
 */
function initializeGraphics() {
    world
        .createEntity()
        .addComponent(Scene, { scene });


    scene.background = new THREE.Color(0xBFD1E5);
    Materials.getEnvironmentMap().then(texture => {
        scene.background = texture;
    });

    camera.position.set(-7, 5, 8);

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;

    controls.target.set(0, 2, 0);
    controls.update();

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    const d = 20;
    light.position.set(-10, 10, 5);
    light.castShadow = true;
    light.shadow.camera.left = -d;
    light.shadow.camera.right = d;
    light.shadow.camera.top = d;
    light.shadow.camera.bottom = -d;
    light.shadow.camera.near = 2;
    light.shadow.camera.far = 50;
    light.shadow.mapSize.x = 2048;
    light.shadow.mapSize.y = 2048;
    scene.add(light);

    window.addEventListener('resize', onWindowResize, false);
}

/**
 * Register event listeners.
 */
function initializeInputs() {
    window.addEventListener('mousedown', e => {
        if (e.target && e.target.matches('canvas') && !launchRequested) {
            mouseCoords.set(
                (e.clientX / window.innerWidth) * 2 - 1,
                -(e.clientY / window.innerHeight) * 2 + 1
            );
            launchRequested = true;
        }
    }, false);
}

/**
 * Create World objects and entities.
 */
function createObjects() {
    // Ground:
    position.set(0, -0.5, 0);
    quaternion.set(0, 0, 0, 1);
    const ground = createBox(40, 1, 40, 0, position, quaternion, new THREE.MeshPhongMaterial({ color: 0xFFFFFF }));
    ground.castShadow = false;
    ground.receiveShadow = true;

    Materials.getMarbleTiles1BRMaterial().then(material => {
        ground.material = material;
        ground.material.needsUpdate = true;
    });


    // Create soft volumes:
    Materials.getSkinPBRMaterial().then(material => {
        const volumeMass = 15;

        let units = 2.5;
        const cubeGeometry = new THREE.BoxBufferGeometry(units, units, units, units*5, units*5, units*5);
        cubeGeometry.translate(5, 5, 0);
        createSoftBody(cubeGeometry, volumeMass*units, 300*units, material);

        units = 1.25;
        const boxGeometry = new THREE.BoxBufferGeometry(units, units, units*5, units*4, units*4, units*4*5);
        boxGeometry.translate(-2, 5, 0);
        createSoftBody(boxGeometry, volumeMass*units, 120*units, material);
    });


    // Ramp:
    position.set(3, 1, 0);
    quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), 30 * Math.PI / 180);
    const obstacle = createBox(10, 1, 4, 0, position, quaternion, new THREE.MeshPhongMaterial({ color: 0x606060 }));
    obstacle.castShadow = true;
    obstacle.receiveShadow = true;

    Materials.getWoodFloor7BRMaterial().then(material => {
        obstacle.material = material;
        obstacle.material.needsUpdate = true;
    });


    // OBJ model:
    // new MTLLoader().load('models/fish/fishOBJ.mtl', materials => {
    //     materials.preload();

    //     new OBJLoader()
    //         .setMaterials(materials)
    //         .load('models/fish/fishOBJ.obj', obj => {
    //             const { geometry, material } = obj.children[0];
    //             geometry.translate(0.0, 33.0, 5.0);
    //             createSoftBody(geometry, 250, 5000, material);
    //         });
    // });


    // glTF model:
    // new GLTFLoader().load('./models/octopus_low/scene.gltf', gltf => {
    //     gltf.scene.translateY(100);
    //     // scene.add(gltf.scene);
    //     Materials.getSkinPBRMaterial().then(skinMaterial => {
    //         gltf.scene.traverse(child => {
    //             if (child.isMesh) {
    //                 const scale = 0.15;
    //                 const { geometry } = child;
    //                 geometry.rotateX(-90)
    //                 geometry.translate(0, 50, 0);
    //                 geometry.scale(scale, scale, scale);
    //                 createSoftBody(geometry, 250, 7500, skinMaterial);
    //             }
    //         });
    //     });
    // });
}

/**
 * Create a SoftBody entity and add it to the World.
 *
 * @param {THREE.BufferGeometry} bufferGeometry Buffer geometry of the entity.
 * @param {number} mass Mass of the soft body.
 * @param {number} pressure Pressure of the soft body.
 * @param {THREE.Material} material Material of the entity.
 * @return {ecsy.Entity} The soft body that was created.
 */
function createSoftBody(bufferGeometry, mass, pressure, material) {
    return world.createEntity()
        .addComponent(Object3D, { object: bufferGeometry })
        .addComponent(SoftBody, {
            mass,
            pressure,
            bufferGeometry,
            margin,
            material
        });
}

/**
 * Create a RigidBody entity and add it to the World.
 *
 * @param {THREE.Mesh} object THREE object to add to the world.
 * @param {Ammo.btBoxShape|Ammo.btSphereShape} physicsShape Ammo physics shape of the object.
 * @param {number} mass Mass of the rigid body.
 * @param {THREE.Vector3} position Position of the THREE object.
 * @param {THREE.Quaternion} quaternion Orientation of the THREE object.
 * @return {ecsy.Entity} The rigid body that was created.
 */
function createRigidBody(object, physicsShape, mass, position, quaternion) {
    return world.createEntity()
        .addComponent(Object3D, { object })
        .addComponent(RigidBody, {
            physicsShape,
            mass,
            position: position.clone(),
            quaternion: quaternion.clone()
        });
}

/**
 * Create a box rigid body entity and add it to the world.
 *
 * @param {number} width Width of the box.
 * @param {number} height Height of the box.
 * @param {number} depth Depth of the box.
 * @param {number} mass Mass of the box.
 * @param {THREE.Vector3} position Position of the box.
 * @param {THREE.Quaternion} quaternion Orientation of the box.
 * @param {THREE.Material} material Material of the box.
 * @return {THREE.Mesh} The mesh of the box that was created.
 */
function createBox(width, height, depth, mass, position, quaternion, material) {
    const boxMesh = new THREE.Mesh(new THREE.BoxBufferGeometry(width, height, depth, 1, 1, 1), material);
    const shape = new Ammo.btBoxShape(new Ammo.btVector3(width * 0.5, height * 0.5, depth * 0.5));
    shape.setMargin(margin);

    createRigidBody(boxMesh, shape, mass, position, quaternion);
    return boxMesh;
}

/**
 * Create a ball Rigid Body.
 */
function createBall() {
    const ballMass = 3;
    const ballRadius = 0.4;

    const ballMesh = new THREE.Mesh(new THREE.SphereBufferGeometry(ballRadius, 18, 16), ballMaterial);
    ballMesh.castShadow = true;
    ballMesh.receiveShadow = true;

    const sphereShape = new Ammo.btSphereShape(ballRadius);
    sphereShape.setMargin(margin);
    position.copy(raycaster.ray.direction);
    position.add(raycaster.ray.origin);
    quaternion.set(0, 0, 0, 1);

    createRigidBody(ballMesh, sphereShape, ballMass, position, quaternion)
        .addComponent(Ball, {
            velocityDirection: raycaster.ray.direction.clone()
        });
}

/**
 * Handle click events on the canvas.
 */
function processClick() {
    if (launchRequested) {
        raycaster.setFromCamera(mouseCoords, camera);

        createBall();

        launchRequested = false;
    }
}

/**
 * Handler for window resize events.
 */
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

/**
 * Handler for `requestAnimationFrame()` callbacks.
 */
function animate() {
    for (const stat of stats) {
        stat.begin();
    }

    world.execute(clock.getDelta(), clock.elapsedTime);
    processClick();
    renderer.render(scene, camera);

    for (const stat of stats) {
        stat.end();
    }

    requestAnimationFrame(animate);
}

/**
 * Execute the given callback function when the DOM is ready.
 *
 * @param {Function} callback Callback to execute when the DOM is ready.
 */
function onDOMReady(callback) {
    if (document.readyState !== 'loading') {
        callback();
    } else {
        document.addEventListener('DOMContentLoaded', callback);
    }
}


/**
 * Bootstrap the application.
 */
(async () => {
    await Promise.all([
        // Preload resources:
        Materials.getSkinPBRMaterial(),
        Materials.getWoodFloor7BRMaterial(),
        Materials.getMarbleTiles1BRMaterial(),

        // Load and compile Ammo.js (port of Bullet to WASM):
        new Promise(resolve => {
            AmmoLoader().then(library => {
                Ammo = library;
                resolve();
            });
        })
    ]);

    initializeApplication();

    Materials.getMetalGrunge4PBRMaterial().then(mat => {
        ballMaterial = mat;
    });
})();
