import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader.js';
import * as dat from 'dat.gui';
import * as Stats from 'stats.js';

import Tail from './tail';
import SelectedDirection from './selected_direction';
import AngleSphere from './angle_sphere';
import Arrow3DGeometry from './arrow_3d';
import * as materials from './materials';

var TAIL_NAME = "tails_";
var APPLE_NAME = "apple";

var SPOT_LIGHT_NAME = "spotLight";
var DIRECTIONAL_LIGHT_NAME = "directionalLight";

var SPHERE_FRAGMENT = 40;

var SKIP_FRAME = 0;
var skipper = 0;

var SIZE_CUBE = 200.0;
var RADIUS_SNAKE = 2.0;
var START_TAILS_SNAKE = 3;
var INITIAL_JUMPS = 5;

// global variables
var renderer;
var scene;
var camera;
var control;
var stats;


var view = 0;
var jumps = 0;

var tails = [];
var apple = new Tail(APPLE_NAME);

var moveSnake = new THREE.Vector3(0, 0, 1);
var vEye = new THREE.Vector3();
var vTarget = new THREE.Vector3();
var vUp = new THREE.Vector3(0.0, 1.0, 0.0);
var vArrow = new THREE.Vector3(0.0, 0.0, 0.0);


var direction = new SelectedDirection();



// background stuff
var cameraBG;
var sceneBG;
var composer;
var clock;
var canvas;
var arrow;



var rotLeftRight = 0.0;
var rotUpDown = 0.0;
var jumps = 0;
var point = 0;
var startGame = true;
var endGame = false;
var pause = false;
var refreshText = true;

/**
 * Initializes the scene, camera and objects. Called when the window is
 * loaded by using window.onload (see below)
 */
