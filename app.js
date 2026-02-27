// ==========================================
// 1. SUPABASE AYARLARI (GERÇEK BAĞLANTI)
// ==========================================
const SUPABASE_URL = 'https://ttxcnvmuooalbqfnefdr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_0ro_nwtG17RriEUYCLuPbg_sSbww-ye'; // Not: Bu anahtar Stripe formatına benziyor, Supabase 'anon public' key ile değiştirilmeli.

const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

let currentUser = null;

// State
let currentLang = localStorage.getItem('nova_lang') || 'EN';
let cart = JSON.parse(localStorage.getItem('nova_cart')) || [];

// Translations
const translations = {
    nav_catalog: { EN: 'Catalog', TR: 'Katalog' },
    nav_new: { EN: 'New Arrivals', TR: 'Yeni Gelenler' },
    nav_collections: { EN: 'Collections', TR: 'Koleksiyonlar' },
    nav_journal: { EN: 'Journal', TR: 'Dergi' },
    hero_new_col: { EN: 'New Collection 2026', TR: 'Yeni Koleksiyon 2026' },
    hero_title_1: { EN: 'ELEVATE YOUR', TR: 'YAŞAMINIZI' },
    hero_title_2: { EN: 'LIFESTYLE', TR: 'YÜKSELTİN' },
    hero_desc: {
        EN: 'Discover a curated selection of high-performance products designed for the elite. Merging technology with unparalleled aesthetics.',
        TR: 'Seçkinler için tasarlanmış, yüksek performanslı ürünlerden oluşan küratörlü bir seçkiyi keşfedin. Teknolojiyi eşsiz estetikle birleştiriyoruz.'
    },
    btn_shop: { EN: 'Shop Collections', TR: 'Koleksiyonları İncele' },
    btn_watch: { EN: 'Watch Film', TR: 'Filmi İzle' },
    section_title: { EN: 'The Collection', TR: 'Koleksiyon' },
    sort_by: { EN: 'Sort by', TR: 'Sırala' },
    featured: { EN: 'Featured', TR: 'Öne Çıkan' },
    price_low: { EN: 'Price: Low to High', TR: 'Fiyat: Düşükten Yükseğe' },
    price_high: { EN: 'Price: High to Low', TR: 'Fiyat: Yüksekten Düşüğe' },
    cat_all: { EN: 'All Collections', TR: 'Tüm Koleksiyonlar' },
    cat_timepieces: { EN: 'Timepieces', TR: 'Saatler' },
    cat_tech: { EN: 'Tech', TR: 'Teknoloji' },
    cat_audio: { EN: 'Audio', TR: 'Ses' },
    cart_title: { EN: 'Your Bag', TR: 'Sepetiniz' },
    cart_empty: { EN: 'Your shopping bag is empty.', TR: 'Alışveriş sepetiniz boş.' },
    cart_total: { EN: 'Total', TR: 'Toplam' },
    cart_checkout: { EN: 'Checkout Securely', TR: 'Güvenle Öde' },
    cart_shipping: { EN: 'Free Worldwide Shipping on all Elite orders', TR: 'Tüm Elite siparişlerinde dünya çapında ücretsiz kargo' },
    auth_login: { EN: 'WELCOME BACK', TR: 'TEKRAR HOŞ GELDİNİZ' },
    auth_login_desc: { EN: 'Enter your credentials to access your luxury suite.', TR: 'Lüks süitinize erişmek için bilgilerinizi girin.' },
    auth_email: { EN: 'Email Address', TR: 'E-posta Adresi' },
    auth_pass: { EN: 'Password', TR: 'Şifre' },
    auth_signin: { EN: 'Sign In', TR: 'Giriş Yap' },
    auth_or: { EN: 'Or continue with', TR: 'Veya şununla devam et' },
    auth_no_acc: { EN: 'Don\'t have an account?', TR: 'Hesabınız yok mu?' },
    auth_signup: { EN: 'Sign up', TR: 'Kaydol' }
};

