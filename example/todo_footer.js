import { html, component, props } from "../src/index.js";

export const TodoFooter = component({
  machine: props({
    show: "all",
    numLeft: 0,
    onClear: () => {},
    onFilterClicked: () => {}
  }),
  render: ({ state }) => {
    const { show, numLeft, onFilterClicked } = state.context.props;

    const getLeft = () => {
      if (numLeft === 1) {
        return "1 item left";
      } else {
        return `${numLeft} items left`;
      }
    };

    return html`
      <footer class="footer">
        <span class="todo-count">${getLeft()}</span>
        <ul class="filters">
          <li>
            <a
              href="#/"
              class=${show === "all" && "selected"}
              onclick=${() => onFilterClicked("ALL")}
              >All</a
            >
          </li>
          <li>
            <a
              href="#/active"
              class=${show === "active" && "selected"}
              onclick=${() => onFilterClicked("ACTIVE")}
              >Active</a
            >
          </li>
          <li>
            <a
              href="#/completed"
              class=${show === "completed" && "selected"}
              onclick=${() => onFilterClicked("COMPLETED")}
              >Completed</a
            >
          </li>
        </ul>
        <button class="clear-completed" onclick=${() => onClear()}>
          Clear completed
        </button>
      </footer>
    `;
  }
});
