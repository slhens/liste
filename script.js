let currentFilter = 'hepsi';
let allItems = [];

function getItems(){
    db.collection("todo-items")
    .orderBy("timestamp", "desc")
    .onSnapshot((snapshot) => {
        allItems = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        generateItems(filterItems(allItems, currentFilter));
        updateFilterButtons();
    })
}

function filterItems(items, filter) {
    switch(filter) {
        case 'alınmadı':
            return items.filter(item => item.status === 'active');
        case 'alındı':
            return items.filter(item => item.status === 'completed');
        default:
            return items;
    }
}

function updateFilterButtons() {
    const buttons = document.querySelectorAll('.items-statuses span');
    const allButton = buttons[0]; // "Hepsi" butonu

    // Önce tüm butonları sıfırla
    buttons.forEach(button => {
        button.classList.remove('active');
        button.style.color = '#666';
    });

    // Aktif butonu işaretle
    buttons.forEach(button => {
        const buttonText = button.textContent.toLowerCase();
        if(buttonText === currentFilter) {
            button.classList.add('active');
            button.style.color = '#00ffc4';

            // Eğer "Hepsi" butonu değilse, "Hepsi" butonunu gri yap
            if(buttonText !== 'hepsi') {
                allButton.style.color = '#666';
            }
        }
    });

    // Sayfa ilk yüklendiğinde veya "Hepsi" seçildiğinde
    if(currentFilter === 'hepsi') {
        allButton.style.color = '#00ffc4';
    }
}

function generateItems(items){
    let todoItems = []
    items.forEach((item) => {
        let todoItem = document.createElement("div");
        todoItem.classList.add("todo-item");
        todoItem.setAttribute('data-id', item.id);
        
        let checkContainer = document.createElement("div");
        checkContainer.classList.add("check");
        checkContainer.innerHTML = '<img src="assets/icon-check.svg">';
        
        let todoText = document.createElement("div");
        todoText.classList.add("todo-text");
        todoText.innerText = item.text;

        let deleteButton = document.createElement("button");
        deleteButton.classList.add("delete-button");
        deleteButton.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';
        
        if(item.status === "completed"){
            checkContainer.classList.add("checked");
            todoText.classList.add("checked");
        }

        const toggleComplete = (e) => {
            if (!e.target.closest('.delete-button')) {
                markCompleted(item.id);
            }
        };

        todoItem.addEventListener("click", toggleComplete);
        deleteButton.addEventListener("click", (e) => {
            e.stopPropagation();
            deleteItem(item.id);
        });
        
        todoItem.appendChild(checkContainer);
        todoItem.appendChild(todoText);
        todoItem.appendChild(deleteButton);
        todoItems.push(todoItem)
    })
    document.querySelector(".todo-items").replaceChildren(...todoItems);
}

function addItem(event){
    event.preventDefault();
    let text = document.getElementById("todo-input");
    if(text.value.trim() !== "") {
        let newItem = db.collection("todo-items").add({
            text: text.value,
            status: "active",
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        text.value = "";
    }
}

function markCompleted(id){
    let item = db.collection("todo-items").doc(id);
    item.get().then(function(doc) {
        if (doc.exists) {
            const newStatus = doc.data().status === "active" ? "completed" : "active";
            item.update({
                status: newStatus
            });
        }
    })
}

function deleteItem(id) {
    const todoItem = document.querySelector(`[data-id="${id}"]`);
    todoItem.classList.add('deleting');
    
    setTimeout(() => {
        db.collection("todo-items").doc(id).delete()
            .then(() => {
                console.log("Todo başarıyla silindi");
            })
            .catch((error) => {
                console.error("Todo silinirken hata oluştu:", error);
            });
    }, 300);
}

// Event listener'ları ekle
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.items-statuses span').forEach(button => {
        button.addEventListener('click', (e) => {
            currentFilter = e.target.textContent.toLowerCase();
            generateItems(filterItems(allItems, currentFilter));
            updateFilterButtons();
        });
    });

    // Scroll to top functionality
    const scrollToTopButton = document.querySelector('.scroll-to-top');
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 200) {
            scrollToTopButton.classList.add('show');
        } else {
            scrollToTopButton.classList.remove('show');
        }
    });

    scrollToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});

getItems();