// const baseURL = 'http://3.110.204.94';

const baseURL = ''

let currentPage = 1;
        let totalExpenses = 0;
        let totalPages = 0;
        let expensesPerPage = localStorage.getItem('expensesPerPage') || 10;


document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('expenseForm').addEventListener('submit', function(event) {
        event.preventDefault();
        addExpense();
    });
    checkPremiumStatus();
    loadExpenses();
    DisplayS3Files();
    document.getElementById('expensesPerPage').value = expensesPerPage;
});

function checkPremiumStatus() {
    axios.get(baseURL + '/expenses/user', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(response => {
        const isPremium = response.data.isPremium;
        if (isPremium) {
            document.getElementById('premiumStatus').innerHTML = 'You are a premium user. <button onClick="showLeaderboard()">Show LeaderBoard</button>';
            downloadExpenseSection.style.display = 'block';

        } else {
            const buyPremiumBtnContainer = document.getElementById('premiumStatus');
            buyPremiumBtnContainer.innerHTML='<div><button id="buyPremiumBtn" onclick="buyPremium()">Buy Premium</button></div>';
            downloadExpenseSection = document.getElementById('downloadExpenseSection')
            downloadExpenseSection.style.display = 'none';
        }
    })
    .catch(error => {
        console.error('Error checking premium status:', error);
    });
}

function addExpense() {
    const amount = document.getElementById('amount').value;
    const description = document.getElementById('description').value;
    const category = document.getElementById('category').value;

    axios.post(baseURL +'/expenses', {
        amount,
        description,
        category
    },{ headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }})
    .then(response => {
        // displayExpenses(response.data);
        loadExpenses()
        console.log('Expense added:', response.data);
    })
    .catch(error => console.error('Error adding expense:', error));
    document.getElementById('amount').value = '';
    document.getElementById('description').value = '';
    document.getElementById('category').selectedIndex = 0;
}


function loadExpenses() {
            axios.get(baseURL + `/expenses?page=${currentPage}&limit=${expensesPerPage}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            })
            .then(response => {
                const expenses = response.data.expenses;
                totalExpenses = response.data.total;
                totalPages = Math.ceil(totalExpenses / expensesPerPage);
                updatePaginationButtons();
                displayExpenses(expenses);
            })
            .catch(error => console.error('Error loading expenses:', error));
        }



        function changeExpensesPerPage() {
            expensesPerPage = document.getElementById('expensesPerPage').value;
            localStorage.setItem('expensesPerPage', expensesPerPage);
            loadExpenses();
        }
        function displayExpenses(expenses) {
            const expenseList = document.getElementById('expensesList');
            expenseList.innerHTML = '';
        
            // Check if expenses is an array
            if (!Array.isArray(expenses)) {
                console.error('Expenses data is not an array:', expenses);
                return;
            }
        
            // Iterate over each expense object in the array
            expenses.forEach(expense => {
                const entry = document.createElement('li');
                entry.innerHTML = `Amount: ${expense.amount}, Description: ${expense.description}, Category: ${expense.category} --<button onClick = "deleteExpense(${expense.id})">Delete</button>`;
                expenseList.appendChild(entry);
            });
        }
function deleteExpense(id) {
    axios.delete(baseURL + `/expenses/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(() => {
        document.getElementById('expensesList').innerHTML = ''; 
        loadExpenses(); 
    })
    .catch(error => console.error('Error deleting expense:', error));
}

function buyPremium() {
    axios.post(baseURL + '/razorpay/create-order', {}, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(response => {
        const orderData = response.data;
        const options = {
            key: 'rzp_test_PmdqHSSuqH8zOe',
            amount: orderData.amount,
            currency: orderData.currency,
            name: 'DExpense Tracker',
            description: 'Premium Subscription',
            order_id: orderData.id,
            handler: function(response) {
                handlePaymentSuccess(response);
            },
            prefill: {
                email: 'user@example.com',
                contact: '9999999999'
            },
            theme: {
                color: '#3399cc'
            }
        };
        const rzp = new Razorpay(options);
        rzp.open();
    })
    .catch(error => {
        console.error('Error creating Razorpay order:', error);
    });
}

function handlePaymentSuccess(response) {
    axios.post(baseURL + '/razorpay/payment-success', { orderId: response.razorpay_order_id }, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(response => {
        alert('Payment successful! You are now a premium member.');
        console.log('Premium status updated successfully:', response.data);
        checkPremiumStatus();
        
    })
    .catch(error => {
        console.error('Error handling payment success:', error);
    });
}

function showLeaderboard() {
    axios.get(baseURL + '/expenses/user', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(response => {
        const leaderboard = response.data.leaderboard;
        const leaderboardContainer = document.getElementById('leaderboard');
        leaderboardContainer.innerHTML = '<h3>Leaderboard</h3>';
        leaderboard.forEach(user => {
            const userEntry = document.createElement('div');
            userEntry.textContent = `Name: ${user.username}, Total Amount Spent: ${user.totalExpense}`;
            leaderboardContainer.appendChild(userEntry);
        });
    })
    .catch(error => {
        console.error('Error fetching leaderboard:', error);
    });
}

function downloadExpenseFile() {
    axios.get(baseURL + '/expenses/report', {
        responseType: 'blob',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(response => {
        const blob = new Blob([response.data]);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'expenses.csv'; // Change the filename as desired
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    })
    .catch(error => console.error('Error downloading expense file:', error));
}

function DisplayS3Files() {
            axios.get(baseURL + '/expenses/report/s3files', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            })
            .then(response => {
                const files = response.data.files;
                const fileList = document.getElementById('fileList');
                
                // Clear any existing file list items
                fileList.innerHTML = '';

                // Iterate through the list of files and create list items with links
                files.forEach(file => {
                    const listItem = document.createElement('li');
                    const link = document.createElement('a');
                    link.href = file;
                    link.textContent = file;
                    listItem.appendChild(link);
                    fileList.appendChild(listItem);
                });
            })
            .catch(error => {
                console.error('Error fetching downloaded files:', error);
                alert('Failed to fetch downloaded files. Please try again later.');
            });
        }


function prevPage() {
            if (currentPage > 1) {
                currentPage--;
                loadExpenses();
            }
        }

        function nextPage() {
            if (currentPage < totalPages) {
                currentPage++;
                loadExpenses();
            }
        }

        function updatePaginationButtons() {
            const prevButton = document.getElementById('prevPageBtn');
            const nextPageBtn = document.getElementById('nextPageBtn');

            prevButton.disabled = currentPage === 1;
            nextPageBtn.disabled = currentPage === totalPages;
        }
