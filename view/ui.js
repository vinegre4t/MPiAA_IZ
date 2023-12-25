field = new Field(1000, 1000)
view = new FieldView("field-canvas", field)

mouse_mode = 0
temp_points = []
last_path = []

window.onbeforeunload = function() {
    return "Data will be lost if you leave the page, are you sure?";
};

new Sortable(document.getElementById("place_inputs"), {
    handle: '.handle',
    animation: 150
})

fill_cell_size_selects()
render()

function collect_data_from_input_group(input_group) {
    let values = []
    for (let input_element of input_group) {
        values.push(+input_element.value)
    }
    return values
}

function load_data_from_ui() {
    view.field.clear()

    let robot_x = document.getElementById("robot_x_input").value
    let robot_y = document.getElementById("robot_y_input").value
    view.field.place_robot(robot_x, robot_y)

    for (let barrier_input of document.querySelectorAll("#barrier_inputs>div")) {
        let values = collect_data_from_input_group(barrier_input.querySelectorAll("input[type=number]"))
        view.field.add_barrier(new Point(values[0], values[1]), new Point(values[2], values[3]), new Point(values[4], values[5]))
    }

    for (let place_input of document.querySelectorAll("#place_inputs>div")) {
        let values = collect_data_from_input_group(place_input.querySelectorAll("input[type=number]"))
        view.field.add_place(values[0], values[1])
    }

    render()
}

function import_data_from_file(event) {
    let input = event.target;

    let reader = new FileReader();
    reader.onload = function () {
        for (let barrier_input of document.querySelectorAll("#barrier_inputs>div")) {
            barrier_input.remove()
        }

        for (let place_input of document.querySelectorAll("#place_inputs>div")) {
            place_input.remove()
        }

        let text = reader.result
        let lines = text.split("\n")
        for (let line of lines) {
            let arguments = line.split(" ")
            let command = arguments.shift()
            if (command == "S") {
                let [height, width] = arguments.map((x) => +x)
                document.getElementById("width_input").value = width;
                document.getElementById("height_input").value = height;
            } else if (command == "R") {
                let [x, y] = arguments.map((x) => +x)
                document.getElementById("robot_x_input").value = x;
                document.getElementById("robot_y_input").value = y;
            } else if (command == "B") {
                add_barrier_input(arguments.map((x) => +x))
            } else if (command == "P") {
                add_place_input(arguments.map((x) => +x))
            }
        }
        load_data_from_ui()
    };
    reader.readAsText(input.files[0]);
}

function export_data_from_file() {
    let text = `S ${view.field.height} ${view.field.width}\n`

    if (view.field.robot != null) {
        text += `R ${view.field.robot.x} ${view.field.robot.y}\n`
    }

    for (let place of view.field.places) {
        text += `P ${place.x} ${place.y}\n`
    }

    for (let barrier of view.field.barriers) {
        text += `B ${barrier.half_values().join(" ")}\n`
    }

    const link = document.createElement("a");
    const file = new Blob([text], {type: 'text/plain'});
    link.href = URL.createObjectURL(file);
    link.download = "robot.txt";
    link.click();
    URL.revokeObjectURL(link.href);
}

function render_image() {
    view.resize_canvas()

    if (get_setting("show_barriers")) view.draw_barriers()

    if (get_setting("show_robot")) view.draw_robot()

    if (get_setting("show_places")) view.draw_places()

    if (view.field.is_decomposed()) {
        view.draw_grid_and_areas(get_setting("show_grid"), get_setting("show_areas"))
    } else if (get_setting("show_grid")) {
        view.draw_grid(get_cell_height(), get_cell_width())
    }

    if (get_setting("show_path") && view.field.is_decomposed()) view.draw_path(last_path)

    if (temp_points.length == 1) {
        view.draw_point(temp_points[0], view.get_point_radius(0.5), "black", "black")
    }

    if (get_setting("show_new_places")) view.draw_new_places()
}

function render() {
    if (view.field.decomposed_field == null) {
        document.getElementById("find_path_button").disabled = true
    } else {
        document.getElementById("find_path_button").disabled = false
    }

    render_image()

}

function get_setting(setting_name) {
    return document.getElementById(setting_name).checked
}

function decompose() {
    let result = field.decompose(get_cell_width(), get_cell_height())

    if (result != null) {
        alert("Ошибка декомпозиции - " + result)
    }

    last_path = []
}

function find_path() {
    if (view.field.robot == null) {
        alert("Нельзя построить путь, если нет робота")
        return
    }

    if (view.field.places.length == 0) {
        alert("Нельзя построить путь, если нет мест")
        return
    }

    if (view.field.decomposed_field == null) {
        alert("Нельзя построить маршрут, если поле не декомпозировано")
        return
    }

    let point_order = document.getElementById("point-order").value

    path = view.field.decomposed_field.find_path(point_order)
    if (path == null) {
        alert("Не удалось найти путь")
    } else {
        last_path = path
    }
}

