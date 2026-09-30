const STORAGE_KEY = "offline-todo-list";

const form = document.querySelector("#todo-form");
const input = document.querySelector("#todo-input");
const list = document.querySelector("#todo-list");
const emptyState = document.querySelector("#empty-state");
const remainingCount = document.querySelector("#remaining-count");
const storageNotice = document.querySelector("#storage-notice");

let todos = loadTodos();

function showStorageNotice(message) {
  storageNotice.textContent = message;
  storageNotice.hidden = !message;
}

function loadTodos() {
  try {
    const savedTodos = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(savedTodos)
      ? savedTodos.filter((todo) => todo && typeof todo.text === "string")
      : [];
  } catch {
    showStorageNotice("無法讀取本機資料，請確認瀏覽器允許使用本機儲存。資料可能不會保留。");
    return [];
  }
}

function saveTodos() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    showStorageNotice("");
  } catch {
    showStorageNotice("無法儲存資料。請確認未使用無痕模式或封鎖本機儲存，並在同一個瀏覽器與檔案位置開啟。");
  }
}

function renderTodos() {
  list.replaceChildren();

  todos.forEach((todo) => {
    const item = document.createElement("li");
    item.className = "todo-item";
    if (todo.completed) item.classList.add("is-completed");

    const checkbox = document.createElement("input");
    checkbox.className = "todo-checkbox";
    checkbox.type = "checkbox";
    checkbox.checked = Boolean(todo.completed);
    checkbox.setAttribute("aria-label", `標記「${todo.text}」為${todo.completed ? "未完成" : "已完成"}`);
    checkbox.addEventListener("change", () => {
      todo.completed = checkbox.checked;
      saveTodos();
      renderTodos();
    });

    const text = document.createElement("span");
    text.className = "todo-text";
    text.textContent = todo.text;

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.type = "button";
    deleteButton.textContent = "刪除";
    deleteButton.setAttribute("aria-label", `刪除「${todo.text}」`);
    deleteButton.addEventListener("click", () => {
      todos = todos.filter((itemTodo) => itemTodo.id !== todo.id);
      saveTodos();
      renderTodos();
    });

    item.append(checkbox, text, deleteButton);
    list.append(item);
  });

  const remaining = todos.filter((todo) => !todo.completed).length;
  remainingCount.textContent = `未完成: ${remaining} 項`;
  emptyState.hidden = todos.length > 0;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  todos.push({ id: crypto.randomUUID(), text, completed: false });
  saveTodos();
  renderTodos();
  form.reset();
  input.focus();
});

renderTodos();