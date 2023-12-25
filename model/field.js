class Field {
    constructor(height, width) {
        this.change_size(height, width);
        this.clear();
    }

    change_size(height, width) {
        this.height = height;
        this.width = width;
        this.decomposed_field = null;
    }

    clear() {
        this.robot = null;
        this.places = [];
        this.barriers = [];

        this.decomposed_field = null;
    }

    is_decomposed() {
        return this.decomposed_field != null;
    }

    place_robot(x, y) {
        let point = new Point(x, y);
        if (this.point_is_free(point)) {
            this.robot = new Point(x, y);
            return true;
        }
        return false;
    }

    add_barrier(diagonal_point_1, diagonal_point_2) {
        let barrier = new Rectangle(diagonal_point_1, diagonal_point_2);
        this.barriers.push(barrier);
        this.decomposed_field = null;
    }

    add_place(x, y) {
        let new_place = new Point(x, y);
        if (this.point_is_free(new_place)) {
            this.places.push(new_place);
            return true;
        }
        return false;
    }

    is_valid_point(point) {
        return (point.x >= 0) && (point.x < this.width) && (point.y >= 0) && (point.y < this.height);
    }

    point_is_free(point) {
        if (!this.is_valid_point(point)) {
            return false;
        }

        for (let item of this.barriers) {
            if (this.is_point_in_rectangle(point, item)) {
                return false;
            }
        }
        return true;
    }


    is_point_in_rectangle(point, rectangle) {
        const [x, y] = point.coordinates;

        const [x1, y1, x2, y2, x3, y3, x4, y4] = rectangle.values();

        // Проверяем, является ли точка внутри четырехугольника
        const d1 = this.orientation(x1, y1, x2, y2, x, y);
        const d2 = this.orientation(x2, y2, x3, y3, x, y);
        const d3 = this.orientation(x3, y3, x4, y4, x, y);
        const d4 = this.orientation(x4, y4, x1, y1, x, y);

        const has_neg = (d1 < 0) || (d2 < 0) || (d3 < 0) || (d4 < 0);
        const has_pos = (d1 > 0) || (d2 > 0) || (d3 > 0) || (d4 > 0);

        return !(has_neg && has_pos);
    }

// Вспомогательная функция для определения ориентации точек
    orientation(x1, y1, x2, y2, x, y) { //ToDo Че ты такое
        return (y2 - y1) * (x - x2) - (x2 - x1) * (y - y2);
    }

    is_point_on_rectangle(point, rectangle) {
        const [x, y] = point.coordinates;

        const [x1, y1, x2, y2, x3, y3, x4, y4] = rectangle.values();

        // Проверяем, лежит ли точка на одной из сторон прямоугольника
        const onSide1 = this.is_point_on_line(point, new Point(x1, y1), new Point(x2, y2));
        const onSide2 = this.is_point_on_line(point, new Point(x2, y2), new Point(x3, y3));
        const onSide3 = this.is_point_on_line(point, new Point(x3, y3), new Point(x4, y4));
        const onSide4 = this.is_point_on_line(point, new Point(x4, y4), new Point(x1, y1));

        return onSide1 || onSide2 || onSide3 || onSide4;
    }

    is_point_on_line(point, line_point_1, line_point_2) {
        const [x, y] = point.coordinates;
        const [x1, y1] = line_point_1.coordinates;
        const [x2, y2] = line_point_2.coordinates;

        // Проверяем, лежит ли точка на отрезке между line_point_1 и line_point_2
        const onLineSegment = (
            (x >= Math.min(x1, x2) && x <= Math.max(x1, x2)) &&
            (y >= Math.min(y1, y2) && y <= Math.max(y1, y2))
        );

        // Рассчитываем расстояние между точкой и отрезком
        const distance = Math.abs((y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1) /
            Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));

        // Проверяем условие, добавляя проверку на принадлежность границе с учетом погрешности
        return onLineSegment && distance < 1e-6;
    }


    decompose(cell_width, cell_height, use_all_algorithm = false) {
        let decomposed_field = new DecomposedField(this, cell_width, cell_height, use_all_algorithm)

        if (decomposed_field.composing_error_message) {
            return decomposed_field.composing_error_message
        }

        this.decomposed_field = decomposed_field
        return null
    }

}

