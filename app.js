/**
 * NOVA STOREFRONT - SUPER-FAILSAFE EDITION (VANILLA JS)
 * This script is guaranteed to run even if libraries or APIs fail.
 */

(function () {
    console.log("💎 Nova Engine: Booting...");

    // 1. CONFIG & STATE
    const SUPABASE_URL = 'https://ttxcnvmuooalbqfnefdr.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_0ro_nwtG17RriEUYCLuPbg_sSbww-ye';

    let supabase = null;
    let currentLang = localStorage.getItem('nova_lang') || 'EN';
    let cart = JSON.parse(localStorage.getItem('nova_cart') || '[]');
    let currentUser = null;

    // 2. DATA
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
        cart_total: { EN: 'Total', TR: 'Toplam' },
        cart_checkout: { EN: 'Checkout Securely', TR: 'Güvenle Öde' },
        cart_shipping: { EN: 'Free Worldwide Shipping on all Elite orders', TR: 'Tüm Elite siparişlerinde dünya çapında ücretsiz kargo' },
        auth_login: { EN: 'WELCOME BACK', TR: 'TEKRAR HOŞ GELDİNİZ' },
        auth_login_desc: { EN: 'Enter credentials to access your luxury suite.', TR: 'Lüks süitinize erişmek için bilgilerinizi girin.' },
        auth_email: { EN: 'Email Address', TR: 'E-posta Adresi' },
        auth_pass: { EN: 'Password', TR: 'Şifre' },
        auth_signin: { EN: 'Sign In', TR: 'Giriş Yap' },
        auth_or: { EN: 'Or continue with', TR: 'Veya şununla devam et' },
        auth_no_acc: { EN: 'Don\'t have an account?', TR: 'Hesabınız yok mu?' },
        auth_signup: { EN: 'Sign up', TR: 'Kaydol' },
        auth_reg_desc: { EN: 'Start your journey into high-performance luxury.', TR: 'Yüksek performanslı lüks dünyasına adım atın.' },
        auth_fullname: { EN: 'Full Name', TR: 'Ad Soyad' },
        auth_create: { EN: 'Create Account', TR: 'Hesap Oluştur' },
        auth_has_acc: { EN: 'Already have an account?', TR: 'Zaten hesabınız var mı?' }
    };

    const products = [
        { id: '1', name: 'Nova Chronos X', price: 2499, category: 'Timepieces', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000' },
        { id: '2', name: 'Lumina Smart Hub', price: 899, category: 'Tech', image: 'https://images.unsplash.com/photo-1526170315870-ef68971ef022?q=80&w=1000' },
        { id: '3', name: 'Aura Soundbase', price: 1200, category: 'Audio', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000' },
        { id: '4', name: 'Eclipse Onyx Lens', price: 450, category: 'Optics', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=1000' },
        { id: '5', name: 'Vertex Pro Tablet', price: 1799, category: 'Tech', image: 'https://images.unsplash.com/photo-1544244015-0cd4b3ffc6b0?q=80&w=1000' },
        { id: '6', name: 'Stella Desk Lamp', price: 299, category: 'Lifestyle', image: 'https://images.unsplash.com/photo-1534073828943-f801091bb18c?q=80&w=1000' }
    ];

    // 3. CORE FUNCTIONS
    function updateUI() {
        console.log("💎 UI: Updating translations...");
        document.querySelectorAll('[data-t]').forEach(el => {
            const key = el.getAttribute('data-t');
            if (translations[key]) el.textContent = translations[key][currentLang];
        });
        const langBtn = document.getElementById('lang-toggle');
        if (langBtn) langBtn.textContent = currentLang;
    }

    function renderProducts(filter = 'All', sort = 'Featured') {
        console.log(`💎 SHOP: Rendering products (Filter: ${filter}, Sort: ${sort})...`);
        const grid = document.getElementById('product-grid');
        if (!grid) {
            console.error("❌ SHOP: #product-grid not found!");
            return;
        }

        let list = products.filter(p => filter === 'All' || p.category === filter);
        if (sort === 'LowToHigh') list.sort((a, b) => a.price - b.price);
        if (sort === 'HighToLow') list.sort((a, b) => b.price - a.price);

        grid.innerHTML = list.map(p => `
            <article class="glass-card">
                <div class="card-img-container">
                    <img src="${p.image}" alt="${p.name}" loading="lazy">
                    <button class="add-to-cart" onclick="nova_addToCart('${p.id}')">
                        <i data-lucide="plus"></i>
                    </button>
                </div>
                <span class="card-cat">${p.category}</span>
                <h3 class="card-title">${p.name}</h3>
                <p class="card-price">$${p.price.toLocaleString()}</p>
            </article>
        `).join('');

        if (window.lucide) lucide.createIcons();
    }

    function updateCartUI() {
        console.log("💎 CART: Updating UI...");
        const itemsEl = document.getElementById('cart-items');
        const badgeEl = document.getElementById('cart-badge');
        const drawerCountEl = document.getElementById('drawer-count');
        const totalEl = document.getElementById('cart-total');

        if (itemsEl) {
            if (cart.length === 0) {
                const msg = currentLang === 'EN' ? 'Your bag is empty.' : 'Sepetiniz boş.';
                itemsEl.innerHTML = `<p style="text-align:center; opacity: 0.5; padding: 2rem;">${msg}</p>`;
            } else {
                itemsEl.innerHTML = cart.map(item => `
                    <div class="cart-item">
                        <div>
                            <p class="item-name">${item.name}</p>
                            <p class="item-price">$${item.price.toLocaleString()}</p>
                        </div>
                        <div class="item-controls">
                            <button onclick="nova_changeQty('${item.id}', -1)">-</button>
                            <span>${item.quantity}</span>
                            <button onclick="nova_changeQty('${item.id}', 1)">+</button>
                        </div>
                    </div>
                `).join('');
            }
        }

        const count = cart.reduce((acc, i) => acc + i.quantity, 0);
        const total = cart.reduce((acc, i) => acc + (i.price * i.quantity), 0);

        if (badgeEl) badgeEl.textContent = count;
        if (drawerCountEl) drawerCountEl.textContent = count;
        if (totalEl) totalEl.textContent = `$${total.toLocaleString()}`;
    }

    function toggleCart(open) {
        const d = document.getElementById('cart-drawer');
        const o = document.getElementById('cart-overlay');
        if (!d || !o) return;
        if (open) { d.classList.add('active'); o.classList.add('active'); }
        else { d.classList.remove('active'); o.classList.remove('active'); }
    }

    // 4. EXPOSED API (Global for onclick handlers)
    window.nova_addToCart = function (id) {
        const product = products.find(p => p.id === id);
        if (!product) return;
        const exists = cart.find(i => i.id === id);
        if (exists) exists.quantity++;
        else cart.push({ ...product, quantity: 1 });
        localStorage.setItem('nova_cart', JSON.stringify(cart));
        updateCartUI();
        toggleCart(true);
    };

    window.nova_changeQty = function (id, delta) {
        const item = cart.find(i => i.id === id);
        if (item) {
            item.quantity += delta;
            if (item.quantity <= 0) cart = cart.filter(i => i.id !== id);
            localStorage.setItem('nova_cart', JSON.stringify(cart));
            updateCartUI();
        }
    };

    // 5. BOOTSTRAP
    function init() {
        console.log("💎 Nova Engine: Document Ready. Initializing UI...");

        try {
            renderProducts();
            updateUI();
            updateCartUI();
            if (window.lucide) lucide.createIcons();
        } catch (e) {
            console.error("❌ Initialization Failure:", e);
        }

        // Language Toggle
        const langBtn = document.getElementById('lang-toggle');
        if (langBtn) {
            langBtn.addEventListener('click', () => {
                currentLang = currentLang === 'EN' ? 'TR' : 'EN';
                localStorage.setItem('nova_lang', currentLang);
                updateUI();
                updateCartUI();
            });
        }

        // Smooth Scroll
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) window.scrollTo({ top: target.offsetTop - 90, behavior: 'smooth' });
            });
        });

        // Toggle Cart
        const cartBtn = document.getElementById('cart-btn');
        if (cartBtn) cartBtn.addEventListener('click', () => toggleCart(true));

        const cartClose = document.getElementById('cart-close');
        if (cartClose) cartClose.addEventListener('click', () => toggleCart(false));

        const cartOverlay = document.getElementById('cart-overlay');
        if (cartOverlay) cartOverlay.addEventListener('click', () => toggleCart(false));

        // Filters
        document.querySelectorAll('.filter-pill').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderProducts(btn.getAttribute('data-cat'), document.getElementById('sort-select')?.value || 'Featured');
            });
        });

        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                const cat = document.querySelector('.filter-pill.active')?.getAttribute('data-cat') || 'All';
                renderProducts(cat, e.target.value);
            });
        }

        // Auth
        const authBtn = document.getElementById('auth-btn');
        const authOverlay = document.getElementById('auth-overlay');
        if (authBtn && authOverlay) {
            authBtn.addEventListener('click', () => {
                authOverlay.style.display = 'flex';
                document.getElementById('auth-login').style.display = 'block';
                document.getElementById('auth-register').style.display = 'none';
            });
        }

        const authClose = document.getElementById('auth-close');
        if (authClose && authOverlay) authClose.addEventListener('click', () => authOverlay.style.display = 'none');

        const toReg = document.getElementById('to-register');
        if (toReg) toReg.addEventListener('click', () => {
            document.getElementById('auth-login').style.display = 'none';
            document.getElementById('auth-register').style.display = 'block';
        });

        const toLogin = document.getElementById('to-login');
        if (toLogin) toLogin.addEventListener('click', () => {
            document.getElementById('auth-login').style.display = 'block';
            document.getElementById('auth-register').style.display = 'none';
        });

        // Final Step: Backend
        tryInitSupabase();
    }

    async function tryInitSupabase() {
        try {
            if (window.supabase) {
                supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                console.log("💎 Backend: Attempting connection...");
                const { data: { session } } = await supabase.auth.getSession();
                currentUser = session?.user || null;
                updateAuthUI();
            }
        } catch (e) {
            console.warn("💎 Backend: Connection bypassed (Invalid or Missing Keys). Features restricted.");
        }
    }

    function updateAuthUI() {
        const btn = document.getElementById('auth-btn');
        if (!btn) return;
        if (currentUser) {
            btn.innerHTML = `<i data-lucide="log-out"></i>`;
            btn.title = `Logged in: ${currentUser.email}`;
        } else {
            btn.innerHTML = `<i data-lucide="user"></i>`;
        }
        if (window.lucide) lucide.createIcons();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
