import { ExtrudeGeometryOptions, Vector2, Shape, ExtrudeGeometry, Matrix4 } from 'three';

export default function arrow3DGeometry(
    widthHead: number,
    heightHead: number,
    widthShaft: number,
    heightShaft: number,
    weight: number,
    bevel?: number): ExtrudeGeometry {

    bevel = (typeof bevel !== 'undefined') && bevel > 0 ? bevel : 0;

    const extrudeSettings: ExtrudeGeometryOptions = {
        depth: weight,
        bevelEnabled: bevel > 0,
        bevelSegments: bevel,
        steps: 2,
        bevelSize: 1,
        bevelThickness: 1
    };

    const height: number = heightHead + heightShaft;

    let actualX: number;
    let actualY: number;


    const arrowPts: Vector2[] = [];

    actualX = -widthShaft / 2;
    actualY = -height / 2;
    arrowPts.push(new Vector2(actualX, actualY));

    actualY = actualY + heightShaft;
    arrowPts.push(new Vector2(actualX, actualY));

    actualX = -widthHead / 2;
    arrowPts.push(new Vector2(actualX, actualY));

    actualX = 0;
    actualY = actualY + heightHead;
    arrowPts.push(new Vector2(actualX, actualY));

    actualX = widthHead / 2;
    actualY = actualY - heightHead;
    arrowPts.push(new Vector2(actualX, actualY));

    actualX = widthShaft / 2;
    arrowPts.push(new Vector2(actualX, actualY));

    actualY = -height / 2;
    arrowPts.push(new Vector2(actualX, actualY));

    actualX = arrowPts[0].x;
    actualY = arrowPts[0].y;
    arrowPts.push(new Vector2(actualX, actualY));


    for (const arrowPt of arrowPts) {
        arrowPt.multiplyScalar(0.25);
    }

    const shape: Shape = new Shape(arrowPts);

    const geometry = new ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();

    const matrix = new Matrix4();

    matrix.makeRotationX(90 * Math.PI / 180);

    geometry.applyMatrix4(matrix);

    return geometry;
};