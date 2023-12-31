document.addEventListener("DOMContentLoaded", function () {
  const addTaskForm = document.getElementById("addTaskForm");
  const taskContainer = document.getElementById("taskContainer");
  const addTaskModal = new bootstrap.Modal(
    document.getElementById("addTaskModal")
  );

  function generateRandomThreeDigitNumber() {
    return Math.floor(100 + Math.random() * 900);
  }

  function saveTasksToLocalStorage() {
    const tasks = Array.from(taskContainer.children).map((taskCard) => {
      const taskId = taskCard.dataset.taskId;
      const taskName = taskCard.querySelector("#TaskName").innerText;
      const taskDescription = taskCard.querySelector("#TaskDesc").innerText;
      const totalHours = taskCard.querySelector("#TotalHour").innerText;
      const remainingSeconds = taskCard.dataset.remainingSeconds || 0;
      const paused = taskCard.dataset.paused || "false";

      return {
        taskId,
        taskName,
        taskDescription,
        totalHours,
        remainingSeconds,
        paused,
      };
    });

    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  function loadTasksFromLocalStorage() {
    const storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];

    storedTasks.forEach((task) => {
      const newTaskCard = createTaskCard(task);
      taskContainer.appendChild(newTaskCard);

      if (task.paused === "false") {
        startTask(newTaskCard, parseInt(task.totalHours) * 3600);
      }
    });
  }

  function createTaskCard(task) {
    const newTaskCard = document.createElement("div");
    newTaskCard.dataset.taskId = task.taskId;
    newTaskCard.classList.add(
      "card",
      "shadow",
      "bg-body",
      "rounded",
      "mb-3",
      "NewCard"
    );

    newTaskCard.innerHTML = `
      <div class="card-body">
        <h5 class="card-title fw-bold" id="TaskName">${task.taskName}</h5>
        <h2 class="time">00:00</h2>
        <p class="card-text" id="TaskDesc">${task.taskDescription}</p>
        <a href="#" class="btn btn-primary st-btn">START</a>
        <a href="#" class="btn btn-primary op-btn">STOP</a>
        <div class="row mt-5">
          <div class="col-2 fw-bold">
            <i class="bi bi-stopwatch"></i> Total Hours:
            <p class="d-inline" id="TotalHour">${task.totalHours}</p>
          </div>
          <div class="col">
            <div class="progress">
              <div class="progress-bar w-0" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
          </div>
        </div>
        <div class="row mt-5 text-end">
          <div class="col-8"></div>
          <div class="col-4">
            <a href="#" class="btn btn-primary st-btn" id="EditCard"><i class="bi bi-pencil-square"></i> EDIT</a>
            <a href="#" class="btn btn-primary op-btn" id="DeleteCard"><i class="bi bi-x-square"></i> DELETE</a>
          </div>
        </div>
      </div>
    `;

    const startButton = newTaskCard.querySelector(".st-btn");
    startButton.addEventListener("click", function () {
      toggleTimer(newTaskCard, parseInt(task.totalHours) * 3600);
    });

    const stopButton = newTaskCard.querySelector(".op-btn");
    stopButton.addEventListener("click", function () {
      stopTask(newTaskCard);
    });

    return newTaskCard;
  }

  function toggleTimer(taskCard, totalSeconds) {
    const isPaused = taskCard.dataset.paused === "true";

    if (isPaused) {
      startTask(taskCard, totalSeconds);
    } else {
      startTask(taskCard, totalSeconds);
      taskCard.dataset.paused = "false";
    }
    saveTasksToLocalStorage();
  }

  function startTask(taskCard, totalSeconds) {
    let remainingSeconds =
      parseInt(taskCard.dataset.remainingSeconds) || totalSeconds;
    const progress = taskCard.querySelector(".progress-bar");

    const intervalId = setInterval(function () {
      if (remainingSeconds <= 0) {
        clearInterval(intervalId);
        alert("Task completed!");
      } else {
        const progressPercentage =
          ((totalSeconds - remainingSeconds) / totalSeconds) * 100;
        progress.style.width = `${progressPercentage}%`;
        remainingSeconds--;
        updateTimer(taskCard, remainingSeconds);
      }
    }, 1000);

    taskCard.dataset.intervalId = intervalId;
    taskCard.dataset.remainingSeconds = remainingSeconds;
    saveTasksToLocalStorage();
  }

  function updateTimer(taskCard, remainingSeconds) {
    const timerDisplay = taskCard.querySelector(".time");
    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;
    timerDisplay.innerText = `${padZero(hours)}:${padZero(minutes)}:${padZero(
      seconds
    )}`;
  }

  function stopTask(taskCard) {
    const intervalId = taskCard.dataset.intervalId;
    let remainingSeconds = parseInt(taskCard.dataset.remainingSeconds) || 0;

    if (intervalId) {
      clearInterval(intervalId);
      taskCard.dataset.intervalId = null;

      if (taskCard.dataset.paused !== "true") {
        taskCard.dataset.remainingSeconds = remainingSeconds;
      }
    }

    taskCard.dataset.paused =
      taskCard.dataset.paused === "true" ? "false" : "true";

    console.log(
      "Task stopped/paused for:",
      taskCard.querySelector(".card-title").innerText
    );
    saveTasksToLocalStorage();
  }

  function padZero(num) {
    return num < 10 ? `0${num}` : num;
  }

  taskContainer.addEventListener("click", function (event) {
    const deleteButton = event.target.closest("#DeleteCard");

    if (deleteButton) {
      const taskCard = deleteButton.closest(".card");
      taskContainer.removeChild(taskCard);
      saveTasksToLocalStorage();
    }
  });

  taskContainer.addEventListener("click", function (event) {
    const editButton = event.target.closest("#EditCard");

    if (editButton) {
      const taskCard = editButton.closest(".card");
      const taskId = taskCard.dataset.taskId;
      const taskName = taskCard.querySelector("#TaskName").innerText;
      const taskDescription = taskCard.querySelector("#TaskDesc").innerText;
      const totalHours = taskCard.querySelector("#TotalHour").innerText;

      document.getElementById("editTaskId").value = taskId;
      document.getElementById("editTaskName").value = taskName;
      document.getElementById("editTaskDescription").value = taskDescription;
      document.getElementById("editTotalHours").value = totalHours;

      const editTaskModal = new bootstrap.Modal(
        document.getElementById("editTaskModal")
      );
      editTaskModal.show();
    }
  });

  const editTaskForm = document.getElementById("editTaskForm");
  editTaskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const taskId = document.getElementById("editTaskId").value;
    const editedTaskName = document.getElementById("editTaskName").value;
    const editedTaskDescription = document.getElementById(
      "editTaskDescription"
    ).value;
    const editedTotalHours = document.getElementById("editTotalHours").value;

    const taskCard = document.querySelector(`.card[data-task-id="${taskId}"]`);
    taskCard.querySelector("#TaskName").innerText = editedTaskName;
    taskCard.querySelector("#TaskDesc").innerText = editedTaskDescription;
    taskCard.querySelector("#TotalHour").innerText = editedTotalHours;

    saveTasksToLocalStorage();
  });

  addTaskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const taskId = generateRandomThreeDigitNumber();
    const taskName = document.getElementById("taskName").value;
    const taskDescription = document.getElementById("taskDescription").value;
    const totalHoursInput = document.getElementById("totalHours").value;

    const totalHours = parseInt(totalHoursInput, 10);
    if (isNaN(totalHours) || totalHours <= 0) {
      alert("Please enter a valid positive number for Total Hours.");
      return;
    }

    const newTaskCard = createTaskCard({
      taskId,
      taskName,
      taskDescription,
      totalHours,
    });

    taskContainer.appendChild(newTaskCard);
    addTaskForm.reset();
    addTaskModal.hide();
    saveTasksToLocalStorage();
  });

  loadTasksFromLocalStorage();
  document.getElementById("login-btn").addEventListener("click", () => {
    alert("comming soon...");
  });
  document.getElementById("signup-btn").addEventListener("click", () => {
    alert("comming soon...");
  });
});
