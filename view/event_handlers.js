document.getElementById("resize_button").addEventListener("click", update_size, false)
document.getElementById('field-canvas').addEventListener("mousedown", on_touch_on_canvas, false)
document.getElementById("decompose_button").addEventListener("click", decompose, false)
document.getElementById("find_path_button").addEventListener("click", find_path, false)
document.getElementById("execute_all_button").addEventListener("click", execute_all, false)
document.getElementById("add_barrier_inputs").addEventListener("click", add_barrier_input, false)
document.getElementById("add_place_inputs").addEventListener("click", add_place_input, false)
document.getElementById("update_data_button").addEventListener("click", load_data_from_ui, false)
document.getElementById("import_data_button").addEventListener("change", import_data_from_file, false)
document.getElementById("export_data_button").addEventListener("click", export_data_from_file, false)


for (let radio_button of document.getElementsByClassName("auto-render-click")) {
    radio_button.addEventListener('click', render);
}

for (let radio_button of document.getElementsByClassName("auto-render-change")) {
    radio_button.addEventListener('change', render);
}

for (let radio_button of document.querySelectorAll('input[type=radio][name="mouse_mode"]')) {
    radio_button.addEventListener('change', update_mouse_mode);
}
