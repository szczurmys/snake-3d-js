/*jslint browser: true*/
/*global THREE*/

function LocationAndRotation(location, angleRightLeft, angleUpDown) {
    'use strict';
    this.location = location;
    this.angleRightLeft = angleRightLeft;
    this.angleUpDown = angleUpDown;
}

function Tail(nameObj, vector) {
    'use strict';
    var name = nameObj;
    var lar = [];
    
    this.location = typeof vector !== 'undefined'
        ? new THREE.Vector3(vector.x, vector.y, vector.z)
        : new THREE.Vector3();
    this.angleRightLeft = 0.0;
    this.angleUpDown = 0.0;

    this.canMove = false;


    this.Move = function (angleRightLeft, angleUpDown) {
        angleUpDown = typeof angleUpDown !== 'undefined' ? angleUpDown : 0.0;
        this.angleRightLeft = angleRightLeft;
        this.angleUpDown = angleUpDown;

        var x = Math.sin(angleRightLeft) * Math.abs(Math.cos(angleUpDown));
        var y = Math.sin(angleUpDown);
        var z = Math.cos(angleRightLeft) * Math.abs(Math.cos(angleUpDown));

        this.location.x += x;
        this.location.y += y;
        this.location.z += z;


        return new THREE.Vector3(x, y, z);
    };
    this.PushLocationAndRotation = function (location, angleRightLeft, angleUpDown) {
        angleUpDown = typeof angleUpDown !== 'undefined' ? angleUpDown : 0.0;
        location = new THREE.Vector3(location.x, location.y, location.z);
        lar.push(new LocationAndRotation(location, angleRightLeft, angleUpDown));
    };
    this.PopLocationAndRotation = function () {
        var temp = lar.shift();
        this.location = temp.location;
        this.angleRightLeft = temp.angleRightLeft;
        this.angleUpDown = temp.angleUpDown;
    };
    this.Distance = function (point) {
        return Math.sqrt((this.location.x - point.x) * (this.location.x - point.x) + (this.location.y - point.y) * (this.location.y - point.y) + (this.location.z - point.z) * (this.location.z - point.z));
    };
    this.DistanceX = function (x) {
        return Math.sqrt((this.location.x - x) * (this.location.x - x));
    };
    this.DistanceY = function (y) {
        return Math.sqrt((this.location.y - y) * (this.location.y - y));
    };
    this.DistanceZ = function (z) {
        return Math.sqrt((this.location.z - z) * (this.location.z - z));
    };
    
    this.getName = function () {
        return name;
    };
}

