import * as THREE from 'three';

export var snakeMaterial = new THREE.MeshLambertMaterial({
    map: new THREE.TextureLoader().load('./assets/textures/skin.png')
});

export var wallMaterial = new THREE.MeshLambertMaterial({
    map: new THREE.TextureLoader().load('./assets/textures/wall.png'),
    side: THREE.BackSide
});

export var skyMaterial = new THREE.MeshLambertMaterial({
    map: new THREE.TextureLoader().load('./assets/textures/sky.png'),
    side: THREE.BackSide
});

export var groundMaterial = new THREE.MeshLambertMaterial({
    map: new THREE.TextureLoader().load('./assets/textures/ground.png'),
    side: THREE.BackSide
});

//var appleMaterial = new THREE.MeshLambertMaterial({color: 'red'});
export var appleMaterial = new THREE.MeshLambertMaterial({
    map: new THREE.TextureLoader().load('./assets/textures/apple.png')
});

export var backgroundMaterial = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("./assets/textures/starry_background.jpg"), depthTest: false });
