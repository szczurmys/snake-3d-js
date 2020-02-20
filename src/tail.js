import * as THREE from 'three';

export default function Tail(nameObj, tailRadius, vector) {
    'use strict';
    var name = nameObj;    
    this.location = typeof vector !== 'undefined'
        ? vector.clone()
        : new THREE.Vector3();
    this.tailRadius = tailRadius;

    var nextLocations = [];

    this.CanMove = function(previousTail) {
        return this.CanRotate(previousTail) && this.Distance(previousTail.location) >= (this.tailRadius + previousTail.tailRadius);
    };

    this.CanRotate = function(previousTail) {
        return previousTail.location.x != this.location.x 
        || previousTail.location.y != this.location.y 
        || previousTail.location.z != this.location.z;
    };

    this.CalculateMoveForward = function (angleRightLeft, angleUpDown, accelerate = 1) {
        angleUpDown = typeof angleUpDown !== 'undefined' ? angleUpDown : 0.0;

        //console.log("MoveForward - " - angleRightLeft, " - ", angleUpDown , " - ", accelerate);

        var x = Math.sin(angleRightLeft) * Math.abs(Math.cos(angleUpDown)) * accelerate;
        var y = Math.sin(angleUpDown);
        var z = Math.cos(angleRightLeft) * Math.abs(Math.cos(angleUpDown)) * accelerate;

        return new THREE.Vector3(x, y, z);
    };

    this.MoveForward = function (angleRightLeft, angleUpDown, accelerate = 1) {
        this.location.add(this.CalculateMoveForward(angleRightLeft, angleUpDown, accelerate));
    };

    this.FollowPoint = function (previousTail) {
        if(!this.location.equals(previousTail) && (nextLocations.length == 0 || !nextLocations[nextLocations.length-1].equals(previousTail))) {
            nextLocations.push(previousTail.location.clone());
            var expectedDistance = this.tailRadius + previousTail.tailRadius;

            var distance = 0.0;
            var selectedIndex = 0;
            for(var i = nextLocations.length - 2; i >= 0; i--) {
                distance += nextLocations[i].distanceTo(nextLocations[i + 1]);
                selectedIndex = i;
                if(distance >= expectedDistance) {
                    break;
                }
            }
            if(distance == expectedDistance) {
                this.location.copy(nextLocations[selectedIndex]);
                nextLocations = nextLocations.slice(selectedIndex, nextLocations.length);
            } else if(distance >= expectedDistance) {
                this.location.copy(getPointInBetweenByLength(previousTail.location, nextLocations[selectedIndex], previousTail.tailRadius + this.tailRadius));
                nextLocations = nextLocations.slice(selectedIndex, nextLocations.length);
            }
        }
    };

    this.Distance = function (point) {
        return this.location.distanceTo(point);
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

