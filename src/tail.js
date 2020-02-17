import * as THREE from 'three';

export default function Tail(nameObj, tailRadius, vector) {
    'use strict';
    var name = nameObj;    
    this.location = typeof vector !== 'undefined'
        ? vector.clone()
        : new THREE.Vector3();
    this.tailRadius = tailRadius;

    this.CanMove = function(previousTail) {
        return this.CanRotate(previousTail) && this.Distance(previousTail.location) >= (this.tailRadius + previousTail.tailRadius);
    };

    this.CanRotate = function(previousTail) {
        return previousTail.location.x != this.location.x 
        || previousTail.location.y != this.location.y 
        || previousTail.location.z != this.location.z;
    };

    this.MoveForward = function (angleRightLeft, angleUpDown, accelerate = 1) {
        angleUpDown = typeof angleUpDown !== 'undefined' ? angleUpDown : 0.0;

        //console.log("MoveForward - " - angleRightLeft, " - ", angleUpDown , " - ", accelerate);

        var x = Math.sin(angleRightLeft) * Math.abs(Math.cos(angleUpDown)) * accelerate;
        var y = Math.sin(angleUpDown) * accelerate;
        var z = Math.cos(angleRightLeft) * Math.abs(Math.cos(angleUpDown)) * accelerate;

        this.location.x += x;
        this.location.y += y;
        this.location.z += z;

        return new THREE.Vector3(x, y, z);
    };

    this.FollowPoint = function (previousTail) {
        this.location.copy(getPointInBetweenByLength(previousTail.location, this.location, previousTail.tailRadius + this.tailRadius));
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

    function getPointInBetweenByLength(start, end, length) {
        var dir = end.clone().sub(start).normalize().multiplyScalar(length);
        return start.clone().add(dir);
    }
}