function initInin() {
    var i;
    for (i = 0; i < START_TAILS_SNAKE; i += 1) {
        tails.push(new Tail(TAIL_NAME + i));
    }


    // create a scene, that will hold all our elements such as objects, cameras and lights.
    scene = new THREE.Scene();

    // create a camera, which defines where we're looking at.
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

    // create a render, sets the background color and the size
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0x000000, 1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;

    var materialsArea = [
        materials.wallMaterial,
        materials.wallMaterial,
        materials.skyMaterial,
        materials.groundMaterial,
        materials.wallMaterial,
        materials.wallMaterial
    ];

    // now add some better lighting
    var ambientLight = new THREE.AmbientLight(0xAAAAAA);
    ambientLight.name = 'ambient';
    scene.add(ambientLight);

    // create a cube
    var arenaGeometry = new THREE.BoxGeometry(SIZE_CUBE, SIZE_CUBE, SIZE_CUBE, 1, 1, 1);
    var arena = new THREE.Mesh(arenaGeometry, materialsArea);
    arena.name = 'arena';
    arena.receiveShadow = true;
    scene.add(arena);


    // create a cube
    var appleGeometry = new THREE.SphereGeometry(RADIUS_SNAKE, SPHERE_FRAGMENT, SPHERE_FRAGMENT);

    var appleMesh = new THREE.Mesh(appleGeometry, materials.appleMaterial);
    appleMesh.name = apple.getName();
    appleMesh.castShadow = true;

    scene.add(appleMesh);
    
    var arrowGeometry = new Arrow3DGeometry(
            10, 8,
            3, 10,
            0, 1
            ); 
    var arrowMaterial = new THREE.MeshPhongMaterial( { color: "green" } );
    
    arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
    arrow.name = "arrow";
    scene.add(arrow);

    


    // position and point the camera to the center of the scene
    camera.position.x = 15;
    camera.position.y = 16;
    camera.position.z = 13;
    camera.lookAt(scene.position);

    // add spotlight for the shadows
    var spotLight = new THREE.SpotLight(0x5B5B5B);
    spotLight.position.set(10, 20, 20);
    spotLight.shadow.camera.near = SIZE_CUBE/10;
    spotLight.shadow.camera.far = SIZE_CUBE/4;
    spotLight.castShadow = true;
    spotLight.name = SPOT_LIGHT_NAME;
    scene.add(spotLight);
    scene.add(spotLight.target);
    
    
    // add sunlight (light
    var directionalLight = new THREE.DirectionalLight(0xdddddd, 0.5);
    directionalLight.position.set(200, 10, -50);
    directionalLight.name = DIRECTIONAL_LIGHT_NAME;
    scene.add(directionalLight);
    scene.add(directionalLight.target);



    // setup the control object for the control gui
    control = new function () {
        this.newGame = newGame;
        this.delay = 20;
        this.withdrwalBack = 17;
        this.withdrwalUp = 10;
        this.godMode = false;
        this.showHint = true;
        this.addTenTail = function () {
            var i;
            for (i = 0; i < 10; i += 1) {
                createTail();
            }
            updatePoints();
        };
        this.addOneTail = function () {
            createTail();
            updatePoints();
        };
        this.clearTail = function () {
            var i;
            for (i = tails.length - 1; i >= START_TAILS_SNAKE; i  -= 1) {
                var t = tails[i];
                var name = t.getName();
                var o = scene.getObjectByName(name);
                scene.remove(o);
                tails.splice(i, 1);
            }
            updatePoints();
            return;
        };
        this.help = function () {
            window.alert("Pomoc: \r\n"
                    + "Sterowanie: WASD; \r\n"
                    + "Zmiana widoku kamery: C \r\n"
                    + "Pauza: P \r\n"
                    + "Większy kąt prawo/lewo: , \r\n"
                    + "Większy kąt góra/dół: . \r\n"
                    + "Większy kąt w wszystkie kierunki: Shift \r\n");
        };
    };

    // add extras
    addControlGui(control);
    addStatsObject();

    // add background using a camera
    cameraBG = new THREE.OrthographicCamera(-window.innerWidth, window.innerWidth, window.innerHeight, -window.innerHeight, -10000, 10000);
    cameraBG.position.z = 500;
    sceneBG = new THREE.Scene();

    var bgPlane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), materials.backgroundMaterial);
    bgPlane.position.z = -1000;
    bgPlane.scale.set(window.innerWidth * 2, window.innerHeight * 2, 1);
    sceneBG.add(bgPlane);

    // setup the composer steps
    // first render the background
    var bgPass = new RenderPass(sceneBG, cameraBG);
    // next render the scene (rotating earth), without clearing the current output
    var renderPass = new RenderPass(scene, camera);
    renderPass.clear = false;
    // finally copy the result to the screen
    var effectCopy = new ShaderPass(CopyShader);
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
    var gui = new dat.GUI();
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
    var text2 = document.getElementById("points");
    
    
    if(text2 === null || text2.length <= 0) {
        text2 = document.createElement('div');
        text2.setAttribute("id", "points");
        text2.style.position = 'absolute';
        text2.style.width = 100;
        text2.style.height = 100;
        text2.style.color = "yellow";
        text2.style.weight = "bold";
        text2.style.top = 0 + 'px';
        text2.style.left = 100 + 'px';
        text2.style.fontSize  = 20 + 'px';
    
        document.body.appendChild(text2);
    }
    
    text2.innerHTML = "Punkty: " + point
                        + "<br />Ogon: " + tails.length;
}


function updateCenterText(text) {
    
    var text2 = document.getElementById("gameInfo");
    
    
    if(text2 === null || text2.length <= 0) {
        text2 = document.createElement('div');
        text2.setAttribute("id", "gameInfo");
        text2.style.position = 'absolute';
        text2.style.width = 200;
        text2.style.height = 200;
        text2.style.color = "red";
        text2.style.weight = "bold";
        text2.style.top = 200 + 'px';
        text2.style.left = 200 + 'px';
        text2.style.fontSize  = 60 + 'px';
    
        document.body.appendChild(text2);
    }
    
    text2.innerHTML = text;
}

function addStatsObject() {
    stats = new Stats();
    stats.setMode(0);

    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';

    document.body.appendChild(stats.domElement);
}


/**
 * Called when the scene needs to be rendered. Delegates to requestAnimationFrame
 * for future renders
 */
