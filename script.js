// Global variables
let budget = 0;
let totalSpent = 0;
let items = [];

// Load budget from localStorage when the page loads
window.onload = function() {
    const savedBudget = localStorage.getItem('budget');
    const savedItems = localStorage.getItem('shoppingItems');
    
    if (savedBudget) {
        budget = parseFloat(savedBudget);
    }
    
    if (savedItems) {
        items = JSON.parse(savedItems);
        totalSpent = items.reduce((sum, item) => sum + parseFloat(item.price), 0);
    }
    
    updateBudgetDisplay();
    renderItems();
};

// Save budget and redirect to shopping page
function saveBudget() {
    const budgetInput = document.getElementById('budget');
    const budgetValue = parseFloat(budgetInput.value.replace(/,/g, ''));
    
    if (!budgetValue || isNaN(budgetValue)) {
        showAlert('الرجاء إدخال ميزانية صحيحة', 'error');
        return;
    }
    
    budget = budgetValue;
    localStorage.setItem('budget', budget);
    window.location.href = 'shopping.html';
}

// Show custom alert
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    document.body.appendChild(alertDiv);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        alertDiv.classList.add('fade-out');
        setTimeout(() => alertDiv.remove(), 300);
    }, 3000);
}

// Add new item to the shopping list
function addItem() {
    const nameInput = document.getElementById('item-name');
    const priceInput = document.getElementById('item-price');
    
    if (!nameInput.value || !priceInput.value) {
        showAlert('الرجاء إدخال اسم المنتج وسعره', 'error');
        return;
    }
    
    const price = parseFloat(priceInput.value);
    if (isNaN(price)) {
        showAlert('الرجاء إدخال سعر صحيح', 'error');
        return;
    }
    
    // Allow negative balance but show warning
    const newTotal = totalSpent + price;
    if (newTotal > budget) {
        const confirmContinue = confirm(`سيتجاوز هذا المشتريات الميزانية المحددة. هل ترغب في المتابعة؟\nالميزانية: ${budget.toFixed(2)} ر.س\nإجمالي المشتريات بعد الإضافة: ${newTotal.toFixed(2)} ر.س`);
        if (!confirmContinue) {
            return;
        }
    }
    
    const newItem = {
        id: Date.now(),
        name: nameInput.value,
        price: price
    };
    
    items.push(newItem);
    totalSpent += price;
    
    // Save to localStorage
    saveItems();
    
    // Clear inputs
    nameInput.value = '';
    priceInput.value = '';
    
    // Update display
    updateBudgetDisplay();
    renderItems();
}

// Remove item from the shopping list
function removeItem(id) {
    const itemIndex = items.findIndex(item => item.id === id);
    if (itemIndex > -1) {
        totalSpent -= items[itemIndex].price;
        items.splice(itemIndex, 1);
        
        // Save to localStorage
        saveItems();
        
        // Update display
        updateBudgetDisplay();
        renderItems();
    }
}

// Save items to localStorage
function saveItems() {
    localStorage.setItem('shoppingItems', JSON.stringify(items));
    localStorage.setItem('totalSpent', totalSpent);
}

// Update the budget display
function updateBudgetDisplay() {
    const remainingBudgetEl = document.getElementById('remaining-budget');
    const totalSpentEl = document.getElementById('total-spent');
    const budgetProgress = document.getElementById('budget-progress');
    const spentPercentage = document.getElementById('spent-percentage');
    const itemsCount = document.getElementById('items-count');
    
    if (remainingBudgetEl) {
        const remaining = budget - totalSpent;
        remainingBudgetEl.textContent = Math.abs(remaining).toFixed(2);
        
        // Update progress bar
        const percentage = Math.min((totalSpent / budget) * 100, 100);
        if (budgetProgress) {
            budgetProgress.style.width = `${percentage}%`;
            
            // Change color based on percentage
            if (percentage > 90) {
                budgetProgress.style.background = '#e74c3c';
            } else if (percentage > 70) {
                budgetProgress.style.background = '#f39c12';
            } else {
                budgetProgress.style.background = '#2ecc71';
            }
        }
        
        if (spentPercentage) {
            spentPercentage.textContent = Math.round(percentage);
        }
        
        // Show warning if over budget
        if (remaining < 0) {
            showAlert('لقد تجاوزت الميزانية المحددة!', 'warning');
        }
    }
    
    if (totalSpentEl) {
        totalSpentEl.textContent = totalSpent.toFixed(2);
    }
    
    // Update items count
    if (itemsCount) {
        const items = document.querySelectorAll('.item');
        itemsCount.textContent = items.length;
    }
}

