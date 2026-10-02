const API_URL = "http://localhost:3000/api/expenses";

let expenses = [];

const tableBody = document.getElementById("expenseTableBody");
const totalAmount = document.getElementById("totalAmount");
const expenseCount = document.getElementById("expenseCount");
const highestExpense = document.getElementById("highestExpense");
const categoryFilter = document.getElementById("categoryFilter");
const loadingSpinner = document.getElementById("loadingSpinner");
const alertContainer = document.getElementById("alertContainer");
const expenseForm = document.getElementById("expenseForm");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const editExpenseForm = document.getElementById("editExpenseForm");
const editId = document.getElementById("editId");
const editTitle = document.getElementById("editTitle");
const editAmount = document.getElementById("editAmount");
const editCategory = document.getElementById("editCategory");
const editDate = document.getElementById("editDate");

const editExpenseModal = new bootstrap.Modal(
    document.getElementById("editExpenseModal")
);


async function deleteExpense(id) {

    try {

        const response = await fetch(API_URL + "/" + id, {method: "DELETE"});


        const data = await response.json();


        if (!response.ok) {

            showAlert(data.message || "Could not delete expense.");

            return;

        }


        await loadExpenses();

    } catch (error) {

        showAlert("Could not connect to the server.");

    }

}

editExpenseForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const id = Number(editId.value);
    const title = editTitle.value.trim();
    const amount = Number(editAmount.value);
    const category = editCategory.value;
    const date = editDate.value;


    if (title === "") {

        showAlert("Title is required.");
        return;

    }


    if (!Number.isFinite(amount) || amount <= 0) {

        showAlert("Amount must be greater than 0.");
        return;

    }


    if (category === "") {

        showAlert("Please choose a category.");
        return;

    }


    if (date === "") {

        showAlert("Date is required.");
        return;

    }


    try {

        const response = await fetch(API_URL + "/" + id, {

            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                title: title,
                amount: amount,
                category: category,
                date: date
            })

        });


        const data = await response.json();


        if (!response.ok) {

            showAlert(data.message || "Could not update expense.");
            return;

        }


        editExpenseModal.hide();

        await loadExpenses();

    } catch (error) {

        showAlert("Could not connect to the server.");

    }

});

async function loadExpenses() {

    loadingSpinner.classList.remove("d-none");
    alertContainer.innerHTML = "";

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to load expenses");
        }

        expenses = await response.json();

        applyFilter();

        updateSummary();

    } catch (error) {

        showAlert("Could not connect to the server.");

    } finally {

        loadingSpinner.classList.add("d-none");

    }

}


function renderExpenses(expenseList) {

    tableBody.innerHTML = "";

    expenseList.forEach(function (expense) {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${expense.title}</td>
            <td>${expense.amount}</td>
            <td>
                <span class="badge text-bg-secondary">
                    ${expense.category}
                </span>
            </td>
            <td>${expense.date}</td>
            <td>
                <button class="btn btn-sm btn-warning editButton">
                    Edit
                </button>

                <button class="btn btn-sm btn-danger deleteButton">
                    Delete
                </button>
            </td>
        `;

        tableBody.appendChild(row);

        const editButton = row.querySelector(".editButton");

        editButton.addEventListener("click", function () {

            editId.value = expense.id;
            editTitle.value = expense.title;
            editAmount.value = expense.amount;
            editCategory.value = expense.category;
            editDate.value = expense.date;

            editExpenseModal.show();

        });

        const deleteButton = row.querySelector(".deleteButton");

        deleteButton.addEventListener("click", function () {

            deleteExpense(expense.id);

        });

    });

}


function updateSummary() {

    const total = expenses.reduce(function (sum, expense) {
        return sum + Number(expense.amount);
    }, 0);

    expenseCount.textContent = expenses.length;

    totalAmount.textContent = total.toFixed(2);


    if (expenses.length === 0) {

        highestExpense.textContent = "0.00";

        return;

    }

    const highest = Math.max(
        ...expenses.map(function (expense) {
            return Number(expense.amount);
        })
    );

    highestExpense.textContent = highest.toFixed(2);

}


function showAlert(message) {

    alertContainer.innerHTML = `
        <div class="alert alert-danger" role="alert">
            ${message}
        </div>
    `;

}


function applyFilter() {

    const selectedCategory = categoryFilter.value;

    if (selectedCategory === "All") {

        renderExpenses(expenses);

    } else {

        const filteredExpenses = expenses.filter(function (expense) {
            return expense.category === selectedCategory;
        });

        renderExpenses(filteredExpenses);

    }

}


categoryFilter.addEventListener("change", function () {

    applyFilter();

});


expenseForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const title = titleInput.value.trim();
    const amount = Number(amountInput.value);
    const category = categoryInput.value;
    const date = dateInput.value;

    if (title === "") {

        showAlert("Title is required.");
        return;

    }

    if (!Number.isFinite(amount) || amount <= 0) {

        showAlert("Amount must be greater than 0.");
        return;

    }

    if (category === "") {

        showAlert("Please choose a category.");
        return;

    }

    if (date === "") {

        showAlert("Date is required.");
        return;

    }

    try {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                title: title,
                amount: amount,
                category: category,
                date: date
            })

        });


        const data = await response.json();


        if (!response.ok) {

            showAlert(data.message || "Could not add expense.");
            return;

        }


        expenseForm.reset();

        await loadExpenses();

    } catch (error) {

        showAlert("Could not connect to the server.");

    }

});


loadExpenses();