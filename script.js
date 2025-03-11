let currentFilter = 'all';
let allItems = [];

function getItems(){
    db.collection("todo-items").onSnapshot((snapshot) => {
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
        case 'active':
            return items.filter(item => item.status === 'active');
        case 'completed':
            return items.filter(item => item.status === 'completed');
        default:
            return items;
    }
}

function updateFilterButtons() {
    document.querySelectorAll('.items-statuses span').forEach(button => {
        button.classList.remove('active');
        if(button.textContent.toLowerCase() === currentFilter) {
            button.classList.add('active');
        }
    });
}

function generateItems(items){
    let todoItems = []
    items.forEach((item) => {
        let todoItem = document.createElement("div");
        todoItem.classList.add("todo-item");
        
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
            if (!e.target.classList.contains('delete-button')) {
                markCompleted(item.id);
            }
        };

        todoItem.addEventListener("click", toggleComplete);
        deleteButton.addEventListener("click", () => deleteItem(item.id));
        
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
            status: "active"
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
    db.collection("todo-items").doc(id).delete()
        .then(() => {
            console.log("Todo başarıyla silindi");
        })
        .catch((error) => {
            console.error("Todo silinirken hata oluştu:", error);
        });
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
        const scrollStep = -window.scrollY / (1000 / 15); // 1 saniye sürecek
        
        function scrollAnimation() {
            if (window.scrollY !== 0) {
                window.scrollBy(0, scrollStep);
                requestAnimationFrame(scrollAnimation);
            }
        }
        
        requestAnimationFrame(scrollAnimation);
    });
});

getItems();