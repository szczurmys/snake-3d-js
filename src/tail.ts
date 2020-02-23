import { Vector3 } from 'three';

export default class Tail {
    public location: Vector3;


    private lar: {location: Vector3, angleRightLeft: number, angleUpDown: number}[] = [];

    public constructor(public readonly name: string, public readonly tailRadius: number, vector?: Vector3) {
        this.location = vector && vector.clone() || new Vector3();
    }

    public canMove(previousTail) {
        return this.canRotate(previousTail) && this.distance(previousTail.location) >= (this.tailRadius + previousTail.tailRadius);
    };

    public canRotate(previousTail: Tail) {
        return !previousTail.location.equals(this.location);
    };

    public moveForward(angleRightLeft: number, angleUpDown: number, accelerate: number = 1) {
        angleUpDown = typeof angleUpDown !== 'undefined' ? angleUpDown : 0.0;

        const x = Math.sin(angleRightLeft) * Math.abs(Math.cos(angleUpDown)) * accelerate;
        const y = Math.sin(angleUpDown) * accelerate;
        const z = Math.cos(angleRightLeft) * Math.abs(Math.cos(angleUpDown)) * accelerate;

        this.location.x += x;
        this.location.y += y;
        this.location.z += z;

        return new Vector3(x, y, z);
    };

    public followPoint(previousTail: Tail) {
        this.location.copy(this.getPointInBetweenByLength(previousTail.location, this.location, previousTail.tailRadius + this.tailRadius));
    };

    public distance(point: Vector3): number {
        return this.location.distanceTo(point);
    }

    public distanceX(x: number): number {
        return Math.sqrt((this.location.x - x) * (this.location.x - x));
    }

    public distanceY(y: number): number {
        return Math.sqrt((this.location.y - y) * (this.location.y - y));
    }

    public distanceZ(z: number): number {
        return Math.sqrt((this.location.z - z) * (this.location.z - z));
    }

    public getName(): string {
        return this.name;
    }

    private getPointInBetweenByLength(start: Vector3, end: Vector3, length: number) {
        const dir = end.clone().sub(start).normalize().multiplyScalar(length);
        return start.clone().add(dir);
    }
}