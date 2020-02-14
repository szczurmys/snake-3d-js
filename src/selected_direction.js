function SelectedDirection() {
    this.up = false;
    this.down = false;
    this.left = false;
    this.right = false;
    this.accRightLeft = false;
    this.accUpDown = false;
    this.alt = false;
    this.ToString = function () {
        return "Up=" + this.up +
                ";Down=" + this.down +
                ";Left=" + this.left +
                ";Right=" + this.right +
                ";accRightLeft=" + this.accRightLeft +
                ";accUpDown=" + this.accUpDown + ";";
    };
}