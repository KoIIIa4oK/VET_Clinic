// ===== js/main.js =====
// ЕДИНЫЙ JAVASCRIPT ДЛЯ ВСЕХ СТРАНИЦ

document.addEventListener('DOMContentLoaded', function() {
    
    // ===== 1. ОБЩИЕ ФУНКЦИИ (выполняются на всех страницах) =====
    initCitySelector();
    initUtilities();
    updateCartCounter();
    
    // ===== 2. СПЕЦИФИЧЕСКИЕ ФУНКЦИИ (по наличию элементов) =====
    if (document.querySelector('.hero__slider')) initSlider();
    if (document.querySelector('.faq-list')) initFaqAccordion();
    if (document.getElementById('catalogGrid')) initCatalogCounts();
    if (document.getElementById('productsGrid') && document.getElementById('productCardTemplate')) initCategoryPage();
    
    // ===== 3. ИНИЦИАЛИЗАЦИЯ КАСТОМНЫХ ЭЛЕМЕНТОВ =====
    initCustomSelects();
    
    // ===== 4. КНОПКА "ОСТАВИТЬ ОТЗЫВ" (только на главной) =====
    const addReviewBtn = document.querySelector('.add-review-btn');
    if (addReviewBtn) {
        addReviewBtn.addEventListener('click', () => alert('Форма добавления отзыва будет доступна в следующем обновлении!'));
    }
});

