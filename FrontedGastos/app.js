document.getElementById("transaction-form").addEventListener("submit", function(event) {
    event.preventDefault();

    const description = document.getElementById("description").value;
    const amount = parseFloat(document.getElementById("amount").value);
    const category = document.getElementById("category").value;
    const type = document.getElementById("type").value;

    if (description && !isNaN(amount)) {
        const table = document.getElementById("transaction-list");
        const row = table.insertRow();
        row.innerHTML = `
            <td>${description}</td>
            <td>${amount.toFixed(2)}</td>
            <td>${category}</td>
            <td>${type}</td>
            <td><button class='delete-btn'>Eliminar</button></td>
        `;
        row.querySelector(".delete-btn").addEventListener("click", function() {
            row.remove();
            updateChart();
            updateTotals();
        });
        updateChart();
        updateTotals();
    }

    document.getElementById("transaction-form").reset();
});

const ctx = document.getElementById('chart').getContext('2d');

let myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [
            {
                label: 'Ingresos por Categoría',
                data: [],
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            },
            {
                label: 'Gastos por Categoría',
                data: [],
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }
        ]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

function updateChart() {
    const transactions = getTransactionsFromTable();

    const categoryTotalsIngresos = {};
    const categoryTotalsGastos = {};

    transactions.forEach(transaction => {
        if (transaction.type === 'ingreso') {
            if (categoryTotalsIngresos[transaction.category]) {
                categoryTotalsIngresos[transaction.category] += parseFloat(transaction.amount);
            } else {
                categoryTotalsIngresos[transaction.category] = parseFloat(transaction.amount);
            }
        } else if (transaction.type === 'gasto') {
            if (categoryTotalsGastos[transaction.category]) {
                categoryTotalsGastos[transaction.category] += parseFloat(transaction.amount);
            } else {
                categoryTotalsGastos[transaction.category] = parseFloat(transaction.amount);
            }
        }
    });

    const categories = Object.keys(categoryTotalsIngresos).concat(Object.keys(categoryTotalsGastos).filter(item => Object.keys(categoryTotalsIngresos).indexOf(item) < 0));
    myChart.data.labels = categories;

    myChart.data.datasets[0].data = categories.map(category => categoryTotalsIngresos[category] || 0);
    myChart.data.datasets[1].data = categories.map(category => categoryTotalsGastos[category] || 0);

    myChart.update();
}

function getTransactionsFromTable() {
    const transactions = [];
    const tableRows = document.getElementById("transaction-list").rows;
    for (let i = 0; i < tableRows.length; i++) {
        const row = tableRows[i];
        const transaction = {
            description: row.cells[0].textContent,
            amount: parseFloat(row.cells[1].textContent),
            category: row.cells[2].textContent,
            type: row.cells[3].textContent,
        };
        transactions.push(transaction);
    }
    return transactions;
}

function updateTotals() {
    const transactions = getTransactionsFromTable();
    let totalIngresos = 0;
    let totalGastos = 0;

    transactions.forEach(transaction => {
        if (transaction.type === 'ingreso') {
            totalIngresos += parseFloat(transaction.amount);
        } else if (transaction.type === 'gasto') {
            totalGastos += parseFloat(transaction.amount);
        }
    });

    document.getElementById('total-ingresos').textContent = totalIngresos.toFixed(2);
    document.getElementById('total-gastos').textContent = totalGastos.toFixed(2);
}

function convertTransactionsToCSV(transactions) {
    const header = 'Descripción,Monto,Categoría,Tipo\n';
    const rows = transactions.map(transaction => {
        return `${transaction.description},${transaction.amount},${transaction.category},${transaction.type}`;
    }).join('\n');
    return header + rows;
}

function generateSummaryCSV() {
    const totalIngresos = parseFloat(document.getElementById('total-ingresos').textContent);
    const totalGastos = parseFloat(document.getElementById('total-gastos').textContent);

    return 'Resumen\nTotal Ingresos,' + totalIngresos.toFixed(2) + '\nTotal Gastos,' + totalGastos.toFixed(2);
}

function downloadFile(content, filename, contentType) {
    const a = document.createElement('a');
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = filename;
    a.click();
}

const downloadCsvButton = document.createElement('button');
downloadCsvButton.textContent = 'Descargar CSV (Historial y Resumen)';
downloadCsvButton.addEventListener('click', downloadCSV);
document.querySelector('.container').appendChild(downloadCsvButton);

updateTotals();
updateChart();