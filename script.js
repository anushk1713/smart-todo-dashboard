document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("searchInput");
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let totalTasks = 0;
    let completedTasks = 0;

    const input = document.getElementById("taskInput");
    const button = document.getElementById("addBtn");
    const taskList = document.getElementById("taskList");

    searchInput.addEventListener("input", function () {
        renderTasks();
    });

    // =========================
    // MAIN CHART
    // =========================
    const ctx = document.getElementById("myChart");

    let myChart;

    if (ctx) {

        myChart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: ["Completed", "Remaining"],
                datasets: [{
                    label: "Tasks",
                    data: [0, 0],
                    backgroundColor: ["#4caf50", "#ff4d4d"],
                    borderRadius: 6,
                }],
            },
        });

    }


    // =========================
    // WEEKLY DATA
    // =========================
    let weeklyTotal = new Array(7).fill(0);
    let weeklyCompleted = new Array(7).fill(0);

    function getDayIndex() {
        let day = new Date().getDay();
        return day === 0 ? 6 : day - 1;
    }

    const weeklyCtx = document.getElementById("weeklyChart");

    let weeklyChart;

    if (weeklyCtx) {

        weeklyChart = new Chart(weeklyCtx, {
            type: "bar",
            data: {
                labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                datasets: [
                    {
                        label: "Total Tasks",
                        data: weeklyTotal,
                        backgroundColor: "#2196f3",
                    },
                    {
                        label: "Completed Tasks",
                        data: weeklyCompleted,
                        backgroundColor: "#4caf50",
                    },
                ],
            },
        });

    }

    // =========================
    // PERFORMANCE CHART
    // =========================
    const performanceCanvas = document.getElementById("performanceChart");

    let performanceChart;

    if (performanceCanvas) {

        performanceChart = new Chart(performanceCanvas, {
            type: "line",
            data: {
                labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                datasets: [
                    {
                        label: "Performance %",
                        data: new Array(7).fill(0),
                        borderColor: "#ff9800",
                        backgroundColor: "rgba(255,152,0,0.2)",
                        tension: 0.3,
                        fill: true,
                    },
                ],
            },
        });

    }

    // =========================
    // MONTHLY CHART
    // =========================
    const monthlyCanvas = document.getElementById("monthlyChart");

    let monthlyChart;

    if (monthlyCanvas) {

        monthlyChart = new Chart(monthlyCanvas, {
            type: "line",
            data: {
                labels: ["Week1", "Week2", "Week3", "Week4"],
                datasets: [
                    {
                        label: "Monthly Skill %",
                        data: [0, 0, 0, 0],
                        borderColor: "#9c27b0",
                        backgroundColor: "rgba(156,39,176,0.2)",
                        tension: 0.3,
                        fill: true,
                    },
                ],
            },
        });

    }

    // ✅ FIX: define monthlyWeeks
    let monthlyWeeks = {
        week1: [],
        week2: [],
        week3: [],
        week4: [],
    };

    // =========================
    function updatePerformanceChart() {
        let performance = weeklyTotal.map((total, i) => {
            if (total === 0) return 0;
            return Math.round((weeklyCompleted[i] / total) * 100);
        });

        performanceChart.data.datasets[0].data = performance;
        performanceChart.update();
    }

    function detectCategory(taskText) {

        let text = taskText.toLowerCase();

        const categories = {

            Coding: [
                "code",
                "coding",
                "leetcode",
                "programming",
                "debug",
                "project",
                "development",
                "hackathon",
                "algorithm",
                "java",
                "python",
                "react"
            ],

            Study: [
                "study",
                "exam",
                "assignment",
                "revision",
                "homework",
                "notes",
                "college",
                "class",
                "dbms",
                "os",
                "cn"
            ],

            Gym: [
                "gym",
                "workout",
                "exercise",
                "fitness",
                "pushup",
                "cardio",
                "running",
                "weight",
                "training"
            ],

            Personal: [
                "shopping",
                "family",
                "call",
                "meeting",
                "friend",
                "travel",
                "clean"
            ]
        };

        for (let category in categories) {

            for (let keyword of categories[category]) {

                if (text.includes(keyword)) {
                    return category;
                }

            }

        }

        return "Personal";
    }

    // =========================
    if (button) {


        button.addEventListener("click", function () {
            let val = input.value.trim();

            if (!val) return;

            let day = getDayIndex();

            let today = new Date().toISOString().split("T")[0];

            let taskObj = {
                text: val,
                completed: false,
                day: day,
                date: today,
                category: detectCategory(val),
            };

            tasks.push(taskObj);

            localStorage.setItem("tasks", JSON.stringify(tasks));

            renderTasks();
            updateAllCharts();
            renderHistory();

            input.value = "";
        });
    }

    // =========================
    function updateAllCharts() {
        const percent =
            totalTasks > 0
                ? Math.round((completedTasks / totalTasks) * 100)
                : 0;

        if (myChart) {

            myChart.data.datasets[0].data = [
                completedTasks,
                totalTasks - completedTasks,
            ];

            myChart.update();
        }

        if (weeklyChart) {

            weeklyChart.data.datasets[0].data = weeklyTotal;
            weeklyChart.data.datasets[1].data = weeklyCompleted;

            weeklyChart.update();
        }

        if (performanceChart) {
            updatePerformanceChart();
        }


        // MONTHLY CHART
        if (monthlyChart) {
            updateMonthlySkill();
        }

        const stats = document.getElementById("stats");

        if (stats) {
            stats.textContent =
                `${completedTasks} / ${totalTasks} completed`;
        }
        `${completedTasks} / ${totalTasks} completed`;

        const percentText = document.getElementById("percent");
        const progressFill = document.getElementById("progressFill");

        const sideTotal = document.getElementById("sideTotal");
        const sideDone = document.getElementById("sideDone");

        if (percentText) {
            percentText.textContent = percent + "%";
        }

        if (progressFill) {
            progressFill.style.width = percent + "%";
        }

        if (sideTotal) {
            sideTotal.textContent = totalTasks;
        }

        if (sideDone) {
            sideDone.textContent = completedTasks;
        }
        updateStreak();

        let study = tasks.filter(
            task => task.category === "Study"
        ).length;

        let coding = tasks.filter(
            task => task.category === "Coding"
        ).length;

        let gym = tasks.filter(
            task => task.category === "Gym"
        ).length;

        let personal = tasks.filter(
            task => task.category === "Personal"
        ).length;

        const studyCount =
            document.getElementById("studyCount");

        const codingCount =
            document.getElementById("codingCount");

        const gymCount =
            document.getElementById("gymCount");

        const personalCount =
            document.getElementById("personalCount");

        if (studyCount)
            studyCount.textContent = study + " Tasks";

        if (codingCount)
            codingCount.textContent = coding + " Tasks";

        if (gymCount)
            gymCount.textContent = gym + " Tasks";

        if (personalCount)
            personalCount.textContent = personal + " Tasks";
    }

    // =========================
    function updateMonthlySkill() {
        let allWeeks = weeklyTotal.map((t, i) =>
            t ? Math.round((weeklyCompleted[i] / t) * 100) : 0,
        );

        monthlyWeeks.week1 = allWeeks.slice(0, 2);
        monthlyWeeks.week2 = allWeeks.slice(2, 4);
        monthlyWeeks.week3 = allWeeks.slice(4, 6);
        monthlyWeeks.week4 = allWeeks.slice(6, 7);

        function avg(arr) {
            return arr.length
                ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length)
                : 0;
        }

        let monthData = [
            avg(monthlyWeeks.week1),
            avg(monthlyWeeks.week2),
            avg(monthlyWeeks.week3),
            avg(monthlyWeeks.week4),
        ];

        monthlyChart.data.datasets[0].data = monthData;
        monthlyChart.update();

        let overall = monthData.length
            ? monthData.reduce((a, b) => a + b, 0) / monthData.length
            : 0;

        const monthlySkill =
            document.getElementById("monthlySkill");

        if (monthlySkill) {

            monthlySkill.textContent =
                "Monthly Skill: " +
                Math.round(overall) + "%";
        }
        "Monthly Skill: " + Math.round(overall) + "%";

        let growth = monthData[3] - monthData[0];

        const monthlyGrowth =
            document.getElementById("monthlyGrowth");

        if (monthlyGrowth) {

            monthlyGrowth.textContent =
                "Growth: " +
                (growth > 0 ? "+" : "") +
                Math.round(growth) + "%";
        }
        "Growth: " + (growth > 0 ? "+" : "") + Math.round(growth) + "%";
    }

    function renderTasks() {

        totalTasks = 0;
        completedTasks = 0;

        weeklyTotal.fill(0);
        weeklyCompleted.fill(0);

        if (taskList) {
            taskList.innerHTML = "";
        }

        let today = new Date().toISOString().split("T")[0];

        tasks.forEach((task, index) => {
            // 🔍 SEARCH FILTER
            let searchText = searchInput.value.toLowerCase();

            if (searchText && !task.text.toLowerCase().includes(searchText)) {
                return;
            }

            if (task.date !== today) return;

            let div = document.createElement("div");
            let cb = document.createElement("input");
            cb.type = "checkbox";
            cb.checked = task.completed;

            let span = document.createElement("span");
            span.textContent = task.text;
            span.style.flex = "1";

            div.style = "display:flex;align-items:center;gap:10px;";

            totalTasks++;
            weeklyTotal[task.day]++;

            if (task.completed) {
                completedTasks++;
                weeklyCompleted[task.day]++;
                span.style.textDecoration = "line-through";
            }

            cb.addEventListener("change", function () {

                task.completed = cb.checked;

                if (cb.checked) {
                    span.style.textDecoration = "line-through";
                } else {
                    span.style.textDecoration = "none";
                }

                localStorage.setItem("tasks", JSON.stringify(tasks));

                renderTasks();
                updateAllCharts();

            });

            let edit = document.createElement("button");
            edit.innerHTML = '<i class="fas fa-pen"></i>';
            edit.className = "delete-btn"; // reuse style

            edit.onclick = function () {
                // 🔥 prevent multiple edit boxes
                if (div.querySelector("input[type='text']")) return;
                // create input field
                let inputEdit = document.createElement("input");
                inputEdit.type = "text";
                inputEdit.value = task.text;
                inputEdit.style.flex = "1";

                inputEdit.style.background = "#333";
                inputEdit.style.border = "none";
                inputEdit.style.color = "white";
                inputEdit.style.padding = "5px";
                inputEdit.style.borderRadius = "4px";

                // replace span with input
                div.replaceChild(inputEdit, span);

                inputEdit.focus();

                // change edit button to save
                edit.innerHTML = '<i class="fas fa-check"></i>';

                inputEdit.addEventListener("keypress", function (e) {
                    if (e.key === "Enter") {
                        edit.click(); // trigger save
                    }
                });

                inputEdit.addEventListener("blur", function () {
                    renderTasks(); // revert if not saved
                });

                edit.onclick = function () {
                    let newText = inputEdit.value.trim();

                    if (!newText) return;

                    task.text = newText;

                    localStorage.setItem("tasks", JSON.stringify(tasks));

                    renderTasks();
                    updateAllCharts();
                    renderHistory();
                };
            };

            let del = document.createElement("button");
            del.innerHTML = '<i class="fas fa-trash"></i>';
            del.className = "delete-btn";

            del.onclick = function () {
                tasks.splice(index, 1);
                localStorage.setItem("tasks", JSON.stringify(tasks));
                renderTasks();
                updateAllCharts();
            };

            div.append(cb, span, edit, del);
            if (taskList) {
                taskList.appendChild(div);
            }
        });
    }


    function updateStreak() {
        let completedDays = new Set();

        tasks.forEach((task) => {
            if (task.completed) {
                completedDays.add(task.date);
            }
        });

        let streak = 0;
        let today = new Date();

        while (true) {
            let dateStr = today.toISOString().split("T")[0];

            if (completedDays.has(dateStr)) {
                streak++;
                today.setDate(today.getDate() - 1);
            } else {
                break;
            }
        }

        document.getElementById("streak").textContent =
            "🔥 " + streak + " Days";
    }

    function renderHistory() {
        const historyList = document.getElementById("historyList");

        if (!historyList) return;

        historyList.innerHTML = "";

        let grouped = {};

        // group tasks by date
        tasks.forEach((task) => {
            if (!grouped[task.date]) {
                grouped[task.date] = [];
            }
            grouped[task.date].push(task);
        });

        // display
        Object.keys(grouped)
            .sort()
            .reverse()
            .forEach((date) => {
                let dateHeader = document.createElement("h4");
                dateHeader.textContent = date;
                dateHeader.style.marginTop = "10px";

                historyList.appendChild(dateHeader);

                grouped[date].forEach((task) => {
                    let div = document.createElement("div");
                    div.style =
                        "display:flex;gap:10px;background:#2a2a2a;padding:6px;margin-top:5px;border-radius:5px";

                    let span = document.createElement("span");
                    span.textContent = task.text;

                    if (task.completed) {
                        span.style.textDecoration = "line-through";
                        span.style.opacity = "0.6";
                    }

                    div.appendChild(span);
                    historyList.appendChild(div);
                });
            });
    }

    // ✅ FIX: initial call
    renderTasks();
    renderHistory();
    updateAllCharts();

    // 🔥 ACTIVE MENU SWITCH
    document.querySelectorAll(".menu li").forEach((item) => {
        item.addEventListener("click", function () {
            document
                .querySelectorAll(".menu li")
                .forEach((li) => li.classList.remove("active"));
            this.classList.add("active");
        });
    });
});