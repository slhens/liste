let currentFilter = 'hepsi';
let allItems = [];
let searchQuery = '';
let pageTitle = 'SiNAN\'IN TORUNLARI MALİKANESİ ALIŞVERİŞ LİSTESİ';

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
        todoText.setAttribute('data-text', item.text);
        
        // Eğer arama sonuçlarında vurgu (highlight) gerekiyorsa
        if (searchQuery && searchQuery.trim() !== '') {
            const regex = new RegExp(`(${escapeRegExp(searchQuery)})`, 'gi');
            todoText.innerHTML = item.text.replace(regex, '<span class="highlight">$1</span>');
        } else {
            todoText.innerText = item.text;
        }

        let editButton = document.createElement("button");
        editButton.classList.add("edit-button");
        editButton.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>';

        let deleteButton = document.createElement("button");
        deleteButton.classList.add("delete-button");
        deleteButton.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';
        
        if(item.status === "completed"){
            checkContainer.classList.add("checked");
            todoText.classList.add("checked");
        }

        const toggleComplete = (e) => {
            if (!e.target.closest('.delete-button') && !e.target.closest('.edit-button') && !todoItem.classList.contains('editing')) {
                markCompleted(item.id);
            }
        };

        todoItem.addEventListener("click", toggleComplete);
        
        editButton.addEventListener("click", (e) => {
            e.stopPropagation();
            startEditing(todoItem, todoText, item.id);
        });
        
        deleteButton.addEventListener("click", (e) => {
            e.stopPropagation();
            deleteItem(item.id);
        });
        
        todoItem.appendChild(checkContainer);
        todoItem.appendChild(todoText);
        todoItem.appendChild(editButton);
        todoItem.appendChild(deleteButton);
        todoItems.push(todoItem)
    })
    document.querySelector(".todo-items").replaceChildren(...todoItems);
}

function addItem(text){
    if(text.trim() !== "") {
        let newItem = db.collection("todo-items").add({
            text: text,
            status: "active",
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        return true;
    }
    return false;
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

function startEditing(todoItem, todoText, itemId) {
    // Eğer zaten düzenleme modundaysa, tekrar etme
    if (todoItem.classList.contains('editing')) {
        return;
    }
    
    // Todo öğesini düzenleme moduna al
    todoItem.classList.add('editing');
    
    // Mevcut metni al
    const currentText = todoText.getAttribute('data-text');
    
    // Metin alanını bir input ile değiştir
    const inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.className = 'edit-input';
    inputField.value = currentText;
    
    // Metin alanını gizle ve input'u ekle
    todoText.style.display = 'none';
    todoItem.insertBefore(inputField, todoText.nextSibling);
    
    // Input'a odaklan
    inputField.focus();
    inputField.select(); // Tüm metni seç
    
    // Düzenleme butonunu kaydet butonuna çevir
    const saveButton = todoItem.querySelector('.edit-button');
    saveButton.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00ffc4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    saveButton.classList.add('save-mode');
    
    // Kaydetme fonksiyonu
    const saveEdit = () => {
        const newText = inputField.value.trim();
        
        if (newText !== '' && newText !== currentText) {
            // Veritabanında güncelle
            db.collection("todo-items").doc(itemId).update({
                text: newText
            }).then(() => {
                console.log("Öğe başarıyla güncellendi");
            }).catch((error) => {
                console.error("Öğe güncellenirken hata oluştu:", error);
            });
        }
        
        // Düzenleme modundan çık
        finishEditing(todoItem, inputField, saveButton);
    };
    
    // Kaydet butonuna tıklayınca
    saveButton.removeEventListener('click', saveButton.editHandler);
    saveButton.editHandler = saveEdit;
    saveButton.addEventListener('click', saveButton.editHandler);
    
    // Enter tuşuna basınca kaydet
    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveEdit();
        }
    });
    
    // Input'tan çıkınca kaydet
    inputField.addEventListener('blur', saveEdit);
}

function finishEditing(todoItem, inputField, saveButton) {
    // Eğer bu input hala varsa (kaydetme işlemi tamamlanmamışsa)
    if (inputField && inputField.parentNode) {
        // Düzenleme modundan çık
        todoItem.classList.remove('editing');
        
        // Input'u kaldır ve metin alanını göster
        inputField.remove();
        const todoText = todoItem.querySelector('.todo-text');
        todoText.style.display = 'block';
        
        // Kaydet butonunu düzenle butonuna çevir
        saveButton.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>';
        saveButton.classList.remove('save-mode');
    }
}

// Regex özel karakterleri kaçış (escape) fonksiyonu
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function searchItems(query) {
    searchQuery = query.trim().toLowerCase();
    
    let filteredItems = allItems;
    
    // Önce filtre uygula
    filteredItems = filterItems(filteredItems, currentFilter);
    
    // Sonra arama uygula
    if (searchQuery !== '') {
        filteredItems = filteredItems.filter(item => 
            item.text.toLowerCase().includes(searchQuery)
        );
    }
    
    generateItems(filteredItems);
}