// Render items in the table
function renderItems() {
    const itemsList = document.getElementById('items-list');
    if (!itemsList) return;
    
    itemsList.innerHTML = '';
    
    items.forEach(item => {
        const row = document.createElement('tr');
        
        const nameCell = document.createElement('td');
        nameCell.textContent = item.name;
        
        const priceCell = document.createElement('td');
        priceCell.textContent = item.price.toFixed(2);
        
        const actionCell = document.createElement('td');
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'حذف';
        deleteBtn.className = 'delete-btn';
        deleteBtn.onclick = () => removeItem(item.id);
        
        actionCell.appendChild(deleteBtn);
        
        row.appendChild(nameCell);
        row.appendChild(priceCell);
        row.appendChild(actionCell);
        
        itemsList.appendChild(row);
    });
    
    // Update budget display in case we're on the shopping page
    updateBudgetDisplay();
}

// Generate receipt HTML
function generateReceipt() {
    const remaining = budget - totalSpent;
    const isOverBudget = remaining < 0;
    
    let receiptHTML = `
        <div class="receipt">
            <div class="receipt-header">
                <div class="logo">
                    <i class="fas fa-shopping-cart"></i>
                    <span>حاسبتي</span>
                </div>
                <h2>إيصال المشتريات</h2>
                <div class="receipt-date">${new Date().toLocaleDateString('ar-SA')}</div>
            </div>
            
            <div class="receipt-body">
                <div class="receipt-items">
                    ${items.map(item => `
                        <div class="receipt-item">
                            <span class="item-name">${item.name}</span>
                            <span class="item-price">${parseFloat(item.price).toFixed(2)} ر.س</span>
                        </div>
                    `).join('')}
                </div>
                
                <div class="receipt-totals">
                    <div class="receipt-total">
                        <span>إجمالي المشتريات:</span>
                        <span>${totalSpent.toFixed(2)} ر.س</span>
                    </div>
                    <div class="receipt-total">
                        <span>الميزانية:</span>
                        <span>${budget.toFixed(2)} ر.س</span>
                    </div>
                    <div class="receipt-total ${isOverBudget ? 'negative' : ''}">
                        <strong>${isOverBudget ? 'التجاوز:' : 'المتبقي:'}</strong>
                        <strong>${Math.abs(remaining).toFixed(2)} ر.س</strong>
                    </div>
                </div>
                
                ${isOverBudget ? `
                <div class="budget-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>لقد تجاوزت الميزانية المحددة</span>
                </div>
                ` : ''}
            </div>
            
            <div class="receipt-footer">
                <p>شكراً لاستخدامك حاسبتي الذكية للمشتريات</p>
                <p>${new Date().toLocaleString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
        </div>
    `;
    
    return receiptHTML;
}

// Show receipt in modal
function showReceipt() {
    const modal = document.getElementById('receipt-modal');
    const receiptContent = document.getElementById('receipt-content');
    
    receiptContent.innerHTML = generateReceipt();
    modal.style.display = 'flex';
    
    // Auto-print if user confirms
    const shouldPrint = confirm('هل تريد طباعة الإيصال؟');
    if (shouldPrint) {
        setTimeout(printReceipt, 500);
    }
}

