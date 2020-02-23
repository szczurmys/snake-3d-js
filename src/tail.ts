import { Vector3 } from 'three';


class LocationAndRotation {
    public constructor(public location: Vector3, public angleRightLeft: number, public angleUpDown: number) {
    }
}

export default class Tail {

    public location: Vector3;
    public angleRightLeft: number = 0.0;
    public angleUpDown: number = 0.0;
    public canMove: boolean = false;
    

    private lar: LocationAndRotation[] = []; 

    public constructor(public readonly name: string, vector?: Vector3) {
        this.location = vector || new Vector3();
    }

    public move(angleRightLeft: number, angleUpDown: number): Vector3 {
        angleUpDown = typeof angleUpDown !== 'undefined' ? angleUpDown : 0.0;
        this.angleRightLeft = angleRightLeft;
        this.angleUpDown = angleUpDown;

        var x = Math.sin(angleRightLeft) * Math.abs(Math.cos(angleUpDown));
        var y = Math.sin(angleUpDown);
        var z = Math.cos(angleRightLeft) * Math.abs(Math.cos(angleUpDown));

        this.location.x += x;
        this.location.y += y;
        this.location.z += z;


        return new Vector3(x, y, z);
    };
    public pushLocationAndRotation(location: Vector3, angleRightLeft: number, angleUpDown: number): void {
        angleUpDown = typeof angleUpDown !== 'undefined' ? angleUpDown : 0.0;
        location = new Vector3(location.x, location.y, location.z);
        this.lar.push(new LocationAndRotation(location, angleRightLeft, angleUpDown));
    };
    public popLocationAndRotation(): void {
        var temp = this.lar.shift();
        this.location = temp.location;
        this.angleRightLeft = temp.angleRightLeft;
        this.angleUpDown = temp.angleUpDown;
    };
    public distance(point: Vector3): number {
        return Math.sqrt((this.location.x - point.x) * (this.location.x - point.x) + (this.location.y - point.y) * (this.location.y - point.y) + (this.location.z - point.z) * (this.location.z - point.z));
    };
    public distanceX(x: number): number {
        return Math.sqrt((this.location.x - x) * (this.location.x - x));
    };
    public distanceY(y: number): number {
        return Math.sqrt((this.location.y - y) * (this.location.y - y));
    };
    public distanceZ(z: number): number {
        return Math.sqrt((this.location.z - z) * (this.location.z - z));
    };
    
    public getName(): string {
        return name;
    };
}