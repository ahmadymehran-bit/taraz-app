/* ==========================================================================
   TARAZ CORE ENGINE - FINAL VERSION
   Project: TARAZ_STATE_V3_2026_10_21
   ========================================================================== */

// --- [0. CONFIGURATION & CONSTANTS] ---
// نکته: اگر از Supabase استفاده می‌کنی، این مقادیر را از پنل خودت جایگزین کن
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; 
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


// --- [1. SECTION 1: CORE & HELPERS] ---

/**
 * نمایش پیام‌های موقت به کاربر (Toast)
 * @param {string} message - متن پیام
 * @param {string} type - نوع پیام (success, error, info, warning)
 */
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerText = message;
    document.body.appendChild(toast);
    
    // انیمیشن ورود و خروج
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

/**
 * نمایش یا مخفی کردن لودینگ سراسری
 * @param {boolean} isLoading 
 */
function showLoading(isLoading) {
    const loader = document.getElementById('global-loader');
    if (loader) {
        loader.style.display = isLoading ? 'flex' : 'none';
    }
}

/**
 * مدیریت خطاها در سطح سیستم
 */
function handleGlobalError(error, context) {
    console.error(`[TARAZ ERROR] Context: ${context}`, error);
    showToast(`خطا در ${context}: ${error.message || 'خطای نامشخص'}`, 'error');
}

/**
 * تابع کمکی برای فرمت کردن قیمت‌ها (Market Pulse Standard)
 */
function formatPrice(price) {
    if (!price) return '---';
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
}

/**
 * تابع کمکی برای مدیریت زمان (Timestamp)
 */
function getCurrentTimestamp() {
    return new Date().toISOString();
}
// --- [2. SECTION 2: DATABASE & CHAT SERVICES] ---

// مدیریت پروفایل کاربر
async function fetchUserProfile(userId) {
    try {
        const { data, error } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        
        if (error) throw error;
        return data;
    } catch (e) {
        handleGlobalError(e, 'Fetch Profile');
        return null;
    }
}

async function updateProfile(userId, updates) {
    try {
        const { error } = await supabaseClient
            .from('profiles')
            .update(updates)
            .eq('id', userId);
        
        if (error) throw error;
        showToast('پروفایل با موفقیت بروزرسانی شد', 'success');
    } catch (e) {
        handleGlobalError(e, 'Update Profile');
    }
}

// مدیریت چت با فروشنده
async function openChatWithSeller(sellerId, buyerId) {
    try {
        // بررسی وجود چت قبلی یا ایجاد چت جدید
        const { data: existingChat, error: chatError } = await supabaseClient
            .from('chats')
            .select('*')
            .eq('participant_a', sellerId)
            .eq('participant_b', buyerId)
            .single();

        if (chatError && chatError.code !== 'PGRST116') throw chatError;

        if (existingChat) {
            showChatUI(existingChat.id);
        } else {
            const { data: newChat, error: newChatError } = await supabaseClient
                .from('chats')
                .insert([{ participant_a: sellerId, participant_b: buyerId }])
                .select()
                .single();
            
            if (newChatError) throw newChatError;
            showChatUI(newChat.id);
        }
    } catch (e) {
        handleGlobalError(e, 'Open Chat');
    }
}

// مدیریت گزارش‌ها (Reports)
async function reportListing(listingId, reason) {
    try {
        const { error } = await supabaseClient
            .from('reports')
            .insert([{ listing_id: listingId, reason: reason, created_at: getCurrentTimestamp() }]);
        
        if (error) throw error;
        showToast('گزارش شما ارسال شد', 'info');
    } catch (e) {
        handleGlobalError(e, 'Report Listing');
    }
}

async function getMyReports() {
    try {
        const { data: user } = await supabaseClient.auth.getUser();
        if (!user.user) return [];

        const { data, error } = await supabaseClient
            .from('reports')
            .select('*, listings(title, price)')
            .eq('reporter_id', user.user.id);
        
        if (error) throw error;
        return data;
    } catch (e) {
        handleGlobalError(e, 'Get My Reports');
        return [];
    }
}

// مدیریت احراز هویت (Identity Verification)
async function verifyUserIdentity(documentUrl) {
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) throw new Error('کاربر وارد نشده است');

        const { error: uploadError } = await supabaseClient.storage
            .from('identity-docs')
            .upload(`${user.id}/identity.jpg`, documentUrl);

        if (uploadError) throw uploadError;

        const { error: updateError } = await supabaseClient
            .from('profiles')
            .update({ identity_verified: false, verification_status: 'pending' })
            .eq('id', user.id);

        if (updateError) throw updateError;
        showToast('درخواست تایید هویت ارسال شد', 'info');
    } catch (e) {
        handleGlobalError(e, 'Verify Identity');
    }
}