// Data
const products = [
    { id: '1', name: 'Nova Chronos X', price: 2499, category: 'Timepieces', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000' },
    { id: '2', name: 'Lumina Smart Hub', price: 899, category: 'Tech', image: 'https://images.unsplash.com/photo-1526170315870-ef68971ef022?q=80&w=1000' },
    { id: '3', name: 'Aura Soundbase', price: 1200, category: 'Audio', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000' },
    { id: '4', name: 'Eclipse Onyx Lens', price: 450, category: 'Optics', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=1000' },
    { id: '5', name: 'Vertex Pro Tablet', price: 1799, category: 'Tech', image: 'https://images.unsplash.com/photo-1544244015-0cd4b3ffc6b0?q=80&w=1000' },
    { id: '6', name: 'Stella Desk Lamp', price: 299, category: 'Lifestyle', image: 'https://images.unsplash.com/photo-1534073828943-f801091bb18c?q=80&w=1000' },
    { id: '7', name: 'Zenith Wireless', price: 399, category: 'Audio', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=1000' },
    { id: '8', name: 'Horizon VR', price: 999, category: 'Tech', image: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?q=80&w=1000' },
    { id: '9', name: 'Nebula Key', price: 199, category: 'Tech', image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=1000' }
];

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    updateUI();
    renderProducts();
    updateCart();
    checkAuthSession();
    setupEventListeners();
});

// Session Management
async function checkAuthSession() {
    if (!supabase) return;

    const { data: { session } } = await supabase.auth.getSession();
    currentUser = session?.user || null;

    const authBtn = document.getElementById('auth-btn');
    if (currentUser) {
        authBtn.innerHTML = `<i data-lucide="log-out"></i>`;
        authBtn.title = `Hoş geldin, ${currentUser.email}`;
    } else {
        authBtn.innerHTML = `<i data-lucide="user"></i>`;
    }
    lucide.createIcons();
}

// UI Updates
function updateUI() {
    document.querySelectorAll('[data-t]').forEach(el => {
        const key = el.getAttribute('data-t');
        if (translations[key]) el.textContent = translations[key][currentLang];
    });
    document.getElementById('lang-toggle').textContent = currentLang;
}

// Product Rendering
function renderProducts(filter = 'All', sort = 'Featured') {
    const grid = document.getElementById('product-grid');
    let filtered = products.filter(p => filter === 'All' || p.category === filter);

    if (sort === 'LowToHigh') filtered.sort((a, b) => a.price - b.price);
    if (sort === 'HighToLow') filtered.sort((a, b) => b.price - a.price);

    grid.innerHTML = filtered.map(p => `
        <div class="glass-card">
            <div class="card-img-container">
                <img src="${p.image}" alt="${p.name}">
                <button class="add-to-cart" onclick="addToCart('${p.id}')">
                    <i data-lucide="plus"></i>
                </button>
            </div>
            <span class="card-cat">${p.category}</span>
            <h3 class="card-title">${p.name}</h3>
            <p class="card-price">$${p.price.toLocaleString()}</p>
        </div>
    `).join('');

    lucide.createIcons();
}

// Cart Logic
function addToCart(id) {
    const product = products.find(p => p.id === id);
    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    saveCart();
    updateCart();
    openCart();
}

function updateCart() {
    const cartItems = document.getElementById('cart-items');
    const cartBadge = document.getElementById('cart-badge');
    const drawerCount = document.getElementById('drawer-count');
    const cartTotalEl = document.getElementById('cart-total');

    if (cart.length === 0) {
        cartItems.innerHTML = `<p class="empty-msg">${currentLang === 'EN' ? 'Empty' : 'Boş'}</p>`;
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="item-info">
                    <p class="item-name">${item.name}</p>
                    <p class="item-price">$${item.price}</p>
                </div>
                <div class="item-controls">
                    <button onclick="changeQty('${item.id}', -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="changeQty('${item.id}', 1)">+</button>
                </div>
            </div>
        `).join('');
    }

    const count = cart.reduce((acc, item) => acc + item.quantity, 0);
    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    cartBadge.textContent = count;
    drawerCount.textContent = count;
    cartTotalEl.textContent = `$${total.toLocaleString()}`;
}

function changeQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) cart = cart.filter(i => i.id !== id);
        saveCart();
        updateCart();
    }
}

function saveCart() {
    localStorage.setItem('nova_cart', JSON.stringify(cart));
}

// Event Listeners
function setupEventListeners() {
    // Language
    document.getElementById('lang-toggle').addEventListener('click', () => {
        currentLang = currentLang === 'EN' ? 'TR' : 'EN';
        localStorage.setItem('nova_lang', currentLang);
        updateUI();
    });

    // Cart Open/Close
    document.getElementById('cart-btn').addEventListener('click', openCart);
    document.getElementById('cart-close').addEventListener('click', closeCart);
    document.getElementById('cart-overlay').addEventListener('click', closeCart);

    // Filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelector('.filter-btn.active').classList.remove('active');
            btn.classList.add('active');
            renderProducts(btn.getAttribute('data-cat'), document.getElementById('sort-select').value);
        });
    });

    // Sort
    document.getElementById('sort-select').addEventListener('change', (e) => {
        const activeCat = document.querySelector('.filter-btn.active').getAttribute('data-cat');
        renderProducts(activeCat, e.target.value);
    });

    // Auth Modal Logic
    document.getElementById('auth-btn').addEventListener('click', async () => {
        if (currentUser) {
            if (confirm(currentLang === 'EN' ? 'Sign out?' : 'Çıkış yapılsın mı?')) {
                await supabase.auth.signOut();
                currentUser = null;
                checkAuthSession();
            }
        } else {
            document.getElementById('auth-overlay').style.display = 'flex';
        }
    });

    document.getElementById('auth-close').addEventListener('click', () => {
        document.getElementById('auth-overlay').style.display = 'none';
    });

    // Real Supabase Login Form
    const loginForm = document.querySelector('.auth-form');
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = loginForm.querySelector('input[type="email"]').value;
        const password = loginForm.querySelector('input[type="password"]').value;

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            alert(currentLang === 'EN' ? 'Error: ' + error.message : 'Hata: ' + error.message);
        } else {
            document.getElementById('auth-overlay').style.display = 'none';
            checkAuthSession();
            alert(currentLang === 'EN' ? 'Welcome back elite member!' : 'Tekrar hoş geldiniz elite üye!');
        }
    });

    // Social Login (OAuth)
    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const provider = btn.textContent.toLowerCase().trim();
            const { error } = await supabase.auth.signInWithOAuth({
                provider: provider === 'github' ? 'github' : 'google',
            });
            if (error) alert(error.message);
        });
    });
}

// Helpers
function openCart() {
    document.getElementById('cart-drawer').classList.add('active');
    document.getElementById('cart-overlay').classList.add('active');
}

function closeCart() {
    document.getElementById('cart-drawer').classList.remove('active');
    document.getElementById('cart-overlay').classList.remove('active');
}
