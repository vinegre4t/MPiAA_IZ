class Point {
    constructor(x, y) {
        this.x = +x;
        this.y = +y;
        this.coordinates = [+x, +y];
    }

    equals(other) {
        return (this.x == other.x) && (this.y == other.y);
    }

    toString() {
        return `(${this.x}, ${this.y})`;
    }

    distance_to(other_point) {
        return Math.sqrt(Math.pow(this.x - other_point.x, 2) + Math.pow(this.y - other_point.y, 2));
    }
}

class Rectangle {
    constructor(diagonal_point_1, diagonal_point_2) {
        // Вычисляем оставшиеся две вершины прямоугольника
        const x3 = diagonal_point_1.x;
        const y3 = diagonal_point_2.y;
        const x4 = diagonal_point_2.x;
        const y4 = diagonal_point_1.y;

        // Инициализируем все четыре вершины
        this.point_1 = diagonal_point_1;
        this.point_2 = new Point(x4, y4);
        this.point_3 = diagonal_point_2;
        this.point_4 = new Point(x3, y3);
    }

    values() {
        return [
            this.point_1.x, this.point_1.y,
            this.point_2.x, this.point_2.y,
            this.point_3.x, this.point_3.y,
            this.point_4.x, this.point_4.y
        ];
    }

    half_values(){
        return [
            this.point_1.x, this.point_1.y,
            this.point_3.x, this.point_3.y,
        ];
    }
}