function execute_all() {
    decompose()
    find_path()
}

function get_cell_height() {
    return document.getElementById("select_cell_height").value
}

function get_cell_width() {
    return document.getElementById("select_cell_width").value
}


function on_touch_on_canvas(event) {
    let rect = event.target.getBoundingClientRect()
    let raw_x = event.clientX - rect.left
    let raw_y = event.clientY - rect.top

    let x = Math.round((event.target.height / event.target.clientHeight) * raw_x)
    let y = Math.round((event.target.width / event.target.clientWidth) * raw_y)

    let point = new Point(x, y)
    if (mouse_mode == 0 && event.which == 3) {
        let barrier_text = "с барьерами не пересекается"
        for (let barrier of view.field.barriers) {
            if (view.field.is_point_in_triangle(point, barrier) || this.is_point_on_triangle(point, barrier)) {
                barrier_text = `точка лежит в треугольнике `
            }
        }
        alert("Точка", point, barrier_text)
    } else if (mouse_mode == 1) {
        document.getElementById("robot_x_input").value = x
        document.getElementById("robot_y_input").value = y
        field.place_robot(x, y)
    } else if (mouse_mode == 2) {
        add_place_input([x, y])
        field.add_place(x, y)
    } else if (mouse_mode == 3) {
        temp_points.push(point)

        if (temp_points.length >= 2) {
            let values = []
            for (let point of temp_points) {
                values.push(point.x)
                values.push(point.y)
            }
            add_barrier_input(values)
            field.add_barrier(temp_points[0], temp_points[1])
            temp_points = []
        }

    }

    render()
}

function add_barrier_input(values) {
    if (values instanceof Event) {
        values = []
    }

    let main_div = document.createElement("div")
    main_div.classList.add("input-group", "mb-3")

    let indexes = ["₁", "₂"]
    let variables = ["x", "y"]

    for (let i in indexes) {
        for (let v in variables) {
            let number_input = document.createElement("input")
            number_input.setAttribute("type", "number")
            number_input.setAttribute("placeholder", variables[v] + indexes[i])
            number_input.classList.add("form-control", "remove_arrows")
            if (v == 1 && i < 2) {
                number_input.classList.add("border-end", "border-3")
            }
            number_input.value = values.shift()
            main_div.appendChild(number_input)
        }
    }

    let delete_button = document.createElement("span")
    delete_button.classList.add("btn", "btn-outline-danger")
    delete_button.appendChild(document.createTextNode("X"))
    delete_button.addEventListener("click", delete_input, false)
    main_div.appendChild(delete_button)

    document.getElementById("barrier_inputs").appendChild(main_div)
}

function add_place_input(values) {
    main_div = document.createElement("div")
    main_div.classList.add("input-group", "mb-3")

    handler_span = document.createElement("span")
    handler_span.classList.add("input-group-text", "user-select-none", "handle")
    handler_span.appendChild(document.createTextNode("≡"))
    main_div.appendChild(handler_span)

    let variables = ["x", "y"]

    for (let v in variables) {
        number_input = document.createElement("input")
        number_input.setAttribute("type", "number")
        number_input.setAttribute("placeholder", variables[v])
        number_input.classList.add("form-control", "remove_arrows")
        number_input.value = values[v]
        main_div.appendChild(number_input)
    }

    delete_button = document.createElement("button")
    delete_button.classList.add("btn", "btn-outline-danger")
    delete_button.appendChild(document.createTextNode("X"))
    delete_button.addEventListener("click", delete_input, false)
    main_div.appendChild(delete_button)

    document.getElementById("place_inputs").appendChild(main_div)
}

function delete_input(event) {
    event.target.parentNode.remove()
}

function update_mouse_mode(event) {
    mouse_mode = event.target.value
    if (mouse_mode < 3) {
        temp_points = []
        render_image()
    }
}

function fill_select(id, data, selected = -1) {
    let element = document.getElementById(id)

    while (element.options.length > 0) {
        element.remove(0);
    }

    for (let item of data) {
        let new_option = new Option(item, item)
        element.add(new_option)
    }

    if (selected != -1) {
        element.value = selected
    }
}

function fill_cell_size_selects() {
    let cell_width_options = [1].concat(get_divisors(field.width, true))
    let cell_height_options = [1].concat(get_divisors(field.height, true))

    fill_select("select_cell_width", cell_width_options, cell_width_options[Math.floor(cell_width_options.length / 2)])
    fill_select("select_cell_height", cell_height_options, cell_height_options[Math.floor(cell_height_options.length / 2)])
}

function update_size() {
    let height = document.getElementById("height_input").value
    let width = document.getElementById("width_input").value

    field.change_size(height, width)

    fill_cell_size_selects()
}