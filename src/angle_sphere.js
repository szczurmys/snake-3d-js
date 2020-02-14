function AngleSphere() {
    this.upDown = 0.0;
    this.leftRight = 0.0;
    this.ToString = function () {
        return "UpDown=" + this.upDown +
                ";LeftRight=" + this.leftRight + ";";
    };
}