function render() {

    ////////////////////Sterowanie//////////////////////////////
    if (direction.left)
    {
        if (direction.accRightLeft && jumps > INITIAL_JUMPS)
        {
            rotLeftRight += Math.PI / 6;
        }
        else
        {
            rotLeftRight += 0.1;
        }
    }
    else if (direction.right)
    {
        if (direction.accRightLeft && jumps > INITIAL_JUMPS)
        {
            rotLeftRight -= Math.PI / 6;
        }
        else
        {
            rotLeftRight -= 0.1;
        }
    }
    if (direction.up)
    {
        if (direction.accUpDown && jumps > INITIAL_JUMPS)
        {
            rotUpDown += Math.PI / 3;
        }
        else
        {
            rotUpDown += 0.5;
        }
    }
    else if (direction.down)
    {
        if (direction.accUpDown && jumps > INITIAL_JUMPS)
        {
            rotUpDown -= Math.PI / 3;
        }
        else
        {
            rotUpDown -= 0.5;
        }
    }

    if (jumps <= INITIAL_JUMPS)
    {
        jumps += 1;
    }

    rotLeftRight = AbsPi(rotLeftRight);
    rotUpDown = AbsPi(rotUpDown);


    /////////////////////OBLICZENIA/////////////////////////////

    //
    // ustawienie położenia węża
    //
    if (skipper >= SKIP_FRAME) {
        skipper = 0;
        if (!pause && startGame && !endGame)
        {
            tails[0].canMove = true;

            var previousLocation = tails[0].location;
            moveSnake = tails[0].Move(rotLeftRight, rotUpDown);
            var head = scene.getObjectByName(tails[0].getName());
            head.position.copy(tails[0].location);
            head.rotation.y = rotLeftRight;
            
            //for (var i = tails.length - 1; i >= 1; i -= 1)
            for (var i = 1; i < tails.length; i += 1)
            {
                if (!tails[i].canMove) {
                    var distance = tails[i].Distance(tails[i - 1].location);
                    if (distance > 2.0 * RADIUS_SNAKE)
                    {
                        tails[i].canMove = true;
                    }
                }

                if (tails[i - 1].canMove)
                {
                    tails[i].PushLocationAndRotation(tails[i - 1].location, tails[i - 1].angleRightLeft, tails[i - 1].angleUpDown);

                    //tails[i].Move(tails[i - 1].angleRightLeft, tails[i - 1].angleUpDown);
                    if (tails[i].canMove)
                    {
                        tails[i].PopLocationAndRotation();
                    }
                }
                var t = scene.getObjectByName(tails[i].getName());
                t.position.copy(tails[i].location);
                t.rotation.y = tails[i].angleRightLeft;
            }

            rotUpDown = 0.0;

        }
    }
    skipper += 1;


    //sprawdzanie uderzenia w sciane

    var bite = false;
    var wall = false;
    //sprawdzanie ugryzienia siebie
    if (!control.godMode)
    {
        var l1 = tails[0].DistanceX(SIZE_CUBE / 2.0);
        var l2 = tails[0].DistanceX(-SIZE_CUBE / 2.0);
        var l3 = tails[0].DistanceY(SIZE_CUBE / 2.0);
        var l4 = tails[0].DistanceY(-SIZE_CUBE / 2.0);
        var l5 = tails[0].DistanceZ(SIZE_CUBE / 2.0);
        var l6 = tails[0].DistanceZ(-SIZE_CUBE / 2.0);
        
        wall = l1 <= RADIUS_SNAKE || l2 <= RADIUS_SNAKE || l3 <= RADIUS_SNAKE || l4 <= RADIUS_SNAKE || l5 <= RADIUS_SNAKE || l6 <= RADIUS_SNAKE;
        for (var i = tails.length - 1; i >= 3; i -= 1)
        {
            if (tails[1].canMove && tails[i].Distance(tails[0].location) < 2.0 * RADIUS_SNAKE)
            {
                bite = true;
                break;
            }
        }
    }


    if (bite || wall)
    {
        endGame = true;
        refreshText = true;
        updateCenterText("Koniec gry!");
    }
    //sprawdzenie zdjedzenia pożywienia
    if (apple.Distance(tails[0].location) < 2.0 * RADIUS_SNAKE)
    {
        point += 1;
        randAppleLocation();
        createTail();
        updatePoints();
    }



    //vEye = new Vector3(0, 0, 0);
    //Vector3 vArrow = new Vector3();
    //ustawienie kamery

    if (view === 0 || view > 1)
    {
        view = 0;
        vEye.x = tails[0].location.x - control.withdrwalBack * moveSnake.x;
        vEye.z = tails[0].location.z - control.withdrwalBack * moveSnake.z;
        vEye.y = tails[0].location.y + control.withdrwalUp;

        vArrow.x = tails[0].location.x + 5 * moveSnake.x;
        vArrow.y = tails[0].location.y + 6;
        vArrow.z = tails[0].location.z + 5 * moveSnake.z;
    }
    else if (view === 1)
    {
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


    var objArrow = scene.getObjectById(arrow.id);
    if (control.showHint)
    {
        arrow.position.x = vArrow.x;
        arrow.position.y = vArrow.y;
        arrow.position.z = vArrow.z;

        arrow.lookAt(apple.location);
        
        if(objArrow !== arrow) {
            scene.add(arrow);
        }
    } else if(objArrow === arrow) {
        scene.remove(arrow);
    }





    //////////////////KONIEC OBLICZEŃ///////////////////////////


    //////////////////USTAWIENIE KAMERY

    camera.position.copy(vEye);
    camera.up = vUp;
    camera.lookAt(vTarget);

                
    var s = scene.getObjectByName(SPOT_LIGHT_NAME);
    s.position.copy(tails[0].location);
    s.target.position.copy(vTarget);
            
    var d = scene.getObjectByName(DIRECTIONAL_LIGHT_NAME);
    d.position.copy(tails[0].location);
    d.target.position.copy(vTarget);


    // update stats
    stats.update();
    
    // and render the scene
    //renderer.render(scene, camera);
    renderer.autoClear = false;
    composer.render();

//    requestAnimationFrame(render);
    // render using requestAnimationFrame
    if(control.delay === 0) {
        requestAnimationFrame(render);
    } else {
        setTimeout(function() { requestAnimationFrame(render); }, control.delay);
    }
}

function randAppleLocation()
{
    var v = new THREE.Vector3();

    var ok = true;
    do
    {
        ok = true;
        v.x = randomIntFromInterval((-SIZE_CUBE / 2.0 + RADIUS_SNAKE), (SIZE_CUBE / 2.0 - RADIUS_SNAKE));
        v.y = randomIntFromInterval((-SIZE_CUBE / 2.0 + RADIUS_SNAKE), (SIZE_CUBE / 2.0 - RADIUS_SNAKE));
        v.z = randomIntFromInterval((-SIZE_CUBE / 2.0 + RADIUS_SNAKE), (SIZE_CUBE / 2.0 - RADIUS_SNAKE));
        for (var i = tails.length - 1; i >= 4; i -= 1)
        {
            if (tails[i].Distance(v) < 2.0 * RADIUS_SNAKE)
            {
                ok = false;
                break;
            }
        }
    }
    while (!ok);
    apple.location = v;
    var name = apple.getName();
    var appleMesh = scene.getObjectByName(name);
    appleMesh.position.copy(v);
    
    arrow.lookAt(apple.location);
}

function randomIntFromInterval(min, max)
{
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function AbsPi(radians)
{
    if (radians > Math.PI * 2)
    {
        return radians - Math.PI * 2;
    }
    else if (rotLeftRight < 0.0)
    {
        return Math.PI * 2 + radians;
    }
    return radians;
}


function newGame()
{
    rotLeftRight = 0.0;
    rotUpDown = 0.0;
    jumps = 0;
    point = 0;

    for (var i = tails.length - 1; i >= 0; i -= 1) {
        var tail = tails[i];
        var obj = scene.getObjectByName(tail.getName());
        scene.remove(obj);
        tails.splice(i, 1);
    }

    for (var i = 0; i < START_TAILS_SNAKE; i += 1)
    {
        createTail();
    }


    randAppleLocation();

    moveSnake = new THREE.Vector3(0, 0, 1);
    startGame = true;
    endGame = false;
    pause = false;
    refreshText = true;
    updatePoints();
    updateCenterText("");
}

function createTail() {
    var vector = new THREE.Vector3();
    var i = tails.length;
    if (tails.length > 0)
        vector = tails[i - 1].location;

    var tail = new Tail(TAIL_NAME + i, vector);
    tails.push(tail);

    // create a cube
    var snakeGeometry = new THREE.SphereGeometry(RADIUS_SNAKE, SPHERE_FRAGMENT, SPHERE_FRAGMENT);

    var snake = new THREE.Mesh(snakeGeometry, materials.snakeMaterial);
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
        
        if(pause) {
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
    
    //arrow.rotation.x = 90 * Math.PI / 180;
    //arrow.lookAt(new THREE.Vector3(apple.location.x, apple.location.y, apple.location.z));
    // call the render function, after the first render, interval is determined
    // by requestAnimationFrame
    render();
    
    // calls the handleResize function when the window is resized
    window.addEventListener('resize', handleResize, false);
    // 
    window.addEventListener('keydown', keyDown, false);
    window.addEventListener('keyup', keyUp, false);
}

window.onload = initBrowser;