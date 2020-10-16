import { html, render } from "../src/index.js";
import { TodoList } from "./todo_list.js";

render(
  document.getElementById("todo-app"),
  html`
    <${TodoList} />
  `
);
