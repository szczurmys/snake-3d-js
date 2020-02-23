import { WebGLRenderer, Scene, PerspectiveCamera, OrthographicCamera, Mesh, Vector3, AmbientLight, BoxGeometry, SphereGeometry, MeshPhongMaterial, SpotLight, DirectionalLight, PlaneGeometry } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader.js';
import * as dat from 'dat.gui';
import * as Stats from 'stats.js';


import Tail from './tail';
import SelectedDirection from './selected_direction';
import arrow3DGeometry from './arrow_3d';
import * as materials from './materials';


const TAIL_NAME: string = "tails_";
const APPLE_NAME: string = "apple";

const SPOT_LIGHT_NAME: string = "spotLight";
const DIRECTIONAL_LIGHT_NAME: string = "directionalLight";

const SPHERE_FRAGMENT: number = 40;

const SKIP_FRAME: number = 0;
let skipper: number = 0;

const SIZE_CUBE: number = 200.0;
const RADIUS_SNAKE: number = 2.0;
const START_TAILS_SNAKE: number = 3;
const INITIAL_JUMPS: number = 5;

// global variables
let renderer: WebGLRenderer;
let scene: Scene;
let camera: PerspectiveCamera;
let control: {
    newGame: () => void,
    delay: number,
    withdrawalBack: number,
    withdrawalUp: number,
    godMode: boolean,
    showHint: boolean,
    addTenTail: () => void,
    addOneTail: () => void,
    clearTail: () => void,
    help: () => void
};
let stats: Stats;


let view: number = 0;

const tails: Tail[] = [];
const apple: Tail = new Tail(APPLE_NAME);

const moveSnake: Vector3 = new Vector3(0, 0, 1);
const vEye: Vector3 = new Vector3();
const vTarget: Vector3 = new Vector3();
const vUp: Vector3 = new Vector3(0.0, 1.0, 0.0);
const vArrow: Vector3 = new Vector3(0.0, 0.0, 0.0);


const direction: SelectedDirection = new SelectedDirection();



// background stuff
let cameraBG: OrthographicCamera;
let sceneBG: Scene;
let composer: EffectComposer;
let arrow: Mesh;



let rotLeftRight: number = 0.0;
let rotUpDown: number = 0.0;
let jumps: number = 0;
let point: number = 0;
let startGame: boolean = true;
let endGame: boolean = false;
let pause: boolean = false;
let refreshText: boolean = true;

/**
 * Initializes the scene, camera and objects. Called when the window is
 * loaded by using window.onload (see below)
 */
