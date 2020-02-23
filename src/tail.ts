import { Vector3 } from 'three';

export default class Tail {
    public location: Vector3;

    private nextLocations: Vector3[] = [];

    public constructor(public readonly name: string, public readonly tailRadius: number, vector?: Vector3) {
        this.location = vector && vector.clone() || new Vector3();
    }

    public canMove(previousTail) {
        return this.canRotate(previousTail) && this.distance(previousTail.location) >= (this.tailRadius + previousTail.tailRadius);
    }

    public canRotate(previousTail: Tail) {
        return !previousTail.location.equals(this.location);
    }

    public calculateMoveForward(angleRightLeft: number, angleUpDown: number, accelerate: number = 1) {
        angleUpDown = typeof angleUpDown !== 'undefined' ? angleUpDown : 0.0;

        const x = Math.sin(angleRightLeft) * Math.abs(Math.cos(angleUpDown)) * accelerate;
        const y = Math.sin(angleUpDown);
        const z = Math.cos(angleRightLeft) * Math.abs(Math.cos(angleUpDown)) * accelerate;

        return new Vector3(x, y, z);
    }

    public moveForward(angleRightLeft: number, angleUpDown: number, accelerate: number = 1) {
        this.location.add(this.calculateMoveForward(angleRightLeft, angleUpDown, accelerate));
    }

    public followPoint(previousTail: Tail) {
        if(!this.location.equals(previousTail.location) && (this.nextLocations.length === 0 || !this.nextLocations[this.nextLocations.length-1].equals(previousTail.location))) {
            this.nextLocations.push(previousTail.location.clone());
            const expectedDistance: number = this.tailRadius + previousTail.tailRadius;

            let distance: number = 0.0;
            let selectedIndex: number = 0;
            for(let i = this.nextLocations.length - 2; i >= 0; i--) {
                distance += this.nextLocations[i].distanceTo(this.nextLocations[i + 1]);
                selectedIndex = i;
                if(distance >= expectedDistance) {
                    break;
                }
            }
            if(distance === expectedDistance) {
                this.location.copy(this.nextLocations[selectedIndex]);
                this.nextLocations = this.nextLocations.slice(selectedIndex, this.nextLocations.length);
            } else if(distance >= expectedDistance) {
                this.location.copy(this.getPointInBetweenByLength(previousTail.location, this.nextLocations[selectedIndex], previousTail.tailRadius + this.tailRadius));
                this.nextLocations = this.nextLocations.slice(selectedIndex, this.nextLocations.length);
            }
        }
    }

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