document.addEventListener("DOMContentLoaded", function () {
    // Lấy các phần tử DOM cần dùng
    const monthInput = document.querySelector(".month-input");
    const budgetInput = document.querySelector(".budget-input");
    const saveBtn = document.querySelector(".save-btn");
    const categoryNameInput = document.querySelector(".category-name");
    const categoryLimitInput = document.querySelector(".category-limit");
    const addCategoryButton = document.querySelector(".add-category");
    const categoryList = document.querySelector(".category-list");
    const historyList = document.querySelector(".history-list");
    const moneyValue = document.querySelector(".money-value");
    const addTransactionBtn = document.querySelector(".add-transaction");
    const transactionAmountInput = document.querySelector(".transaction-amount");
    const transactionNoteInput = document.querySelector(".transaction-note");

    // Khởi tạo dữ liệu từ localStorage hoặc giá trị mặc định
    let monthlyCategories = JSON.parse(localStorage.getItem("monthlyCategories")) || [];
    let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
    let currentMonth = "";

    // Lấy dữ liệu của một tháng cụ thể, nếu chưa có thì tạo mới
    function getMonthData(month) {
        let data = monthlyCategories.find(m => m.month === month);
        if (!data) {
            data = { id: Date.now(), month: month, amount: 0, categories: [] };
            monthlyCategories.push(data);
        }
        return data;
    }

    // Lưu dữ liệu tháng vào localStorage
    function saveMonthData(monthData) {
        const index = monthlyCategories.findIndex(m => m.month === monthData.month);
        monthlyCategories[index] = monthData;
        localStorage.setItem("monthlyCategories", JSON.stringify(monthlyCategories));
    }

    // Hiển thị danh sách danh mục chi tiêu
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

    // Sửa hoặc xóa danh mục khi click vào nút tương ứng
    categoryList.addEventListener("click", function (e) {
        const index = e.target.dataset.index;
        const monthData = getMonthData(currentMonth);
        const categories = monthData.categories;
        if (e.target.classList.contains("edit")) {
            const cat = categories[index];
            const newName = prompt("Sửa tên danh mục:", cat.name);
            const newBudget = parseFloat(prompt("Sửa giới hạn:", cat.budget));
            if (newName && !isNaN(newBudget)) {
                cat.name = newName;
                cat.budget = newBudget;
                saveMonthData(monthData);
                renderCategories(categories);
            }
        }
        if (e.target.classList.contains("delete")) {
            categories.splice(index, 1);
            saveMonthData(monthData);
            renderCategories(categories);
        }
    });

    // Thêm danh mục mới vào tháng hiện tại
    addCategoryButton.addEventListener("click", function () {
        const name = categoryNameInput.value.trim();
        const limit = parseFloat(categoryLimitInput.value.trim());
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
        const newCategory = {
            id: Date.now(),
            name: name,
            budget: limit
        };
        monthData.categories.push(newCategory);
        saveMonthData(monthData);
        renderCategories(monthData.categories);
        categoryNameInput.value = "";
        categoryLimitInput.value = "";
    });

    // Hiển thị các giao dịch của tháng hiện tại
    function renderTransactions(filteredTransactions) {
        historyList.innerHTML = "";
        filteredTransactions.forEach((tx) => {
            const li = document.createElement("li");
            li.innerHTML = `
                <span>
                    ${tx.note} - ${tx.amount.toLocaleString()} VND (${tx.date})
                </span>
                <span class="delete" data-id="${tx.id}"">Xóa</span>
            `;
            historyList.appendChild(li);
        });
    }

    // Xóa một giao dịch khi click vào nút "Xóa"
    historyList.addEventListener("click", function (e) {
        if (e.target.classList.contains("delete")) {
            const id = parseInt(e.target.dataset.id);
            transactions = transactions.filter(tx => tx.id !== id);
            localStorage.setItem("transactions", JSON.stringify(transactions));
            const filteredTransactions = transactions.filter(tx => tx.month === currentMonth);
            renderTransactions(filteredTransactions);
        }
    });

    // Khi chọn tháng, hiển thị thông tin ngân sách và danh mục tương ứng
    monthInput.addEventListener("change", function () {
        currentMonth = this.value;
        const monthData = getMonthData(currentMonth);
        moneyValue.textContent = monthData.amount.toLocaleString() + " VND";
        renderCategories(monthData.categories);
        const filteredTransactions = transactions.filter(tx => tx.month === currentMonth);
        renderTransactions(filteredTransactions);
    });

    // Lưu ngân sách cho tháng được chọn
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

    // Thêm giao dịch mới cho tháng hiện tại
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

    // Tự động kích hoạt khi trang vừa load để hiển thị dữ liệu ban đầu
    monthInput.dispatchEvent(new Event("change"));
});
