const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 3000;

const allowedCategories = ["Food", "Transport", "Bills", "Entertainment", "Other"];

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

function isValidDate(value) {

    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
    }

    const [year, month, day] = value.split("-").map(Number);

    const date = new Date(Date.UTC(year, month - 1, day));

    return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day
    );

}

app.get("/api/expenses", async function (req, res) {

    try {

        const result = await pool.query(`
            SELECT id, title, amount::float8 AS amount, category, to_char(date, 'YYYY-MM-DD') AS date
            FROM expenses
            ORDER BY id
        `);

        res.status(200).json(result.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({message: "Server error"});

    }

});

app.get("/api/expenses/:id", async function (req, res) {

    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(404).json({message: "Expense not found"});
    }

    try {

        const result = await pool.query(
            `
            SELECT id, title, amount::float8 AS amount, category, to_char(date, 'YYYY-MM-DD') AS date
            FROM expenses
            WHERE id = $1
            `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({message: "Expense not found"});
        }

        res.status(200).json(result.rows[0]);

    } catch (error) {

        console.error(error);

        res.status(500).json({message: "Server error"});

    }

});

app.post("/api/expenses", async function (req, res) {

    const { title, amount, category, date } = req.body;

    const amountNumber = Number(amount);

    if (typeof title !== "string" || title.trim() === "") {
        return res.status(400).json({message: "Title is required"});
    }

    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
        return res.status(400).json({message: "Amount must be greater than 0"});
    }

    if (!allowedCategories.includes(category)) {
        return res.status(400).json({message: "Invalid category"});
    }

    if (!isValidDate(date)) {
        return res.status(400).json({message: "Invalid date"});
    }

    try {

        const result = await pool.query(
            `
            INSERT INTO expenses (title, amount, category, date)
            VALUES ($1, $2, $3, $4)
            RETURNING id, title, amount::float8 AS amount, category, to_char(date, 'YYYY-MM-DD') AS date
            `,
            [title.trim(), amountNumber, category, date]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {

        console.error(error);

        res.status(500).json({message: "Server error"});

    }

});

app.put("/api/expenses/:id", async function (req, res) {

    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(404).json({message: "Expense not found"});
    }

    const { title, amount, category, date } = req.body;

    const amountNumber = Number(amount);

    if (typeof title !== "string" || title.trim() === "") {
        return res.status(400).json({message: "Title is required"});
    }

    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
        return res.status(400).json({message: "Amount must be greater than 0"});
    }

    if (!allowedCategories.includes(category)) {
        return res.status(400).json({message: "Invalid category"});
    }

    if (!isValidDate(date)) {
        return res.status(400).json({message: "Invalid date"});
    }

    try {

        const result = await pool.query(
            `
            UPDATE expenses
            SET title = $1, amount = $2, category = $3, date = $4
            WHERE id = $5
            RETURNING id, title, amount::float8 AS amount, category, to_char(date, 'YYYY-MM-DD') AS date
            `,
            [title.trim(), amountNumber, category, date, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({message: "Expense not found"});
        }

        res.status(200).json(result.rows[0]);

    } catch (error) {

        console.error(error);

        res.status(500).json({message: "Server error"});

    }

});

app.delete("/api/expenses/:id", async function (req, res) {

    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(404).json({message: "Expense not found"});
    }

    try {

        const result = await pool.query(
            `
            DELETE FROM expenses
            WHERE id = $1
            RETURNING id, title, amount::float8 AS amount, category, to_char(date, 'YYYY-MM-DD') AS date
            `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({message: "Expense not found"});
        }

        res.status(200).json(result.rows[0]);

    } catch (error) {

        console.error(error);

        res.status(500).json({message: "Server error"});

    }

});

app.listen(PORT);