// آمار جهانی (Global Stats)
async function getGlobalStats() {
    try {
        const { data: listings } = await supabaseClient.from('listings').select('id');
        const { data: users } = await supabaseClient.from('profiles').select('id');
        const { data: chats } = await supabaseClient.from('chats').select('id');

        return {
            totalListings: listings?.length || 0,
            totalUsers: users?.length || 0,
            totalChats: chats?.length || 0
        };
    } catch (e) {
        console.error('Error fetching stats:', e);
        return { totalListings: 0, totalUsers: 0, totalChats: 0 };
    }
}
// --- [3. SECTION 3: UI, MAP & LISTINGS] ---

// مدیریت نمایش نقشه (Google Maps / Leaflet)
let map;
let markers = [];

async function initMap() {
    try {
        // فرض بر این است که کتابخانه نقشه در index.html بارگذاری شده است
        const mapContainer = document.getElementById('map-container');
        if (!mapContainer) return;

        // در اینجا فرض می‌کنیم از Leaflet استفاده می‌کنیم (سبک سبک و سریع برای Taraz)
        map = L.map('map-container').setView([35.6892, 51.3890], 5); // مرکز ایران

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        showToast('نقشه با موفقیت بارگذاری شد', 'success');
    } catch (e) {
        console.error('Map Init Error:', e);
        showToast('خطا در بارگذاری نقشه', 'error');
    }
}

async function updateMapMarkers(listings) {
    // پاک کردن مارکرهای قبلی
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    listings.forEach(item => {
        if (item.lat && item.lng) {
            const marker = L.marker([item.lat, item.lng])
                .addTo(map)
                .bindPopup(`<b>${item.title}</b><br>${formatPrice(item.price)}`);
            markers.push(marker);
        }
    });
}

// مدیریت نمایش لیست آگهی‌ها
async function renderListings(listings) {
    const container = document.getElementById('listings-container');
    if (!container) return;

    container.innerHTML = ''; // پاکسازی لیست قبلی

    if (listings.length === 0) {
        container.innerHTML = '<div class="empty-state">هیچ آگهی نزدیکی یافت نشد.</div>';
        return;
    }

    listings.forEach(item => {
        const card = document.createElement('div');
        card.className = 'listing-card';
        card.innerHTML = `
            <div class="card-image" style="background-image: url('${item.image_url || 'placeholder.webp'}')"></div>
            <div class="card-content">
                <h3>${item.title}</h3>
                <p class="category">${item.category}</p>
                <p class="price">${formatPrice(item.price)}</p>
                <button class="btn-view" onclick="viewListingDetails('${item.id}')">مشاهده جزئیات</button>
            </div>
        `;
        container.appendChild(card);
    });
}

// جستجوی پیشرفته (Market Pulse Logic)
async function searchListings(filters) {
    showLoading(true);
    try {
        let query = supabaseClient.from('listings').select('*');

        if (filters.category) {
            query = query.eq('category', filters.category);
        }
        if (filters.maxPrice) {
            query = query.lte('price', filters.maxPrice);
        }
        if (filters.searchQuery) {
            query = query.ilike('title', `%${filters.searchQuery}%`);
        }

        const { data, error } = await query;
        if (error) throw error;

        await renderListings(data);
        await updateMapMarkers(data);
        
        showToast('جستجو با موفقیت انجام شد', 'success');
    } catch (e) {
        handleGlobalError(e, 'Search Listings');
    } finally {
        showLoading(false);
    }
}

// نمایش جزئیات یک آگهی خاص
async function viewListingDetails(listingId) {
    try {
        showLoading(true);
        const { data, error } = await supabaseClient
            .from('listings')
            .select('*')
            .eq('id', listingId)
            .single();

        if (error) throw error;

        // باز کردن مدال جزئیات (فرض بر وجود این مدال در HTML است)
        const modal = document.getElementById('details-modal');
        if (modal) {
            modal.querySelector('.modal-title').innerText = data.title;
            modal.querySelector('.modal-price').innerText = formatPrice(data.price);
            modal.querySelector('.modal-desc').innerText = data.description;
            modal.classList.add('open');
        }
    } catch (e) {
        handleGlobalError(e, 'View Details');
    } finally {
        showLoading(false);
    }
}
// --- [4. SECTION 4: AUTH, SESSION & INITIALIZATION] ---