function initInin() {
    for (let i = 0; i < START_TAILS_SNAKE; i += 1) {
        tails.push(new Tail(TAIL_NAME + i));
    }


    // create a scene, that will hold all our elements such as objects, cameras and lights.
    scene = new Scene();

    // create a camera, which defines where we're looking at.
    camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

    // create a render, sets the background color and the size
    renderer = new WebGLRenderer();
    renderer.setClearColor(0x000000, 1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;

    const materialsArea = [
        materials.wallMaterial,
        materials.wallMaterial,
        materials.skyMaterial,
        materials.groundMaterial,
        materials.wallMaterial,
        materials.wallMaterial
    ];

    // now add some better lighting
    const ambientLight = new AmbientLight(0xAAAAAA);
    ambientLight.name = 'ambient';
    scene.add(ambientLight);

    // create a cube
    const arenaGeometry = new BoxGeometry(SIZE_CUBE, SIZE_CUBE, SIZE_CUBE, 1, 1, 1);
    const arena = new Mesh(arenaGeometry, materialsArea);
    arena.name = 'arena';
    arena.receiveShadow = true;
    scene.add(arena);


    // create a cube
    const appleGeometry = new SphereGeometry(RADIUS_SNAKE, SPHERE_FRAGMENT, SPHERE_FRAGMENT);

    const appleMesh = new Mesh(appleGeometry, materials.appleMaterial);
    appleMesh.name = apple.getName();
    appleMesh.castShadow = true;

    scene.add(appleMesh);

    const arrowGeometry = arrow3DGeometry(
        10, 8,
        3, 10,
        0, 1
    );
    const arrowMaterial = new MeshPhongMaterial({ color: "green" });

    arrow = new Mesh(arrowGeometry, arrowMaterial);
    arrow.name = "arrow";
    scene.add(arrow);


    // position and point the camera to the center of the scene
    camera.position.x = 15;
    camera.position.y = 16;
    camera.position.z = 13;
    camera.lookAt(scene.position);

    // add spotlight for the shadows
    const spotLight = new SpotLight(0x5B5B5B);
    spotLight.position.set(10, 20, 20);
    spotLight.shadow.camera.near = SIZE_CUBE / 10;
    spotLight.shadow.camera.far = SIZE_CUBE / 4;
    spotLight.castShadow = true;
    spotLight.name = SPOT_LIGHT_NAME;
    scene.add(spotLight);
    scene.add(spotLight.target);

    // add sunlight (light
    const directionalLight = new DirectionalLight(0xdddddd, 0.5);
    directionalLight.position.set(200, 10, -50);
    directionalLight.name = DIRECTIONAL_LIGHT_NAME;
    scene.add(directionalLight);
    scene.add(directionalLight.target);



    // setup the control object for the control gui
    control = {
        newGame,
        delay: 20,
        withdrawalBack: 16,
        withdrawalUp: 11,
        godMode: false,
        showHint: true,
        addTenTail() {
            for (let i = 0; i < 10; i += 1) {
                createTail();
            }
            updatePoints();
        },
        addOneTail() {
            createTail();
            updatePoints();
        },
        clearTail() {
            for (let i = tails.length - 1; i >= START_TAILS_SNAKE; i -= 1) {
                const t = tails[i];
                const name = t.getName();
                const o = scene.getObjectByName(name);
                scene.remove(o);
                tails.splice(i, 1);
            }
            updatePoints();
            return;
        },
        help() {
            window.alert("Pomoc: \r\n"
                + "Sterowanie: WASD; \r\n"
                + "Zmiana widoku kamery: C \r\n"
                + "Pauza: P \r\n"
                + "Większy kąt prawo/lewo: , \r\n"
                + "Większy kąt góra/dół: . \r\n"
                + "Większy kąt w wszystkie kierunki: Shift \r\n");
        }
    };

    // add extras
    addControlGui(control);
    addStatsObject();

    // add background using a camera
    cameraBG = new OrthographicCamera(-window.innerWidth, window.innerWidth, window.innerHeight, -window.innerHeight, -10000, 10000);
    cameraBG.position.z = 500;
    sceneBG = new Scene();

    const bgPlane = new Mesh(new PlaneGeometry(1, 1), materials.backgroundMaterial);
    bgPlane.position.z = -1000;
    bgPlane.scale.set(window.innerWidth * 2, window.innerHeight * 2, 1);
    sceneBG.add(bgPlane);

    // setup the composer steps
    // first render the background
    const bgPass = new RenderPass(sceneBG, cameraBG);
    // next render the scene (rotating earth), without clearing the current output
    const renderPass = new RenderPass(scene, camera);
    renderPass.clear = false;
    // finally copy the result to the screen
    const effectCopy = new ShaderPass(CopyShader);
    effectCopy.renderToScreen = true;

    // add these passes to the composer
    composer = new EffectComposer(renderer);
    composer.addPass(bgPass);
    composer.addPass(renderPass);
    composer.addPass(effectCopy);





    // add the output of the renderer to the html element
    document.body.appendChild(renderer.domElement);

    newGame();
}

function addControlGui(controlObject) {
    const gui = new dat.GUI();
    gui.add(controlObject, 'newGame');
    gui.add(controlObject, 'delay', 0, 500);
    gui.add(controlObject, 'withdrwalBack', 0, 100);
    gui.add(controlObject, 'withdrwalUp', 0, 100);
    gui.add(controlObject, 'godMode');
    gui.add(controlObject, 'showHint');
    gui.add(controlObject, 'addOneTail');
    gui.add(controlObject, 'addTenTail');
    gui.add(controlObject, 'clearTail');
    gui.add(controlObject, 'help');
}

function updatePoints() {
    let text2: HTMLDivElement = document.getElementById("points") as HTMLDivElement;

    if (!text2 || text2.innerHTML.length <= 0) {
        text2 = document.createElement('div') as HTMLDivElement;
        text2.setAttribute("id", "points");
        text2.style.position = 'absolute';
        text2.style.width = '100';
        text2.style.height = '100';
        text2.style.color = "yellow";
        text2.style.fontWeight = "bold";
        text2.style.top = 0 + 'px';
        text2.style.left = 100 + 'px';
        text2.style.fontSize = 20 + 'px';

        document.body.appendChild(text2);
    }

    text2.innerHTML = "Punkty: " + point
        + "<br />Ogon: " + tails.length;
}


function updateCenterText(text) {
    let text2: HTMLDivElement = document.getElementById("gameInfo") as HTMLDivElement;
    if (!text2 || text2.innerHTML.length <= 0) {
        text2 = document.createElement('div') as HTMLDivElement;
        text2.setAttribute("id", "gameInfo");
        text2.style.position = 'absolute';
        text2.style.width = '200';
        text2.style.height = '200';
        text2.style.color = "red";
        text2.style.fontWeight = "bold";
        text2.style.top = 200 + 'px';
        text2.style.left = 200 + 'px';
        text2.style.fontSize = 60 + 'px';

        document.body.appendChild(text2);
    }
    text2.innerHTML = text;
}

function addStatsObject() {
    stats = new Stats();

    stats.dom.style.position = 'absolute';
    stats.dom.style.left = '0px';
    stats.dom.style.top = '0px';

    document.body.appendChild(stats.dom);
}


/**
 * Called when the scene needs to be rendered. Delegates to requestAnimationFrame
 * for future renders
 */
function render() {

    // //////////////////Sterowanie//////////////////////////////
    if (direction.left) {
        if (direction.accRightLeft && jumps > INITIAL_JUMPS) {
            rotLeftRight += Math.PI / 6;
        }
        else {
            rotLeftRight += 0.1;
        }
    }
    else if (direction.right) {
        if (direction.accRightLeft && jumps > INITIAL_JUMPS) {
            rotLeftRight -= Math.PI / 6;
        }
        else {
            rotLeftRight -= 0.1;
        }
    }
    if (direction.up) {
        if (direction.accUpDown && jumps > INITIAL_JUMPS) {
            rotUpDown += Math.PI / 3;
        }
        else {
            rotUpDown += 0.5;
        }
    }
    else if (direction.down) {
        if (direction.accUpDown && jumps > INITIAL_JUMPS) {
            rotUpDown -= Math.PI / 3;
        }
        else {
            rotUpDown -= 0.5;
        }
    }

    if (jumps <= INITIAL_JUMPS) {
        jumps += 1;
    }

    rotLeftRight = AbsPi(rotLeftRight);
    rotUpDown = AbsPi(rotUpDown);


    // ///////////////////OBLICZENIA/////////////////////////////

    //
    // ustawienie położenia węża
    //
    if (skipper >= SKIP_FRAME) {
        skipper = 0;
        if (!pause && startGame && !endGame) {
            tails[0].canMove = true;

            moveSnake.copy(tails[0].move(rotLeftRight, rotUpDown));
            const head = scene.getObjectByName(tails[0].getName());
            head.position.copy(tails[0].location);
            head.rotation.y = rotLeftRight;

            // for (let i = tails.length - 1; i >= 1; i -= 1)
            for (let i = 1; i < tails.length; i += 1) {
                if (!tails[i].canMove) {
                    const distance = tails[i].distance(tails[i - 1].location);
                    if (distance > 2.0 * RADIUS_SNAKE) {
                        tails[i].canMove = true;
                    }
                }

                if (tails[i - 1].canMove) {
                    tails[i].pushLocationAndRotation(tails[i - 1].location, tails[i - 1].angleRightLeft, tails[i - 1].angleUpDown);

                    // tails[i].Move(tails[i - 1].angleRightLeft, tails[i - 1].angleUpDown);
                    if (tails[i].canMove) {
                        tails[i].popLocationAndRotation();
                    }
                }
                const t = scene.getObjectByName(tails[i].getName());
                t.position.copy(tails[i].location);
                t.rotation.y = tails[i].angleRightLeft;
            }

            rotUpDown = 0.0;

        }
    }
    skipper += 1;


    // sprawdzanie uderzenia w sciane

    let bite = false;
    let wall = false;
    // sprawdzanie ugryzienia siebie
    if (!control.godMode) {
        const l1 = tails[0].distanceX(SIZE_CUBE / 2.0);
        const l2 = tails[0].distanceX(-SIZE_CUBE / 2.0);
        const l3 = tails[0].distanceY(SIZE_CUBE / 2.0);
        const l4 = tails[0].distanceY(-SIZE_CUBE / 2.0);
        const l5 = tails[0].distanceZ(SIZE_CUBE / 2.0);
        const l6 = tails[0].distanceZ(-SIZE_CUBE / 2.0);

        wall = l1 <= RADIUS_SNAKE || l2 <= RADIUS_SNAKE || l3 <= RADIUS_SNAKE || l4 <= RADIUS_SNAKE || l5 <= RADIUS_SNAKE || l6 <= RADIUS_SNAKE;
        for (let i = tails.length - 1; i >= 3; i -= 1) {
            if (tails[1].canMove && tails[i].distance(tails[0].location) < 2.0 * RADIUS_SNAKE) {
                bite = true;
                break;
            }
        }
    }


    if (bite || wall) {
        endGame = true;
        refreshText = true;
        updateCenterText("Koniec gry!");
    }
    // sprawdzenie zdjedzenia pożywienia
    if (apple.distance(tails[0].location) < 2.0 * RADIUS_SNAKE) {
        point += 1;
        randAppleLocation();
        createTail();
        updatePoints();
    }



    // vEye = new Vector3(0, 0, 0);
    // Vector3 vArrow = new Vector3();
    // ustawienie kamery

    if (view === 0 || view > 1) {
        view = 0;
        vEye.x = tails[0].location.x - control.withdrawalBack * moveSnake.x;
        vEye.z = tails[0].location.z - control.withdrawalBack * moveSnake.z;
        vEye.y = tails[0].location.y + control.withdrawalUp;

        vArrow.x = tails[0].location.x + 5 * moveSnake.x;
        vArrow.y = tails[0].location.y + 6;
        vArrow.z = tails[0].location.z + 5 * moveSnake.z;
    }
    else if (view === 1) {
        vEye.x = tails[0].location.x;
        vEye.z = tails[0].location.z;
        vEye.y = tails[0].location.y;

        vArrow.x = tails[0].location.x + 15 * moveSnake.x;
        vArrow.y = tails[0].location.y + 2;
        vArrow.z = tails[0].location.z + 15 * moveSnake.z;
    }


    vTarget.x = tails[0].location.x + 20 * moveSnake.x;
    vTarget.y = tails[0].location.y;
    vTarget.z = tails[0].location.z + 20 * moveSnake.z;


    const objArrow = scene.getObjectById(arrow.id);
    if (control.showHint) {
        arrow.position.x = vArrow.x;
        arrow.position.y = vArrow.y;
        arrow.position.z = vArrow.z;

        arrow.lookAt(apple.location);

        if (objArrow !== arrow) {
            scene.add(arrow);
        }
    } else if (objArrow === arrow) {
        scene.remove(arrow);
    }





    // ////////////////KONIEC OBLICZEŃ///////////////////////////


    // ////////////////USTAWIENIE KAMERY

    camera.position.copy(vEye);
    camera.up = vUp;
    camera.lookAt(vTarget);


    const s = scene.getObjectByName(SPOT_LIGHT_NAME) as SpotLight;
    s.position.copy(tails[0].location);
    s.target.position.copy(vTarget);

    const d = scene.getObjectByName(DIRECTIONAL_LIGHT_NAME) as DirectionalLight;
    d.position.copy(tails[0].location);
    d.target.position.copy(vTarget);


    // update stats
    stats.update();

    // and render the scene
    // renderer.render(scene, camera);
    renderer.autoClear = false;
    composer.render();

    //    requestAnimationFrame(render);
    // render using requestAnimationFrame
    if (control.delay === 0) {
        requestAnimationFrame(render);
    } else {
        setTimeout(() => requestAnimationFrame(render), control.delay);
    }
}

function randAppleLocation() {
    const v = new Vector3();

    let ok = true;
    do {
        ok = true;
        v.x = randomIntFromInterval((-SIZE_CUBE / 2.0 + RADIUS_SNAKE), (SIZE_CUBE / 2.0 - RADIUS_SNAKE));
        v.y = randomIntFromInterval((-SIZE_CUBE / 2.0 + RADIUS_SNAKE), (SIZE_CUBE / 2.0 - RADIUS_SNAKE));
        v.z = randomIntFromInterval((-SIZE_CUBE / 2.0 + RADIUS_SNAKE), (SIZE_CUBE / 2.0 - RADIUS_SNAKE));
        for (let i = tails.length - 1; i >= 4; i -= 1) {
            if (tails[i].distance(v) < 2.0 * RADIUS_SNAKE) {
                ok = false;
                break;
            }
        }
    }
    while (!ok);
    apple.location = v;
    const name = apple.getName();
    const appleMesh = scene.getObjectByName(name);
    appleMesh.position.copy(v);

    arrow.lookAt(apple.location);
}

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function AbsPi(radians) {
    if (radians > Math.PI * 2) {
        return radians - Math.PI * 2;
    }
    else if (rotLeftRight < 0.0) {
        return Math.PI * 2 + radians;
    }
    return radians;
}


function newGame() {
    rotLeftRight = 0.0;
    rotUpDown = 0.0;
    jumps = 0;
    point = 0;

    for (let i = tails.length - 1; i >= 0; i -= 1) {
        const tail = tails[i];
        const obj = scene.getObjectByName(tail.getName());
        scene.remove(obj);
        tails.splice(i, 1);
    }

    for (let i = 0; i < START_TAILS_SNAKE; i += 1) {
        createTail();
    }


    randAppleLocation();

    moveSnake.copy(new Vector3(0, 0, 1));
    startGame = true;
    endGame = false;
    pause = false;
    refreshText = true;
    updatePoints();
    updateCenterText("");
}

function createTail() {
    let vector = new Vector3();
    const i = tails.length;
    if (tails.length > 0)
        vector = tails[i - 1].location;

        const tail = new Tail(TAIL_NAME + i, vector);
    tails.push(tail);

    // create a cube
    const snakeGeometry = new SphereGeometry(RADIUS_SNAKE, SPHERE_FRAGMENT, SPHERE_FRAGMENT);

    const snake = new Mesh(snakeGeometry, materials.snakeMaterial);
    snake.name = tail.getName();
    snake.castShadow = true;
    snake.position.copy(tail.location);

    scene.add(snake);
}

/**
 * Function handles the resize event. This make sure the camera and the renderer
 * are updated at the correct moment.
 */
function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function keyDown(event) {
    console.log(event);

    if (event.keyCode === 65) {
        console.log("A LEFT");
        direction.right = false;
        direction.left = true;
    }
    else if (event.keyCode === 87) {
        console.log("W UP");
        direction.down = false;
        direction.up = true;
    }
    else if (event.keyCode === 68) {
        console.log("D RIGHT");
        direction.right = true;
        direction.left = false;
    }
    else if (event.keyCode === 83) {
        console.log("S DOWN");
        direction.down = true;
        direction.up = false;
    }
    else if (event.keyCode === 188) {
        console.log(",");
        direction.accRightLeft = true;
    }
    else if (event.keyCode === 190) {
        console.log(".");
        direction.accUpDown = true;
    }
    else if (event.keyCode === 16) {
        console.log(".");
        direction.accUpDown = true;
        direction.accRightLeft = true;
    }
}

function keyUp(event) {
    console.log(event);

    if (event.keyCode === 65) {
        console.log("A LEFT");
        direction.left = false;
    }
    else if (event.keyCode === 87) {
        console.log("W UP");
        direction.up = false;
    }
    else if (event.keyCode === 68) {
        console.log("D RIGHT");
        direction.right = false;
    }
    else if (event.keyCode === 83) {
        console.log("S DOWN");
        direction.down = false;
    }
    else if (event.keyCode === 80) {
        pause = !pause;

        if (pause) {
            updateCenterText("PAUZA");
        } else {
            updateCenterText("");
        }

        console.log("p");
    }
    else if (event.keyCode === 188) {
        console.log(",");
        direction.accRightLeft = false;
    }
    else if (event.keyCode === 190) {
        console.log(".");
        direction.accUpDown = false;
    }
    else if (event.keyCode === 16) {
        console.log(".");
        direction.accUpDown = false;
        direction.accRightLeft = false;
    }
    else if (event.keyCode === 67) {
        view += 1;
    }
}


function initBrowser() {
    initInin();

    // arrow.rotation.x = 90 * Math.PI / 180;
    // arrow.lookAt(new Vector3(apple.location.x, apple.location.y, apple.location.z));
    // call the render function, after the first render, interval is determined
    // by requestAnimationFrame
    render();

    // calls the handleResize function when the window is resized
    window.addEventListener('resize', handleResize, false);

    window.addEventListener('keydown', keyDown, false);
    window.addEventListener('keyup', keyUp, false);
}

window.onload = initBrowser;