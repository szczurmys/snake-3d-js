export default class AngleSphere {
    public upDown: number = 0.0;
    public leftRight: number = 0.0;
    public toString(): string {
        return "UpDown=" + this.upDown +
                ";LeftRight=" + this.leftRight + ";";
    };
}