// مدیریت نشست و وضعیت ورود
async function checkAuthStatus() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (session) {
        // کاربر وارد شده است
        updateUIForLoggedInUser(session.user);
        return session.user;
    } else {
        // کاربر وارد نشده است
        updateUIForLoggedOutUser();
        return null;
    }
}

function updateUIForLoggedInUser(user) {
    // تغییر دکمه‌های منو از "ورود" به "پروفایل"
    const authBtn = document.getElementById('auth-button');
    if (authBtn) {
        authBtn.innerText = 'پروفایل من';
        authBtn.onclick = () => showProfileMenu(user.id);
    }
    // نمایش پروفایل کاربر در هدر
    const userAvatar = document.getElementById('user-avatar');
    if (userAvatar) userAvatar.style.display = 'block';
}

function updateUIForLoggedOutUser() {
    const authBtn = document.getElementById('auth-button');
    if (authBtn) {
        authBtn.innerText = 'ورود / ثبت‌نام';
        authBtn.onclick = () => showLoginModal();
    }
    const userAvatar = document.getElementById('user-avatar');
    if (userAvatar) userAvatar.style.display = 'none';
}

// خروج از حساب کاربری
async function handleLogout() {
    try {
        showLoading(true);
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;

        showToast('با موفقیت خارج شدید', 'success');
        updateUIForLoggedOutUser();
        // بازگشت به صفحه اصلی یا ریست کردن وضعیت
        window.location.reload(); 
    } catch (e) {
        handleGlobalError(e, 'Logout');
    } finally {
        showLoading(false);
    }
}

// حذف حساب کاربری (امنیت بالا)
async function deleteUserAccount(userId) {
    const confirmDelete = confirm('آیا از حذف دائمی حساب خود مطمئن هستید؟ این عمل غیرقابل بازگشت است.');
    if (!confirmDelete) return;

    try {
        showLoading(true);
        // ۱. حذف داده‌های مرتبط در Supabase
        const { error: listingsError } = await supabaseClient.from('listings').delete().eq('owner_id', userId);
        if (listingsError) throw listingsError;

        // ۲. حذف پروفایل
        const { error: profileError } = await supabaseClient.from('profiles').delete().eq('id', userId);
        if (profileError) throw profileError;

        // ۳. حذف خود کاربر از Auth
        const { error: authError } = await supabaseClient.auth.admin.deleteUser(userId);
        if (authError) throw authError;

        showToast('حساب شما با موفقیت حذف شد', 'success');
        window.location.href = 'index.html';
    } catch (e) {
        handleGlobalError(e, 'Delete Account');
    } finally {
        showLoading(false);
    }
}

// مدیریت تنظیمات اعلان‌ها
async function toggleNotificationSettings(userId, status) {
    try {
        const { error } = await supabaseClient
            .from('profiles')
            .update({ notifications_enabled: status })
            .eq('id', userId);
        
        if (error) throw error;
        showToast('تنظیمات اعلان تغییر کرد', 'success');
    } catch (e) {
        handleGlobalError(e, 'Toggle Notifications');
    }
}

// مدیریت بستن مدال‌ها
function closeAllModals() {
    const modals = document.querySelectorAll('.modal.open');
    modals.forEach(modal => modal.classList.remove('open'));
}

// --- [5. INITIALIZATION (The Engine Start)] ---

document.addEventListener('DOMContentLoaded', async () => {
    console.log('%c TARAZ ENGINE STARTING...', 'color: #00ff00; font-weight: bold;');
    
    // ۱. بررسی وضعیت احراز هویت
    const user = await checkAuthStatus();

    // ۲. مقداردهی اولیه نقشه
    await initMap();

    // ۳. بارگذاری آگهی‌های اولیه (Market Pulse)
    try {
        const { data: initialListings, error } = await supabaseClient
            .from('listings')
            .select('*')
            .limit(10);
        
        if (error) throw error;
        await renderListings(initialListings);
        await updateMapMarkers(initialListings);
    } catch (e) {
        handleGlobalError(e, 'Initial Load');
    }

    // ۴. دریافت آمار جهانی برای نمایش در داشبورد
    const stats = await getGlobalStats();
    const statsEl = document.getElementById('global-stats-count');
    if (statsEl) {
        statsEl.innerText = `${stats.totalListings} آگهی فعال`;
    }

    console.log('%c TARAZ ENGINE READY.', 'color: #00ff00; font-weight: bold;');
});
