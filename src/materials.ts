import { MeshLambertMaterial, TextureLoader, BackSide, MeshBasicMaterial } from "three";

export const snakeMaterial: MeshLambertMaterial = new MeshLambertMaterial({
    map: new TextureLoader().load('./assets/textures/skin.png')
});

export const wallMaterial: MeshLambertMaterial = new MeshLambertMaterial({
    map: new TextureLoader().load('./assets/textures/wall.png'),
    side: BackSide
});

export const skyMaterial: MeshLambertMaterial = new MeshLambertMaterial({
    map: new TextureLoader().load('./assets/textures/sky.png'),
    side: BackSide
});

export const groundMaterial: MeshLambertMaterial = new MeshLambertMaterial({
    map: new TextureLoader().load('./assets/textures/ground.png'),
    side: BackSide
});

// export const appleMaterial: MeshLambertMaterial = new MeshLambertMaterial({color: 'red'});
export const appleMaterial: MeshLambertMaterial = new MeshLambertMaterial({
    map: new TextureLoader().load('./assets/textures/apple.png')
});

export const backgroundMaterial: MeshBasicMaterial = new MeshBasicMaterial({
    map: new TextureLoader().load("./assets/textures/starry_background.jpg"),
    depthTest: false
});