// Print receipt
function printReceipt() {
    const receiptWindow = window.open('', '_blank');
    receiptWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>إيصال المشتريات</title>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap');
                * { font-family: 'Tajawal', sans-serif; }
                body { padding: 20px; }
                .receipt { max-width: 400px; margin: 0 auto; }
                .receipt-header { text-align: center; margin-bottom: 20px; }
                .receipt-header .logo { display: flex; align-items: center; justify-content: center; gap: 10px; }
                .receipt-date { color: #666; margin-top: 5px; }
                .receipt-item { display: flex; justify-content: space-between; margin: 10px 0; }
                .receipt-totals { margin-top: 20px; border-top: 1px dashed #ddd; padding-top: 15px; }
                .receipt-total { display: flex; justify-content: space-between; margin: 10px 0; }
                .negative { color: #e74c3c; }
                .budget-warning { background: #fff8e6; padding: 10px; border-right: 3px solid #f39c12; margin-top: 15px; }
                .receipt-footer { margin-top: 30px; text-align: center; color: #666; font-size: 14px; }
                @media print { 
                    @page { size: auto; margin: 0; } 
                    body { padding: 20px; }
                }
            </style>
        </head>
        <body>
            ${generateReceipt()}
            <script>
                window.onload = function() { window.print(); }
            </script>
        </body>
        </html>
    `);
    receiptWindow.document.close();
}

// Download receipt as image
function downloadReceipt() {
    const modal = document.getElementById('receipt-content');
    
    // Show loading state
    const originalContent = modal.innerHTML;
    modal.innerHTML = '<div class="loading">جاري تحضير الإيصال...</div>';
    
    // Add a small delay to ensure the loading message is shown
    setTimeout(() => {
        html2canvas(modal, {
            scale: 3, // Higher scale for better quality
            backgroundColor: null,
            logging: false,
            useCORS: true,
            allowTaint: true,
            windowWidth: document.documentElement.offsetWidth,
            windowHeight: document.documentElement.offsetHeight
        }).then(canvas => {
            // Restore original content
            modal.innerHTML = originalContent;
            
            // Create a temporary link to download the image
            const link = document.createElement('a');
            const date = new Date().toLocaleDateString('ar-SA').replace(/\//g, '-');
            link.download = `مشتريات_${date}.png`;
            link.href = canvas.toDataURL('image/png', 1.0);
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Show success message
            showAlert('تم تحميل الإيصال بنجاح', 'success');
        }).catch(error => {
            console.error('Error generating receipt:', error);
            modal.innerHTML = originalContent;
            showAlert('حدث خطأ أثناء إنشاء الإيصال', 'error');
        });
    }, 100);
}

// Finish shopping process
function finishShopping() {
    const modal = document.getElementById('receipt-content');
    const originalContent = modal.innerHTML;
    
    // Show loading state
    modal.innerHTML = '<div class="loading">جاري تحضير الإيصال...</div>';
    
    // Add a small delay to ensure the loading message is shown
    setTimeout(() => {
        // Generate receipt content
        const receiptHTML = generateReceipt();
        modal.innerHTML = receiptHTML;
        
        // Wait for the DOM to update
        setTimeout(() => {
            html2canvas(modal, {
                scale: 3, // Higher scale for better quality
                backgroundColor: null,
                logging: false,
                useCORS: true,
                allowTaint: true,
                windowWidth: document.documentElement.offsetWidth,
                windowHeight: document.documentElement.offsetHeight
            }).then(canvas => {
                // Create a temporary link to download the image
                const link = document.createElement('a');
                const date = new Date().toLocaleDateString('ar-SA').replace(/\//g, '-');
                link.download = `مشتريات_${date}.png`;
                link.href = canvas.toDataURL('image/png', 1.0);
                
                // Trigger download
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Show success message
                showAlert('تم حفظ الإيصال بنجاح', 'success');
                
                // Clear storage after download
                localStorage.removeItem('budget');
                localStorage.removeItem('shoppingItems');
                localStorage.removeItem('totalSpent');
                
                // Redirect to home page after a short delay
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
                
            }).catch(error => {
                console.error('Error generating receipt:', error);
                showAlert('حدث خطأ أثناء حفظ الإيصال', 'error');
                modal.innerHTML = originalContent;
            });
        }, 100);
    }, 100);
}

