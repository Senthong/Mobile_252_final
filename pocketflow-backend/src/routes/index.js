const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const { register, login, getMe, registerRules, loginRules } = require('../controllers/authController');
const { getTransactions, createTransaction, deleteTransaction, getSummary } = require('../controllers/transactionsController');
const { getAccounts, createAccount, updateAccount } = require('../controllers/accountsController');
const { getBudgets, upsertBudget, deleteBudget } = require('../controllers/budgetsController');
const { getCategories } = require('../controllers/categoriesController');

// ── Auth (public) ──────────────────────────────────────────
router.post('/auth/register', registerRules, register);
router.post('/auth/login',    loginRules,    login);
router.get('/auth/me',        auth,          getMe);

// ── Transactions ────────────────────────────────────────────
router.get('/transactions',          auth, getTransactions);
router.post('/transactions',         auth, createTransaction);
router.delete('/transactions/:id',   auth, deleteTransaction);
router.get('/transactions/summary',  auth, getSummary);

// ── Accounts ────────────────────────────────────────────────
router.get('/accounts',        auth, getAccounts);
router.post('/accounts',       auth, createAccount);
router.put('/accounts/:id',    auth, updateAccount);

// ── Budgets ─────────────────────────────────────────────────
router.get('/budgets',         auth, getBudgets);
router.post('/budgets',        auth, upsertBudget);
router.delete('/budgets/:id',  auth, deleteBudget);

// ── Categories ───────────────────────────────────────────────
router.get('/categories',      auth, getCategories);

module.exports = router;
