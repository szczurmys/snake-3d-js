export default class SelectedDirection {
    public up: boolean = false;
    public down: boolean = false;
    public left: boolean = false;
    public right: boolean = false;
    public accRightLeft: boolean = false;
    public accUpDown: boolean = false;
    public alt: boolean = false;

    public toString(): string {
        return "Up=" + this.up +
                ";Down=" + this.down +
                ";Left=" + this.left +
                ";Right=" + this.right +
                ";accRightLeft=" + this.accRightLeft +
                ";accUpDown=" + this.accUpDown + ";";
    };
}