// ==============================================
// 1. ВЫБОР ГОРОДА
// ==============================================
function initCitySelector() {
    const cityElement = document.getElementById('userCity');
    const changeCityBtn = document.getElementById('changeCityBtn');
    const locationBlock = document.getElementById('locationBlock');
    
    if (!cityElement || !changeCityBtn || !locationBlock) return;
    
    const cities = [
        'Москва', 'Санкт-Петербург', 'Казань', 'Новосибирск', 'Екатеринбург',
        'Нижний Новгород', 'Самара', 'Омск', 'Челябинск', 'Ростов-на-Дону',
        'Уфа', 'Красноярск', 'Пермь', 'Воронеж', 'Волгоград', 'Краснодар',
        'Саратов', 'Тюмень', 'Тольятти', 'Ижевск', 'Барнаул', 'Ульяновск',
        'Иркутск', 'Хабаровск', 'Ярославль', 'Владивосток', 'Махачкала',
        'Томск', 'Оренбург', 'Кемерово', 'Новокузнецк', 'Рязань', 'Астрахань',
        'Набережные Челны', 'Пенза', 'Липецк', 'Киров', 'Чебоксары', 'Тула',
        'Калининград', 'Курск', 'Сочи', 'Севастополь', 'Симферополь', 'Белгород',
        'Владимир', 'Кольчугино'
    ].sort();
    
    function saveCity(city) {
        localStorage.setItem('userCity', city);
        cityElement.textContent = city;
    }
    
    const savedCity = localStorage.getItem('userCity');
    savedCity && cities.includes(savedCity) 
        ? cityElement.textContent = savedCity 
        : (cityElement.textContent = 'Москва', localStorage.setItem('userCity', 'Москва'));
    
    function showNotification(message) {
        const oldNotification = document.querySelector('.city-notification');
        if (oldNotification) oldNotification.remove();
        
        const notification = document.createElement('div');
        notification.className = 'city-notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
    
    function createCityDropdown() {
        const oldDropdown = document.querySelector('.city-dropdown');
        if (oldDropdown) oldDropdown.remove();
        
        const dropdown = document.createElement('div');
        dropdown.className = 'city-dropdown';
        dropdown.innerHTML = `
            <div class="city-dropdown__search">
                <input type="text" placeholder="Поиск города..." id="citySearch" autocomplete="off">
            </div>
            <ul class="city-dropdown__list">
                ${cities.map(city => `
                    <li class="city-dropdown__item ${city === cityElement.textContent ? 'selected' : ''}" 
                        data-city="${city}">${city}</li>
                `).join('')}
            </ul>
        `;
        
        locationBlock.appendChild(dropdown);
        
        const searchInput = dropdown.querySelector('#citySearch');
        const allItems = dropdown.querySelectorAll('.city-dropdown__item');
        
        searchInput.addEventListener('input', (e) => {
            const searchText = e.target.value.toLowerCase();
            allItems.forEach(item => {
                item.style.display = item.dataset.city.toLowerCase().includes(searchText) ? 'block' : 'none';
            });
        });
        
        allItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const selectedCity = item.dataset.city;
                saveCity(selectedCity);
                allItems.forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
                dropdown.classList.remove('show');
                showNotification(`Город изменен на ${selectedCity}`);
            });
        });
        
        return dropdown;
    }
    
    // Стили для уведомления
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .city-notification {
                position: fixed; bottom: 30px; right: 30px;
                background-color: var(--color-primary); color: white;
                padding: 15px 30px; border-radius: 50px;
                box-shadow: 0 4px 20px rgba(76,175,80,0.4);
                font-weight: 500; z-index: 10000;
                opacity: 0; transform: translateX(100px) scale(0.8);
                transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
                pointer-events: none;
            }
            .city-notification.show { opacity: 1; transform: translateX(0) scale(1); }
            .city-notification::before { content: '✓'; margin-right: 10px; font-weight: bold; }
            @media (max-width: 768px) {
                .city-notification { bottom: 20px; right: 20px; left: 20px; text-align: center; }
            }
        `;
        document.head.appendChild(style);
    }
    
    let dropdown = null;
    
    changeCityBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        
        if (!dropdown) dropdown = createCityDropdown();
        
        // Закрываем кастомные селекты
        document.querySelectorAll('.custom-select-dropdown').forEach(d => {
            d.classList.remove('open');
        });
        
        // Тогглим городской дропдаун
        dropdown.classList.toggle('show');
        
        if (dropdown.classList.contains('show')) {
            setTimeout(() => dropdown.querySelector('#citySearch')?.focus(), 100);
        }
    });
    
    locationBlock.addEventListener('click', (e) => {
        if (!e.target.closest('.location__change') && !e.target.closest('.city-dropdown')) {
            if (!dropdown) dropdown = createCityDropdown();
            
            // Закрываем кастомные селекты
            document.querySelectorAll('.custom-select-dropdown').forEach(d => {
                d.classList.remove('open');
            });
            
            dropdown.classList.toggle('show');
        }
    });
    
    document.addEventListener('click', (e) => {
        if (dropdown?.classList.contains('show') && !locationBlock.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    });
    
    dropdown?.addEventListener('click', (e) => e.stopPropagation());
}

// ==============================================
// 2. СЛАЙДЕР
// ==============================================
function initSlider() {
    const slider = document.querySelector('.hero__slider');
    if (!slider) return;
    
    const slides = document.querySelectorAll('.slider-slide');
    const dots = document.querySelectorAll('.slider-dot');
    const prevBtn = document.querySelector('.slider-btn-prev');
    const nextBtn = document.querySelector('.slider-btn-next');
    
    let currentSlide = 0;
    let slideInterval = null;
    const AUTO_PLAY_INTERVAL = 3000;
    
    const showSlide = (index) => {
        index = index < 0 ? slides.length - 1 : index >= slides.length ? 0 : index;
        slides.forEach(s => s.classList.remove('active'));
        dots.forEach(d => d.classList.remove('active'));
        slides[index].classList.add('active');
        dots[index].classList.add('active');
        currentSlide = index;
    };
    
    const nextSlide = () => showSlide(currentSlide + 1);
    const prevSlide = () => showSlide(currentSlide - 1);
    
    const stopAutoPlay = () => {
        if (slideInterval) {
            clearInterval(slideInterval);
            slideInterval = null;
        }
    };
    
    const startAutoPlay = () => {
        stopAutoPlay();
        slideInterval = setInterval(nextSlide, AUTO_PLAY_INTERVAL);
    };
    
    prevBtn?.addEventListener('click', () => { prevSlide(); stopAutoPlay(); startAutoPlay(); });
    nextBtn?.addEventListener('click', () => { nextSlide(); stopAutoPlay(); startAutoPlay(); });
    
    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => { showSlide(i); stopAutoPlay(); startAutoPlay(); });
    });
    
    slider.addEventListener('mouseenter', stopAutoPlay);
    slider.addEventListener('mouseleave', startAutoPlay);
    startAutoPlay();
    
    document.addEventListener('visibilitychange', () => {
        document.hidden ? stopAutoPlay() : startAutoPlay();
    });
}

// ==============================================
// 3. FAQ АККОРДЕОН
// ==============================================
function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    if (!faqItems.length) return;
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-item__question');
        question?.addEventListener('click', () => {
            faqItems.forEach(other => other !== item && other.classList.remove('active'));
            item.classList.toggle('active');
        });
    });
}

// ==============================================
// 4. ПОДСЧЕТ ТОВАРОВ В КАТАЛОГЕ
// ==============================================
function initCatalogCounts() {
    const products = [
        { id: 1, mainCategory: 'lekarstva' }, { id: 2, mainCategory: 'lekarstva' },
        { id: 3, mainCategory: 'lekarstva' }, { id: 4, mainCategory: 'lekarstva' },
        { id: 5, mainCategory: 'vitaminy' }, { id: 6, mainCategory: 'vitaminy' },
        { id: 7, mainCategory: 'korma' }, { id: 8, mainCategory: 'korma' },
        { id: 9, mainCategory: 'aksessuary' }, { id: 10, mainCategory: 'aksessuary' },
        { id: 11, mainCategory: 'khimiya' }, { id: 12, mainCategory: 'khimiya' }
    ];
    
    const counts = {
        all: products.length,
        lekarstva: products.filter(p => p.mainCategory === 'lekarstva').length,
        vitaminy: products.filter(p => p.mainCategory === 'vitaminy').length,
        korma: products.filter(p => p.mainCategory === 'korma').length,
        aksessuary: products.filter(p => p.mainCategory === 'aksessuary').length,
        khimiya: products.filter(p => p.mainCategory === 'khimiya').length
    };
    
    Object.entries(counts).forEach(([category, count]) => {
        const el = document.getElementById(`count-${category}`);
        if (el) {
            const word = count % 10 === 1 && count % 100 !== 11 ? 'товар'
                : [2,3,4].includes(count % 10) && ![12,13,14].includes(count % 100) ? 'товара'
                : 'товаров';
            el.textContent = `${count} ${word}`;
        }
    });
}

// ==============================================
// 5. СТРАНИЦА КАТЕГОРИИ
// ==============================================
function initCategoryPage() {
    const products = [
        { id: 1, name: 'Амоксициллин 15%', desc: 'Антибиотик широкого спектра, 10 мл', price: 450, mainCategory: 'lekarstva', subCategory: 'antibiotics', image: 'images/products/amoxicillin.jpg' },
        { id: 2, name: 'Байтрил 5%', desc: 'Антибиотик для собак и кошек, 100 мл', price: 890, mainCategory: 'lekarstva', subCategory: 'antibiotics', image: 'images/products/baytril.jpg' },
        { id: 3, name: 'Мелоксидил суспензия', desc: 'Обезболивающее, 1.5 мг/мл', price: 380, mainCategory: 'lekarstva', subCategory: 'painkillers', image: 'images/products/meloxidil.jpg' },
        { id: 4, name: 'Празител для собак от 20кг', desc: 'От глистов, 10 таблеток', price: 290, mainCategory: 'lekarstva', subCategory: 'antiparasitic', image: 'images/products/parazitel.jpg' },
        { id: 5, name: 'Гамавит', desc: 'Иммуномодулятор, 10 мл', price: 320, mainCategory: 'vitaminy', subCategory: 'immunity', image: 'images/products/gumavit.jpg' },
        { id: 6, name: 'Витамины для шерсти кошек', desc: 'С биотином, 60 таблеток', price: 550, mainCategory: 'vitaminy', subCategory: 'fur', image: 'images/products/fur-vitamins.jpg' },
        { id: 7, name: 'Royal Canin Gastro Intestinal', desc: 'Лечебный корм для собак, 2 кг', price: 1250, mainCategory: 'korma', subCategory: 'dogs', image: 'images/products/royal-canin.jpg' },
        { id: 8, name: 'Purina Pro Plan STERILISED', desc: 'Для кошек с чувствительным пищеварением 85г', price: 890, mainCategory: 'korma', subCategory: 'cats', image: 'images/products/purina.jpg' },
        { id: 9, name: 'Миска керамическая', desc: '450 мл, для кошек и собак', price: 450, mainCategory: 'aksessuary', subCategory: 'bowls', image: 'images/products/bowl.jpg' },
        { id: 10, name: 'Лежанка "Уют"', desc: '50x40 см, съемный чехол', price: 1250, mainCategory: 'aksessuary', subCategory: 'beds', image: 'images/products/bed.jpg' },
        { id: 11, name: 'Шампунь для кошек собак', desc: 'С ромашкой, 250 мл', price: 380, mainCategory: 'khimiya', subCategory: 'shampoos', image: 'images/products/shampoo.jpg' },
        { id: 12, name: 'Спрей от блох', desc: 'Для кошек и собак, 150 мл', price: 420, mainCategory: 'khimiya', subCategory: 'sprays', image: 'images/products/flea-spray.jpg' }
    ];
    
    const urlParams = new URLSearchParams(window.location.search);
    let currentMainCategory = urlParams.get('cat') || 'all';
    let currentSubCategory = urlParams.get('sub') || 'all';
    
    // Подсветка кнопок переключателя
    document.querySelectorAll('.switcher-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.cat === currentMainCategory);
    });
    
    let categoryProducts = currentMainCategory === 'all' 
        ? [...products] 
        : products.filter(p => p.mainCategory === currentMainCategory);
    
    const titles = {
        'all': { name: 'Все товары', desc: 'Полный ассортимент товаров для ваших питомцев' },
        'lekarstva': { name: 'Лекарства', desc: 'Ветеринарные препараты для лечения и профилактики' },
        'vitaminy': { name: 'Витамины и БАДы', desc: 'Для шерсти, суставов, иммунитета' },
        'korma': { name: 'Корма премиум', desc: 'Для кошек, собак, грызунов, птиц' },
        'aksessuary': { name: 'Аксессуары', desc: 'Миски, лежанки, переноски, игрушки' },
        'khimiya': { name: 'Химия для ухода', desc: 'Шампуни, спреи, лосьоны, средства от блох' }
    };
    
    if (titles[currentMainCategory]) {
        ['categoryName', 'categoryTitle'].forEach(id => {
            document.getElementById(id) && (document.getElementById(id).textContent = titles[currentMainCategory].name);
        });
        document.getElementById('categoryDesc') && (document.getElementById('categoryDesc').textContent = titles[currentMainCategory].desc);
        document.title = `ВЕТ Кабинет - ${titles[currentMainCategory].name}`;
    }
    
    // Фильтр подкатегорий
    const filterSelect = document.getElementById('filterSelect');
    if (filterSelect) {
        const subCategories = [...new Set(categoryProducts.map(p => p.subCategory))];
        const subNames = {
            'antibiotics': 'Антибиотики', 'painkillers': 'Обезболивающие',
            'antiparasitic': 'Противопаразитарные', 'immunity': 'Иммунитет',
            'fur': 'Для шерсти', 'dogs': 'Для собак', 'cats': 'Для кошек',
            'bowls': 'Миски', 'beds': 'Лежанки', 'shampoos': 'Шампуни',
            'sprays': 'Спреи'
        };
        
        filterSelect.innerHTML = '<option value="all">Все подкатегории</option>' + 
            subCategories.map(sub => `<option value="${sub}" ${sub === currentSubCategory ? 'selected' : ''}>${subNames[sub] || sub}</option>`).join('');
    }
    
    const productsGrid = document.getElementById('productsGrid');
    const template = document.getElementById('productCardTemplate');
    if (!productsGrid || !template) return;
    
    let currentProducts = [...categoryProducts];
    let visibleCount = 8;
    let currentSubFilter = currentSubCategory;
    let currentSort = 'default';
    
    const updateURL = () => {
        const url = new URL(window.location);
        url.searchParams.set('cat', currentMainCategory);
        currentSubFilter !== 'all' ? url.searchParams.set('sub', currentSubFilter) : url.searchParams.delete('sub');
        window.history.replaceState({}, '', url);
    };
    
    const renderProducts = () => {
        let filtered = currentSubFilter === 'all' 
            ? [...currentProducts] 
            : currentProducts.filter(p => p.subCategory === currentSubFilter);
        
        if (currentSort === 'price-asc') filtered.sort((a,b) => a.price - b.price);
        else if (currentSort === 'price-desc') filtered.sort((a,b) => b.price - a.price);
        else if (currentSort === 'name') filtered.sort((a,b) => a.name.localeCompare(b.name));
        
        document.getElementById('resultsCount') && (document.getElementById('resultsCount').textContent = filtered.length);
        
        const visible = filtered.slice(0, visibleCount);
        productsGrid.innerHTML = '';
        
        if (!visible.length) {
            productsGrid.innerHTML = '<div class="no-products">В этой категории пока нет товаров</div>';
            document.getElementById('loadMoreBtn') && (document.getElementById('loadMoreBtn').style.display = 'none');
            return;
        }
        
        visible.forEach(product => {
            const card = template.content.cloneNode(true);
            const productLink = `product.html?id=${product.id}`;
            
            // Изображение-ссылка
            const imgWrapper = card.querySelector('.product-card__image-wrapper');
            if (imgWrapper) {
                const link = document.createElement('a');
                link.href = productLink;
                link.className = 'product-card__image-link';
                const img = card.querySelector('.product-card__image');
                img.src = product.image;
                img.alt = product.name;
                link.appendChild(img);
                imgWrapper.innerHTML = '';
                imgWrapper.appendChild(link);
            }
            
            // Заголовок-ссылка
            const titleEl = card.querySelector('.product-card__title');
            if (titleEl) {
                const link = document.createElement('a');
                link.href = productLink;
                link.className = 'product-card__title-link';
                link.textContent = product.name;
                titleEl.innerHTML = '';
                titleEl.appendChild(link);
            }
            
            card.querySelector('.product-card__desc') && (card.querySelector('.product-card__desc').textContent = product.desc);
            card.querySelector('.product-card__price') && (card.querySelector('.product-card__price').textContent = product.price + ' ₽');
            
            const btn = card.querySelector('.product-card__btn');
            if (btn) {
                const cart = JSON.parse(localStorage.getItem('vetCart') || '[]');
                const isInCart = cart.some(item => item.id === product.id);
                
                if (isInCart) {
                    const cartLink = document.createElement('a');
                    cartLink.href = 'cart.html';
                    cartLink.className = 'product-card__cart-link';
                    cartLink.innerHTML = 'В корзине';
                    btn.replaceWith(cartLink);
                } else {
                    btn.textContent = 'Купить';
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        const cart = JSON.parse(localStorage.getItem('vetCart') || '[]');
                        cart.push({ id: product.id, name: product.name, price: product.price, image: product.image, quantity: 1 });
                        localStorage.setItem('vetCart', JSON.stringify(cart));
                        
                        updateCartCounter();
                        showProductNotification(`Товар "${product.name}" добавлен в корзину`);
                        
                        const cartLink = document.createElement('a');
                        cartLink.href = 'cart.html';
                        cartLink.className = 'product-card__cart-link';
                        cartLink.innerHTML = 'В корзине';
                        btn.replaceWith(cartLink);
                    });
                }
            }
            
            productsGrid.appendChild(card);
        });
        
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) loadMoreBtn.style.display = visibleCount >= filtered.length ? 'none' : 'inline-block';
    };
    
    document.getElementById('sortSelect')?.addEventListener('change', function() {
        currentSort = this.value;
        visibleCount = 8;
        renderProducts();
    });
    
    filterSelect?.addEventListener('change', function() {
        currentSubFilter = this.value;
        visibleCount = 8;
        updateURL();
        renderProducts();
    });
    
    document.getElementById('loadMoreBtn')?.addEventListener('click', () => {
        visibleCount += 4;
        renderProducts();
    });
    
    renderProducts();
}

// ==============================================
// 6. ОБЩИЕ УТИЛИТЫ
// ==============================================
function initUtilities() {
    // Активное меню
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav__item a').forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === currentPage);
    });
    
    // Плавный скролл к якорям
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// ==============================================
// 7. КАСТОМНЫЕ ВЫПАДАЮЩИЕ СПИСКИ
// ==============================================
function initCustomSelects() {
    const selects = document.querySelectorAll('select.filter-select, .feedback-form select, .category-filters select');
    
    // Функция закрытия города
    function closeCityDropdown() {
        const cityDropdown = document.querySelector('.city-dropdown');
        if (cityDropdown?.classList.contains('show')) {
            cityDropdown.classList.remove('show');
        }
    }
    
    selects.forEach(originalSelect => {
        if (originalSelect.parentElement?.classList.contains('custom-select-wrapper')) return;
        
        const wrapper = document.createElement('div');
        wrapper.className = 'custom-select-wrapper';
        
        const customSelect = document.createElement('div');
        customSelect.className = 'custom-select';
        customSelect.textContent = originalSelect.options[originalSelect.selectedIndex]?.textContent || 'Выберите...';
        customSelect.title = customSelect.textContent;
        
        const dropdown = document.createElement('div');
        dropdown.className = 'custom-select-dropdown';
        
        Array.from(originalSelect.options).forEach(option => {
            const optionEl = document.createElement('div');
            optionEl.className = `custom-select-option ${option.selected ? 'selected' : ''}`;
            optionEl.textContent = option.textContent;
            optionEl.title = option.textContent;
            optionEl.dataset.value = option.value;
            
            optionEl.addEventListener('click', (e) => {
                e.stopPropagation();
                originalSelect.value = optionEl.dataset.value;
                customSelect.textContent = optionEl.textContent;
                customSelect.title = optionEl.textContent;
                
                dropdown.querySelectorAll('.custom-select-option').forEach(opt => opt.classList.remove('selected'));
                optionEl.classList.add('selected');
                dropdown.classList.remove('open');
                
                originalSelect.dispatchEvent(new Event('change', { bubbles: true }));
            });
            
            dropdown.appendChild(optionEl);
        });
        
        customSelect.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Закрываем город
            closeCityDropdown();
            
            // Закрываем все другие кастомные дропдауны
            document.querySelectorAll('.custom-select-dropdown').forEach(d => {
                if (d !== dropdown) d.classList.remove('open');
            });
            
            // Открываем текущий
            dropdown.classList.toggle('open');
        });
        
        wrapper.appendChild(customSelect);
        wrapper.appendChild(dropdown);
        originalSelect.style.display = 'none';
        originalSelect.parentNode?.insertBefore(wrapper, originalSelect.nextSibling);
    });
    
    // Глобальный обработчик клика
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.custom-select-wrapper') && 
            !e.target.closest('.city-dropdown') && 
            !e.target.closest('.header__location')) {
            
            document.querySelectorAll('.custom-select-dropdown').forEach(d => {
                d.classList.remove('open');
            });
            
            const cityDropdown = document.querySelector('.city-dropdown');
            if (cityDropdown?.classList.contains('show')) {
                cityDropdown.classList.remove('show');
            }
        }
    });
}

// ==============================================
// 8. ОБНОВЛЕНИЕ СЧЕТЧИКА КОРЗИНЫ
// ==============================================
function updateCartCounter() {
    const cartCount = document.querySelector('.cart-count');
    if (!cartCount) return;
    
    const cart = JSON.parse(localStorage.getItem('vetCart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    cartCount.textContent = totalItems;
}

// ==============================================
// 9. УВЕДОМЛЕНИЕ
// ==============================================
function showProductNotification(message) {
    document.querySelector('.product-notification')?.remove();
    
    const notification = document.createElement('div');
    notification.className = 'product-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Инициализация счетчика при загрузке
updateCartCounter();