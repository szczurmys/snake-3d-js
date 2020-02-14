/*jslint browser: true*/
/*global THREE*/


THREE.Arrow3DGeometry = function (
        widthHead,
        heightHead,
        widthShaft, 
        heightShaft,
        weight,
        bevel) {

    bevel = (typeof bevel !== 'undefined') && bevel > 0 ? bevel : 0;

    var extrudeSettings = {
        amount: weight,
        bevelEnabled: bevel > 0,
        bevelSegments: bevel,
        steps: 2,
        bevelSize: 1,
        bevelThickness: 1
    };

    var height = heightHead + heightShaft;
    
    var actualX; 
    var actualY;


    var arrowPts = [];
    
    actualX = -widthShaft / 2; 
    actualY = -height / 2;
    arrowPts.push(new THREE.Vector2(actualX, actualY));

    actualY = actualY + heightShaft;
    arrowPts.push(new THREE.Vector2(actualX, actualY));
    
    actualX = -widthHead / 2; 
    arrowPts.push(new THREE.Vector2(actualX, actualY));
    
    actualX = 0; 
    actualY = actualY + heightHead;
    arrowPts.push(new THREE.Vector2(actualX, actualY));
    
    actualX = widthHead / 2; 
    actualY = actualY - heightHead;
    arrowPts.push(new THREE.Vector2(actualX, actualY));
    
    actualX = widthShaft / 2; 
    arrowPts.push(new THREE.Vector2(actualX, actualY));
    
    actualY = -height / 2; 
    arrowPts.push(new THREE.Vector2(actualX, actualY));
    
    actualX = arrowPts[0].x; 
    actualY = arrowPts[0].y;
    arrowPts.push(new THREE.Vector2(actualX, actualY));
    
    

    for (var i = 0; i < arrowPts.length; i ++)
        arrowPts[ i ].multiplyScalar(0.25);

    var shape = new THREE.Shape(arrowPts);
    
    var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    THREE.GeometryUtils.center( geometry );
    
    var matrix = new THREE.Matrix4();
    
    matrix.makeRotationX( 90 * Math.PI / 180 );
    
    geometry.applyMatrix(matrix);
    
    return geometry;
};