// Event listener'ları ekle
document.addEventListener('DOMContentLoaded', () => {
    const combinedInput = document.getElementById('combined-input');
    const addButton = document.getElementById('add-button');
    const editTitleButton = document.getElementById('edit-title-button');
    const titleElement = document.getElementById('page-title');
    const clearCompletedButton = document.getElementById('clear-completed');
    const clearAllButton = document.getElementById('clear-all');
    const yearElement = document.getElementById('year');
    
    // Yıl bilgisini ekle
    yearElement.textContent = new Date().getFullYear();
    
    // Tamamlananları temizle
    clearCompletedButton.addEventListener('click', (e) => {
        e.preventDefault();
        
        if (confirm('Tamamlanan tüm öğeleri silmek istediğinize emin misiniz?')) {
            const completedItems = allItems.filter(item => item.status === 'completed');
            
            // Önce animasyon gösterme
            completedItems.forEach(item => {
                const todoItem = document.querySelector(`[data-id="${item.id}"]`);
                if (todoItem) {
                    todoItem.classList.add('deleting');
                }
            });
            
            // Sonra silme işlemi
            setTimeout(() => {
                const batch = db.batch();
                
                completedItems.forEach(item => {
                    const docRef = db.collection("todo-items").doc(item.id);
                    batch.delete(docRef);
                });
                
                batch.commit()
                    .then(() => {
                        console.log(`${completedItems.length} tamamlanmış öğe silindi`);
                    })
                    .catch((error) => {
                        console.error("Toplu silme işleminde hata:", error);
                    });
            }, 300);
        }
    });
    
    // Tümünü temizle
    clearAllButton.addEventListener('click', (e) => {
        e.preventDefault();
        
        if (confirm('TÜM öğeleri silmek istediğinize emin misiniz? Bu işlem geri alınamaz!')) {
            // Önce animasyon gösterme
            allItems.forEach(item => {
                const todoItem = document.querySelector(`[data-id="${item.id}"]`);
                if (todoItem) {
                    todoItem.classList.add('deleting');
                }
            });
            
            // Sonra silme işlemi
            setTimeout(() => {
                const batch = db.batch();
                
                allItems.forEach(item => {
                    const docRef = db.collection("todo-items").doc(item.id);
                    batch.delete(docRef);
                });
                
                batch.commit()
                    .then(() => {
                        console.log(`${allItems.length} öğe silindi`);
                    })
                    .catch((error) => {
                        console.error("Toplu silme işleminde hata:", error);
                    });
            }, 300);
        }
    });
    
    // Sayfa başlığını veritabanından al ve güncelle
    db.collection("app-settings").doc("title").get().then((doc) => {
        if (doc.exists && doc.data().text) {
            pageTitle = doc.data().text;
            titleElement.textContent = pageTitle;
        } else {
            // Eğer veritabanında başlık yoksa, varsayılan başlığı kaydet
            db.collection("app-settings").doc("title").set({
                text: pageTitle
            });
        }
    }).catch((error) => {
        console.error("Başlık getirilemedi:", error);
    });
    
    // Başlık düzenleme
    editTitleButton.addEventListener('click', () => {
        // Zaten düzenleme modunda ise çık
        if (document.querySelector('.title-input')) {
            return;
        }
        
        // Mevcut başlığı gizle
        titleElement.style.display = 'none';
        
        // Input oluştur (textarea olarak)
        const titleInput = document.createElement('textarea');
        titleInput.className = 'title-input';
        titleInput.value = pageTitle;
        titleInput.maxLength = 100; // Maksimum uzunluk sınırı
        
        // Input'u sayfaya ekle
        titleElement.parentNode.insertBefore(titleInput, titleElement);
        
        // Input'a odaklan
        titleInput.focus();
        
        // Input alanını otomatik olarak içeriğe göre boyutlandır
        titleInput.style.height = 'auto';
        titleInput.style.height = titleInput.scrollHeight + 'px';
        
        // Metin değiştiğinde yüksekliği ayarla
        titleInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        });
        
        // Düzenleme butonunu kaydet butonuna çevir
        editTitleButton.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00ffc4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        
        // Kaydetme fonksiyonu
        const saveTitle = () => {
            const newTitle = titleInput.value.trim();
            
            if (newTitle !== '' && newTitle !== pageTitle) {
                // Başlığı güncelle
                pageTitle = newTitle;
                titleElement.textContent = pageTitle;
                
                // Veritabanında güncelle
                db.collection("app-settings").doc("title").set({
                    text: pageTitle
                }).then(() => {
                    console.log("Başlık başarıyla güncellendi");
                    // Sayfa başlığını da güncelle
                    document.title = pageTitle;
                }).catch((error) => {
                    console.error("Başlık güncellenirken hata oluştu:", error);
                });
            }
            
            // Düzenleme modundan çık
            titleElement.style.display = 'block';
            titleInput.remove();
            editTitleButton.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>';
        };
        
        // Kaydet butonuna tıklayınca
        editTitleButton.removeEventListener('click', editTitleButton.titleEditHandler);
        editTitleButton.titleEditHandler = saveTitle;
        editTitleButton.addEventListener('click', editTitleButton.titleEditHandler);
        
        // Enter tuşuna basınca kaydet
        titleInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveTitle();
            }
        });
        
        // Input'tan çıkınca kaydet
        titleInput.addEventListener('blur', saveTitle);
    });
    
    // Filtreleme butonları
    document.querySelectorAll('.items-statuses span').forEach(button => {
        button.addEventListener('click', (e) => {
            currentFilter = e.target.textContent.toLowerCase();
            generateItems(filterItems(allItems, currentFilter));
            updateFilterButtons();
            
            // Filtreleme yapıldıktan sonra arama sonuçlarını da güncelle
            if (searchQuery !== '') {
                searchItems(searchQuery);
            }
        });
    });
    
    // Input değiştiğinde arama yapma
    combinedInput.addEventListener('input', () => {
        searchItems(combinedInput.value);
    });
    
    // Ekleme butonu
    addButton.addEventListener('click', () => {
        const inputText = combinedInput.value;
        if (addItem(inputText)) {
            combinedInput.value = '';
            searchQuery = '';
            generateItems(filterItems(allItems, currentFilter));
        }
    });
    
    // Enter tuşuna basınca ekleme yapma
    combinedInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const inputText = combinedInput.value;
            if (addItem(inputText)) {
                combinedInput.value = '';
                searchQuery = '';
                generateItems(filterItems(allItems, currentFilter));
            }
        }
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