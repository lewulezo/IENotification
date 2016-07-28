export default class Position {
    x: number;
    y: number;
    w: number;
    h: number;
    constructor({x, y, w, h}: {
        x?: number;
        y?: number;
        w?: number;
        h?: number;
    });
    equals(pos: Position): boolean;
}
