// Toggle menu tài khoản khi click vào biểu tượng
document.addEventListener('click', function(e) {
    const menu = document.getElementById('accMenu');
    const drop = document.getElementById('accDrop');
    if (menu.contains(e.target)) {
        drop.classList.toggle('show'); // Hiện/ẩn menu
    } else {
        drop.classList.remove('show'); // Ẩn nếu click ra ngoài
    }
});

document.addEventListener("DOMContentLoaded", function () {
    // --- Lấy các phần tử HTML ---
    const monthInput = document.querySelector(".month-input"); // Input chọn tháng
    const budgetInput = document.querySelector(".budget-input"); // Input ngân sách
    const saveBtn = document.querySelector(".save-btn"); // Nút lưu ngân sách
    const categoryNameInput = document.querySelector(".category-name"); // Input tên danh mục
    const categoryLimitInput = document.querySelector(".category-limit"); // Input giới hạn danh mục
    const addCategoryButton = document.querySelector(".add-category"); // Nút thêm/sửa danh mục
    const categoryList = document.querySelector(".category-list"); // Danh sách danh mục
    const historyList = document.querySelector(".history-list"); // Danh sách giao dịch
    const moneyValue = document.querySelector(".money-value"); // Hiển thị tổng ngân sách
    const addTransactionBtn = document.querySelector(".add-transaction"); // Nút thêm giao dịch
    const transactionAmountInput = document.querySelector(".transaction-amount"); // Số tiền giao dịch
    const transactionNoteInput = document.querySelector(".transaction-note"); // Ghi chú giao dịch

    // --- Dữ liệu từ localStorage ---
    let monthlyCategories = JSON.parse(localStorage.getItem("monthlyCategories")) || [];
    let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
    let currentMonth = ""; // Tháng đang được chọn
    let editingCategoryIndex = null; // Theo dõi danh mục đang chỉnh sửa

    // --- Lấy dữ liệu tháng, nếu chưa có thì tạo mới ---
    function getMonthData(month) {
        let data = monthlyCategories.find(m => m.month === month);
        if (!data) {
            data = { id: Date.now(), month: month, amount: 0, categories: [] };
            monthlyCategories.push(data);
        }
        return data;
    }

    // --- Lưu dữ liệu tháng vào localStorage ---
    function saveMonthData(monthData) {
        const index = monthlyCategories.findIndex(m => m.month === monthData.month);
        monthlyCategories[index] = monthData;
        localStorage.setItem("monthlyCategories", JSON.stringify(monthlyCategories));
    }

    // --- Hiển thị danh sách danh mục ---
    function renderCategories(categories) {
        categoryList.innerHTML = "";
        categories.forEach((cat, index) => {
            const li = document.createElement("li");
            li.innerHTML = `
                <span>${cat.name} - Giới hạn: ${cat.budget.toLocaleString()} VND</span>
                <div class="actions">
                    <span class="edit" data-index="${index}">Sửa</span>
                    <span class="delete" data-index="${index}">Xóa</span>
                </div>
            `;
            categoryList.appendChild(li);
        });
    }

    // --- Xử lý click vào danh mục (sửa hoặc xóa) ---
    categoryList.addEventListener("click", function (e) {
        const index = e.target.dataset.index;
        const monthData = getMonthData(currentMonth);
        const categories = monthData.categories;

        if (e.target.classList.contains("edit")) {
            // Hiển thị thông tin danh mục lên form để sửa
            const cat = categories[index];
            categoryNameInput.value = cat.name;
            categoryLimitInput.value = cat.budget;
            editingCategoryIndex = index;
            addCategoryButton.textContent = "Sửa danh mục";
        }

        if (e.target.classList.contains("delete")) {
            // Xóa danh mục
            categories.splice(index, 1);
            saveMonthData(monthData);
            renderCategories(categories);
            editingCategoryIndex = null;
            addCategoryButton.textContent = "Thêm danh mục";
        }
    });

    // --- Thêm hoặc sửa danh mục ---
    addCategoryButton.addEventListener("click", function () {
        const name = categoryNameInput.value.trim();
        const limit = parseFloat(categoryLimitInput.value.trim());

        // Kiểm tra đầu vào hợp lệ
        if (!name || isNaN(limit) || limit <= 0) {
            Toastify({
                text: "Vui lòng nhập tên danh mục và số tiền hợp lệ!",
                duration: 3000,
                gravity: "top",
                position: "center",
                backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)"
            }).showToast();
            return;
        }

        const monthData = getMonthData(currentMonth);

        if (editingCategoryIndex !== null) {
            // Sửa danh mục
            monthData.categories[editingCategoryIndex].name = name;
            monthData.categories[editingCategoryIndex].budget = limit;
            editingCategoryIndex = null;
            addCategoryButton.textContent = "Thêm danh mục";
        } else {
            // Thêm mới danh mục
            const newCategory = {
                id: Date.now(),
                name: name,
                budget: limit
            };
            monthData.categories.push(newCategory);
        }

        saveMonthData(monthData);
        renderCategories(monthData.categories);
        categoryNameInput.value = "";
        categoryLimitInput.value = "";
    });

    // --- Hiển thị danh sách giao dịch ---
    function renderTransactions(filteredTransactions) {
        historyList.innerHTML = "";
        filteredTransactions.forEach((tx) => {
            const li = document.createElement("li");
            li.innerHTML = `
                <span>
                    ${tx.note} - ${tx.amount.toLocaleString()} VND (${tx.date})
                </span>
                <span class="delete" data-id="${tx.id}">Xóa</span>
            `;
            historyList.appendChild(li);
        });
    }

    // --- Xử lý xóa giao dịch ---
    historyList.addEventListener("click", function (e) {
        if (e.target.classList.contains("delete")) {
            const id = parseInt(e.target.dataset.id);
            transactions = transactions.filter(tx => tx.id !== id);
            localStorage.setItem("transactions", JSON.stringify(transactions));
            const filteredTransactions = transactions.filter(tx => tx.month === currentMonth);
            renderTransactions(filteredTransactions);
        }
    });

    // --- Khi người dùng chọn tháng ---
    monthInput.addEventListener("change", function () {
        currentMonth = this.value;
        const monthData = getMonthData(currentMonth);
        moneyValue.textContent = monthData.amount.toLocaleString() + " VND";
        renderCategories(monthData.categories);
        const filteredTransactions = transactions.filter(tx => tx.month === currentMonth);
        renderTransactions(filteredTransactions);

        editingCategoryIndex = null;
        addCategoryButton.textContent = "Thêm danh mục";
    });

    // --- Lưu ngân sách tháng ---
    saveBtn.addEventListener("click", function () {
        const selectedMonth = monthInput.value;
        const budgetAmount = budgetInput.value.trim();
        if (budgetAmount === "" || isNaN(budgetAmount) || parseFloat(budgetAmount) <= 0) {
            Toastify({
                text: "Vui lòng nhập số tiền hợp lệ!",
                duration: 3000,
                gravity: "top",
                position: "center",
                backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)"
            }).showToast();
            return;
        }
        const monthData = getMonthData(selectedMonth);
        monthData.amount = parseFloat(budgetAmount);
        saveMonthData(monthData);
        moneyValue.textContent = monthData.amount.toLocaleString() + " VND";
        Toastify({
            text: `Ngân sách tháng ${selectedMonth} đã được lưu: ${monthData.amount.toLocaleString()} VND`,
            duration: 3000,
            gravity: "top",
            position: "center",
            backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)"
        }).showToast();
    });

    // --- Thêm giao dịch ---
    addTransactionBtn.addEventListener("click", function () {
        const amount = parseFloat(transactionAmountInput.value.trim());
        const note = transactionNoteInput.value.trim();
        const month = monthInput.value;
        if (isNaN(amount) || amount <= 0 || note === "") {
            Toastify({
                text: "Vui lòng nhập số tiền hợp lệ và ghi chú!",
                duration: 3000,
                gravity: "top",
                position: "center",
                backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)"
            }).showToast();
            return;
        }
        const newTransaction = {
            id: Date.now(),
            amount: amount,
            note: note,
            month: month,
            date: new Date().toLocaleDateString("vi-VN"),
            categoryId: null 
        };
        transactions.push(newTransaction);
        localStorage.setItem("transactions", JSON.stringify(transactions));
        const filteredTransactions = transactions.filter(tx => tx.month === month);
        renderTransactions(filteredTransactions);
        transactionAmountInput.value = "";
        transactionNoteInput.value = "";
    });

    // --- Kích hoạt hiển thị dữ liệu tháng mặc định ---
    monthInput.dispatchEvent(new Event("change"));
});
