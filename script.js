function getMonthName() {
    const date = new Date();
    const months = [
        "Enero", "Febrero", "Marzo", "Abril",
        "Mayo", "Junio", "Julio", "Agosto",
        "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

// Variables principales
let income = 0;
let expenses = [];
let months = [];
let monthChart = null;

// Elementos del DOM
const incomeInput = document.getElementById("incomeInput");
const amountInput = document.getElementById("amountInput");
const categoryInput = document.getElementById("categoryInput");
const descriptionInput = document.getElementById("descriptionInput");
const addExpenseBtn = document.getElementById("addExpenseBtn");
const expenseList = document.getElementById("expenseList");
const totalSpentEl = document.getElementById("totalSpent");
const balanceEl = document.getElementById("balance");
const closeMonthBtn = document.getElementById("closeMonthBtn");
const monthsList = document.getElementById("monthsList");
const savingsEl = document.getElementById("savings");

// Eventos
incomeInput.addEventListener("input", saveIncome);
addExpenseBtn.addEventListener("click", addExpense);
closeMonthBtn.addEventListener("click", closeMonth);

// Guardar ingreso
function saveIncome() {
    income = Number(incomeInput.value);
    updateSummary();
    updateChart();
    saveData();
}

// Agregar gasto
function addExpense() {
    const amount = Number(amountInput.value);
    const category = categoryInput.value;
    const description = descriptionInput.value;

    if (amount <= 0 || category === "") {
        alert("Ingresá un monto válido y una categoría");
        return;
    }

    const expense = {
        id: Date.now(),
        amount,
        category,
        description
    };

    expenses.push(expense);
    clearForm();
    updateUI();
    saveData();
}

// Limpiar formulario
function clearForm() {
    amountInput.value = "";
    categoryInput.value = "";
    descriptionInput.value = "";
}

// Actualizar resumen y lista
function updateUI() {
    expenseList.innerHTML = "";

    let totalSpent = 0;

    expenses.forEach(exp => {
        totalSpent += exp.amount;

        const li = document.createElement("li");
        li.innerHTML = `
            <span>${exp.category} - $${exp.amount}</span>
            <button onclick="deleteExpense(${exp.id})">X</button>
        `;
        expenseList.appendChild(li);
    });

    totalSpentEl.textContent = `$${totalSpent}`;
    updateSummary();

    updateChart();
}

// Balance
function updateSummary() {
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const savings = income - totalSpent;

    totalSpentEl.textContent = `$${totalSpent}`;
    savingsEl.textContent = `$${savings}`;

    savingsEl.classList.remove("positivo", "negativo");
    savingsEl.classList.add(savings >= 0 ? "positivo" : "negativo");
}

// Eliminar gasto
function deleteExpense(id) {
    expenses = expenses.filter(exp => exp.id !== id);
    updateUI();
    saveData();
}

// LocalStorage
function saveData() {
    localStorage.setItem("income", income);
    localStorage.setItem("expenses", JSON.stringify(expenses));
    localStorage.setItem("months", JSON.stringify(months));
}

function loadData() {
    const savedIncome = localStorage.getItem("income");
    const savedExpenses = localStorage.getItem("expenses");
    const savedMonths = localStorage.getItem("months");

    if (savedIncome) {
        income = Number(savedIncome);
        incomeInput.value = income;
    }

    if (savedExpenses) {
        expenses = JSON.parse(savedExpenses);
        updateUI();
    }

    if (savedMonths) {
        months = JSON.parse(savedMonths);
        updateMonthsUI();
    }
}

loadData();
updateChart();

function closeMonth() {
    if (expenses.length === 0 && income === 0) {
        alert("No hay datos para cerrar el mes");
        return;
    }

    const monthData = {
    name: getMonthName(),
    income,
    expenses
    };

    months.push(monthData);

    // Reset mes actual
    income = 0;
    expenses = [];
    incomeInput.value = "";

    updateUI();
    updateMonthsUI();
    saveData();
}

function updateMonthsUI() {
    monthsList.innerHTML = "";

    months.forEach((month, index) => {
        const total = month.expenses.reduce((sum, e) => sum + e.amount, 0);

        const li = document.createElement("li");
        li.innerHTML = `
            <strong>${month.name}</strong>
            <small>Ingreso: $${month.income}</small>
            <small>Gastos: $${total}</small>
        `;
        monthsList.appendChild(li);
    });
}

function updateChart() {
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const balance = income - totalSpent;

    const data = {
        labels: ["Gastado", "Disponible"],
        datasets: [{
            data: [totalSpent, balance >= 0 ? balance : 0],
            backgroundColor: ["#ef4444", "#22c55e"]
        }]
    };

    if (monthChart) {
        monthChart.destroy();
    }

    const ctx = document.getElementById("monthChart").getContext("2d");

    monthChart = new Chart(ctx, {
        type: "bar",
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}
