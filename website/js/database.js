// ============================================================
//  database.js  —  Supabase searchable database
//  Credentials loaded from config.js (loaded before this file)
// ============================================================

const TABLE_NAME    = "master-table";
const ROWS_PER_PAGE = 50;
const HIDDEN_COLUMNS = ["ID"];
const COLUMN_LABELS = {};

let currentPage    = 1;
let totalRows      = 0;
let currentQuery   = "";
let allColumns     = [];
let visibleColumns = [];

const searchInput = document.getElementById("search-input");
const searchBtn   = document.getElementById("search-btn");
const clearBtn    = document.getElementById("clear-btn");
const statusBar   = document.getElementById("status-bar");
const loading     = document.getElementById("loading");
const noResults   = document.getElementById("no-results");
const dataTable   = document.getElementById("data-table");
const tableHead   = document.getElementById("table-head");
const tableBody   = document.getElementById("table-body");
const pagination  = document.getElementById("pagination");

function getLabel(col) {
    return COLUMN_LABELS[col] || col;
}

function showLoading(yes) {
    loading.classList.toggle("visible", yes);
    if (yes) {
        dataTable.style.display = "none";
        noResults.classList.remove("visible");
    }
}

// ── Step 1: fetch one row to learn column names ───────────────
async function initColumns() {
    try {
        const url = `${SUPABASE_URL}/rest/v1/${encodeURIComponent(TABLE_NAME)}?limit=1`;
        const res = await fetch(url, {
            headers: {
                "apikey":        SUPABASE_ANON_KEY,
                "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        const data = await res.json();
        if (!data || data.length === 0) return;

        allColumns     = Object.keys(data[0]);
        visibleColumns = allColumns.filter(col => !HIDDEN_COLUMNS.includes(col));

        tableHead.innerHTML = `<tr>${visibleColumns.map(c =>
            `<th>${getLabel(c)}</th>`
        ).join("")}</tr>`;

    } catch (err) {
        console.error("initColumns error:", err);
    }
}

// ── Step 2: fetch data ────────────────────────────────────────
async function fetchData(query, page) {
    showLoading(true);

    const from = (page - 1) * ROWS_PER_PAGE;
    const to   = from + ROWS_PER_PAGE - 1;

    const headers = {
        "apikey":        SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type":  "application/json",
        "Prefer":        "count=exact",
        "Range":         `${from}-${to}`,
        "Range-Unit":    "items"
    };

    try {
        let response;

        if (query.trim() !== "") {
            // ── Use the SQL RPC function for full all-column search ──
            response = await fetch(
                `${SUPABASE_URL}/rest/v1/rpc/search_master_table?limit=${ROWS_PER_PAGE}&offset=${from}`,
                {
                    method: "POST",
                    headers,
                    body:   JSON.stringify({ search_term: query })
                }
            );
        } else {
            // ── No query: just load all rows paginated ──
            const url = `${SUPABASE_URL}/rest/v1/${encodeURIComponent(TABLE_NAME)}?limit=${ROWS_PER_PAGE}&offset=${from}`;
            response = await fetch(url, { headers });
        }

        const rangeHeader = response.headers.get("Content-Range");
        if (rangeHeader) {
            const total = rangeHeader.split("/")[1];
            totalRows = (total && total !== "*") ? parseInt(total) : 0;
        }

        if (!response.ok) {
            const errText = await response.text();
            console.error("Supabase error:", response.status, errText);
            statusBar.textContent = `⚠️ Database error ${response.status} — check browser console for details.`;
            showLoading(false);
            return [];
        }

        return await response.json();

    } catch (err) {
        console.error("Fetch error:", err);
        statusBar.textContent = "⚠️ Could not reach database. Check your credentials in config.js.";
        showLoading(false);
        return [];
    }
}

// ── Render ────────────────────────────────────────────────────
function renderTable(data) {
    showLoading(false);

    if (!data || data.length === 0) {
        dataTable.style.display = "none";
        noResults.classList.add("visible");
        statusBar.textContent = "";
        pagination.innerHTML  = "";
        return;
    }

    noResults.classList.remove("visible");
    dataTable.style.display = "table";

    tableBody.innerHTML = data.map(row =>
        `<tr>${visibleColumns.map(col =>
            `<td>${row[col] != null ? row[col] : ""}</td>`
        ).join("")}</tr>`
    ).join("");

    const showFrom = (currentPage - 1) * ROWS_PER_PAGE + 1;
    const showTo   = Math.min(currentPage * ROWS_PER_PAGE, totalRows);
    statusBar.textContent = totalRows > 0
        ? `Showing ${showFrom}–${showTo} of ${totalRows.toLocaleString()} results`
        : `Showing ${data.length} results`;

    renderPagination();
}

function renderPagination() {
    const totalPages = Math.ceil(totalRows / ROWS_PER_PAGE);
    if (totalPages <= 1) { pagination.innerHTML = ""; return; }

    let html = `<button ${currentPage === 1 ? "disabled" : ""} onclick="goToPage(${currentPage - 1})">← Prev</button>`;
    const start = Math.max(1, currentPage - 2);
    const end   = Math.min(totalPages, start + 4);
    for (let i = start; i <= end; i++) {
        html += `<button class="${i === currentPage ? "active" : ""}" onclick="goToPage(${i})">${i}</button>`;
    }
    html += `<button ${currentPage === totalPages ? "disabled" : ""} onclick="goToPage(${currentPage + 1})">Next →</button>`;
    pagination.innerHTML = html;
}

function goToPage(page) {
    currentPage = page;
    loadData();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

async function loadData() {
    const data = await fetchData(currentQuery, currentPage);
    renderTable(data);
}

// ── Events ────────────────────────────────────────────────────
searchBtn.addEventListener("click", () => {
    currentQuery  = searchInput.value.trim();
    currentPage   = 1;
    clearBtn.style.display = currentQuery ? "inline-block" : "none";
    loadData();
});

clearBtn.addEventListener("click", () => {
    searchInput.value      = "";
    currentQuery           = "";
    currentPage            = 1;
    clearBtn.style.display = "none";
    loadData();
});

searchInput.addEventListener("keydown", e => {
    if (e.key === "Enter") searchBtn.click();
});

// ── Init ──────────────────────────────────────────────────────
(async () => {
    await initColumns();
    await loadData();
})();