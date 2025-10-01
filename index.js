function showTodoList(todos) {
    if (todos.length == 0) {
        const p = document.createElement("p")
        p.innerText = "Nothing.";
        return p
    }
    const todoList = document.createElement("ul")
    todos.forEach(todo => {
        const item = document.createElement("li")
        item.setAttribute("hk-post", `http://localhost:5000/api/todo/delete`)
        item.innerText = todo
        todoList.appendChild(item)
    });
    return todoList
}