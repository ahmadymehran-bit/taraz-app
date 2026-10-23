/* ==========================================================================
   TARAZ CORE ENGINE - SECTION 1 (PART 1/5)
   ========================================================================== */

const CONFIG = {
    SUPABASE_URL: 'https://ybtjatkxsagsgathvjoe.supabase.co',
    SUPABASE_KEY: 'sb_publishable_X8F1n-nhXl3YhDNZ7SeRTg_U280aKuX',
    VERSION: 'V3_2026_10_21'
};

let DB = {
    user: null,
    listings: [],
    conversations: [],
    settings: {},
    cache: {}
};

let supabaseClient = null;

async function initSupabase() {
    try {
        const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
        supabaseClient = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);
        console.log('Supabase initialized');
        return true;
    } catch (e) {
        console.error('Supabase init failed:', e);
        return false;
    }
}

function FA_DIGITS() {
    return '۰۱۲۳۴۵۶۷۸۹';
}

function toPersianDigits(num) {
    const s = String(num);
    const digits = '۰۱۲۳۴۵۶۷۸۹';
    return s.replace(/\d/g, (d) => digits[d]);
}

function fromPersianDigits(s) {
    const digits = '۰۱۲۳۴۵۶۷۸۹';
    const eng = '0123456789';
    return s.replace(/[۰-۹]/g, (d) => eng[digits.indexOf(d)]);
}

// [ادامه کدهای شما...]
/* ==========================================================================
   TARAZ CORE ENGINE - SECTION 1 (PART 2/5)
   ========================================================================== */

// [ادامه کدهای شما - از حدود خط ۵۰ تا ۱۸۰]

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
        console.error('Error fetching profile:', e);
        return null;
    }
}

async function updateProfile(userId, updates) {
    try {
        const { data, error } = await supabaseClient
            .from('profiles')
            .update(updates)
            .eq('id', userId);

        if (error) throw error;
        return data;
    } catch (e) {
        console.error('Error updating profile:', e);
        return null;
    }
}

async function fetchListings(filters = {}) {
    try {
        let query = supabaseClient.from('listings').select('*');

        if (filters.category) {
            query = query.eq('category', filters.category);
        }
        if (filters.city) {
            query = query.eq('city', filters.city);
        }
        if (filters.priceMax) {
            query = query.lte('price', filters.priceMax);
        }
        if (filters.search) {
            query = query.ilike('title', `%${filters.search}%`);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    } catch (e) {
        console.error('Error fetching listings:', e);
        return [];
    }
}

async function postListing(listingData) {
    try {
        const { data, error } = await supabaseClient
            .from('listings')
            .insert([listingData])
            .select();

        if (error) throw error;
        return data[0];
    } catch (e) {
        console.error('Error posting listing:', e);
        return null;
    }
}

// [ادامه کدهای شما...]
/* ==========================================================================
   TARAZ CORE ENGINE - SECTION 1 (PART 3/5)
   ========================================================================== */

// [ادامه کدهای شما - از حدود خط ۱۸۰ تا ۳۵۰]

async function getListingsByCategory(category) {
    const allListings = await fetchListings();
    return allListings.filter(l => l.category === category);
}

async function getListingsByCity(city) {
    return await fetchListings({ city });
}

async function deleteListing(listingId) {
    try {
        const { error } = await supabaseClient
            .from('listings')
            .delete()
            .eq('id', listingId);

        if (error) throw error;
        return true;
    } catch (e) {
        console.error('Error deleting listing:', e);
        return false;
    }
}

async function updateListing(listingId, updates) {
    try {
        const { error } = await supabaseClient
            .from('listings')
            .update(updates)
            .eq('id', listingId);

        if (error) throw error;
        return true;
    } catch (e) {
        console.error('Error updating listing:', e);
        return false;
    }
}

async function fetchComments(listingId) {
    try {
        const { data, error } = await supabaseClient
            .from('comments')
            .select('*')
            .eq('listing_id', listingId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data;
    } catch (e) {
        console.error('Error fetching comments:', e);
        return [];
    }
}

async function addComment(listingId, userId, content) {
    try {
        const { data, error } = await supabaseClient
            .from('comments')
            .insert([{ listing_id: listingId, user_id: userId, content }])
            .select();

        if (error) throw error;
        return data[0];
    } catch (e) {
        console.error('Error adding comment:', e);
        return null;
    }
}

// [ادامه کدهای شما...]
/* ==========================================================================
   TARAZ CORE ENGINE - SECTION 1 (PART 4/5)
   ========================================================================== */

// [ادامه کدهای شما - از حدود خط ۳۵۰ تا ۵۲۰]

async function fetchUserConversations(userId) {
    try {
        const { data, error } = await supabaseClient
            .from('conversations')
            .select(`
                *,
                messages (
                    id,
                    sender_id,
                    content,
                    created_at
                )
            `)
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });

        if (error) throw error;
        return data;
    } catch (e) {
        console.error('Error fetching conversations:', e);
        return [];
    }
}

async function sendMessage(conversationId, senderId, content) {
    try {
        const { data, error } = await supabaseClient
            .from('messages')
            .insert([{ 
                conversation_id: conversationId, 
                sender_id: senderId, 
                content: content 
            }])
            .select();

        if (error) throw error;

        // Update conversation timestamp
        await supabaseClient
            .from('conversations')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', conversationId);

        return data[0];
    } catch (e) {
        console.error('Error sending message:', e);
        return null;
    }
}

async function fetchMessages(conversationId) {
    try {
        const { data, error } = await supabaseClient
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data;
    } catch (e) {
        console.error('Error fetching messages:', e);
        return [];
    }
}

// [ادامه کدهای شما...]
/* ==========================================================================
   TARAZ CORE ENGINE - SECTION 1 (PART 5/5)
   ========================================================================== */

// [ادامه کدهای شما - از حدود خط ۵۲۰ تا ۹۴۴]

async function checkAuthStatus() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
        DB.user = session.user;
        return true;
    }
    return false;
}

async function handleLogout() {
    try {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;
        DB.user = null;
        location.reload();
        return true;
    } catch (e) {
        console.error('Logout error:', e);
        return false;
    }
}

async function uploadImage(file) {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `listings/${fileName}`;

        let { error: uploadError } = await supabaseClient.storage
            .from('taraz-storage')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabaseClient.storage
            .from('taraz-storage')
            .getPublicUrl(filePath);

        return data.publicUrl;
    } catch (e) {
        console.error('Image upload failed:', e);
        return null;
    }
}

function validateListing(data) {
    if (!data.title || data.title.length < 5) return 'عنوان باید حداقل ۵ کاراکتر باشد';
    if (!data.price || data.price <= 0) return 'قیمت معتبر نیست';
    if (!data.category) return 'انتخاب دسته بندی الزامی است';
    return null;
}

// [پایان بخش اول - آمادگی برای بخش دوم شامل توابع Chat در خط ۹۴۵]
/* ==========================================================================
   TARAZ CORE ENGINE - SECTION 2 (PART 1/5)
   DATABASE & CHAT SERVICES
   ========================================================================== */

// [شروع از خط ۹۴۵]

/**
 * باز کردن چت با فروشنده بر اساس شناسه آگهی
 * @param {string} listingId 
 */
async function openChatWithSeller(listingId) {
    try {
        const listing = DB.listings.find(l => l.id === listingId);
        if (!listing) throw new Error('Listing not found');
        if (!DB.user) throw new Error('Please login first');

        const sellerId = listing.user_id;
        if (sellerId === DB.user.id) throw new Error('You cannot chat with yourself');

        // پیدا کردن اطلاعات فروشنده برای نمایش در هدر چت
        const { data: sellerData, error: sellerError } = await supabaseClient
            .from('profiles')
            .select('id, full_name, avatar_url, phone')
            .eq('id', sellerId)
            .single();

        if (sellerError) throw sellerError;

        // ایجاد یا دریافت گفتگو
        const conversation = await getOrCreateConv(
            listingId, 
            sellerData.phone, 
            sellerData.full_name
        );

        if (conversation) {
            // فراخوانی تابع UI برای باز کردن مودال چت (در بخش سوم تعریف شده)
            uiOpenChatModal(conversation, sellerData, listing);
        }
    } catch (e) {
        console.error('Error in openChatWithSeller:', e);
        alert(e.message || 'خطا در باز کردن چت');
    }
}

/**
 * ایجاد یا یافتن گفتگوی موجود بین کاربر و فروشنده
 * @param {string} listingId 
 * @param {string} otherPhone 
 * @param {string} otherName 
 */
async function getOrCreateConv(listingId, otherPhone, otherName) {
    try {
        // ابتدا بررسی می‌کنیم آیا گفتگویی با این مشخصات از قبل وجود دارد یا خیر
        // (در اینجا منطق جستجو بر اساس کاربر فعلی و فروشنده است)
        
        const { data: existingConv, error: searchError } = await supabaseClient
            .from('conversations')
            .select('*')
            .eq('participant_1', DB.user.id)
            .or(`participant_2.eq.${DB.user.id}`) // این بخش باید با منطق دیتابیس شما مطابقت داشته باشد
            .single();

        // اگر وجود نداشت، یک گفتگو ایجاد می‌کنیم
        if (searchError || !existingConv) {
            const { data: newConv, error: createError } = await supabaseClient
                .from('conversations')
                .insert([{
                    listing_id: listingId,
                    participant_1: DB.user.id,
                    participant_2: (await getSellerIdByPhone(otherPhone)), // تابع کمکی احتمالی
                    last_message: '',
                    updated_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (createError) throw createError;
            return newConv;
        }

        return existingConv;
    } catch (e) {
        console.error('Error in getOrCreateConv:', e);
        return null;
    }
}

// [ادامه کدهای شما...]
/* ==========================================================================
   TARAZ CORE ENGINE - SECTION 2 (PART 2/5)
   CONTINUED: DATABASE & CHAT SERVICES
   ========================================================================== */

// [ادامه کدهای شما - مربوط به مدیریت پیام‌ها و ارتباطات]

async function fetchMessagesForConversation(conversationId) {
    try {
        const { data, error } = await supabaseClient
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data;
    } catch (e) {
        console.error('Error fetching messages:', e);
        return [];
    }
}

async function markConversationAsRead(conversationId) {
    try {
        const { error } = await supabaseClient
            .from('conversations')
            .update({ last_read_at: new Date().toISOString() })
            .eq('id', conversationId);

        if (error) throw error;
    } catch (e) {
        console.error('Error marking as read:', e);
    }
}

async function getUnreadCount(userId) {
    try {
        const { count, error } = await supabaseClient
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('receiver_id', userId)
            .eq('is_read', false);

        if (error) throw error;
        return count || 0;
    } catch (e) {
        console.error('Error getting unread count:', e);
        return 0;
    }
}

// تابع کمکی برای یافتن ID فروشنده از طریق شماره (در صورت نیاز)
async function getSellerIdByPhone(phone) {
    try {
        const { data, error } = await supabaseClient
            .from('profiles')
            .select('id')
            .eq('phone', phone)
            .single();
        
        if (error) throw error;
        return data.id;
    } catch (e) {
        console.error('Error finding seller by phone:', e);
        return null;
    }
}

// [ادامه کدهای شما...]
/* ==========================================================================
   TARAZ CORE ENGINE - SECTION 2 (PART 3/5)
   CONTINUED: DATABASE & CHAT SERVICES
   ========================================================================== */

// [ادامه کدهای شما - مدیریت اعلان‌ها و سیستم امتیازدهی]

async function createNotification(userId, title, content, type) {
    try {
        const { error } = await supabaseClient
            .from('notifications')
            .insert([{
                user_id: userId,
                title: title,
                content: content,
                type: type,
                is_read: false,
                created_at: new Date().toISOString()
            }]);

        if (error) throw error;
        return true;
    } catch (e) {
        console.error('Error creating notification:', e);
        return false;
    }
}

async function getNotifications(userId) {
    try {
        const { data, error } = await supabaseClient
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    } catch (e) {
        console.error('Error fetching notifications:', e);
        return [];
    }
}

async function markNotificationAsRead(notificationId) {
    try {
        const { error } = await supabaseClient
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId);

        if (error) throw error;
    } catch (e) {
        console.error('Error marking notification as read:', e);
    }
}

async function submitReview(reviewData) {
    try {
        // reviewData: { target_user_id, rating, comment, listing_id }
        const { data, error } = await supabaseClient
            .from('reviews')
            .insert([reviewData])
            .select();

        if (error) throw error;
        return data[0];
    } catch (e) {
        console.error('Error submitting review:', e);
        return null;
    }
}

// [ادامه کدهای شما...]
/* ==========================================================================
   TARAZ CORE ENGINE - SECTION 2 (PART 4/5)
   CONTINUED: DATABASE & CHAT SERVICES
   ========================================================================== */

// [ادامه کدهای شما - مدیریت سیستم گزارش‌دهی و امنیت]

async function reportListing(listingId, reporterId, reason) {
    try {
        const { error } = await supabaseClient
            .from('reports')
            .insert([{
                listing_id: listingId,
                reporter_id: reporterId,
                reason: reason,
                status: 'pending',
                created_at: new Date().toISOString()
            }]);

        if (error) throw error;
        return true;
    } catch (e) {
        console.error('Error reporting listing:', e);
        return false;
    }
}

async function getMyReports(userId) {
    try {
        const { data, error } = await supabaseClient
            .from('reports')
            .select('*, listings(title)')
            .eq('reporter_id', userId);

        if (error) throw error;
        return data;
    } catch (e) {
        console.error('Error fetching my reports:', e);
        return [];
    }
}

async function verifyUserIdentity(userId, documentUrl) {
    try {
        const { error } = await supabaseClient
            .from('profiles')
            .update({ identity_verified: true, identity_doc_url: documentUrl })
            .eq('id', userId);

        if (error) throw error;
        return true;
    } catch (e) {
        console.error('Error verifying identity:', e);
        return false;
    }
}

// [ادامه کدهای شما...]
/* ==========================================================================
   TARAZ CORE ENGINE - SECTION 2 (PART 5/5)
   CONTINUED: DATABASE & CHAT SERVICES
   ========================================================================== */

// [ادامه کدهای شما - تا رسیدن به مرز بخش سوم]

async function getGlobalStats() {
    try {
        const [listingsRes, usersRes] = await Promise.all([
            supabaseClient.from('listings').select('*', { count: 'exact', head: true }),
            supabaseClient.from('profiles').select('*', { count: 'exact', head: true })
        ]);

        if (listingsRes.error || usersRes.error) throw new Error('Failed to fetch stats');

        return {
            totalListings: listingsRes.count,
            totalUsers: usersRes.count
        };
    } catch (e) {
        console.error('Error fetching global stats:', e);
        return { totalListings: 0, totalUsers: 0 };
    }
}

// [پایان بخش دوم - آماده برای ورود به بخش سوم: UI, Map & Events]
/* ==========================================================================
   TARAZ CORE ENGINE - SECTION 3 (PART 1/6)
   UI, MAP & EVENT LISTENERS
   ========================================================================== */

// [شروع کدهای مربوط به مدیریت DOM و المنت‌های صفحه]

document.addEventListener('DOMContentLoaded', () => {
    // Initializing basic UI elements
    const appContainer = document.getElementById('app-container');
    const mapView = document.getElementById('map-view');
    const listView = document.getElementById('list-view');
    const loadingOverlay = document.getElementById('loading-overlay');
    const authModal = document.getElementById('auth-modal');
    const chatModal = document.getElementById('chat-modal');

    if (loadingOverlay) {
        setTimeout(() => {
            loadingOverlay.style.opacity = '0';
            setTimeout(() => loadingOverlay.style.display = 'none', 500);
        }, 1000);
    }

    // Setup Event Listeners for Navigation
    setupNavigationListeners(mapView, listView);
    setupAuthListeners(authModal);
    setupChatListeners(chatModal);
    setupMapListeners();
});

function setupNavigationListeners(mapView, listView) {
    const btnMap = document.getElementById('nav-map');
    const btnList = document.getElementById('nav-list');

    if (btnMap && btnList) {
        btnMap.addEventListener('click', () => {
            showView('map');
            initMap(); // Trigger map rendering
        });

        btnList.addEventListener('click', () => {
            showView('list');
            fetchListings();
        });
    }
}

function showView(viewName) {
    const mapView = document.getElementById('map-view');
    const listView = document.getElementById('list-view');

    if (viewName === 'map') {
        mapView.style.display = 'block';
        listView.style.display = 'none';
        document.querySelector('.nav-item.active')?.classList.remove('active');
        document.getElementById('nav-map').classList.add('active');
    } else {
        mapView.style.display = 'none';
        listView.style.display = 'block';
        document.querySelector('.nav-item.active')?.classList.remove('active');
        document.getElementById('nav-list').classList.add('active');
    }
}

// [ادامه کدهای مربوط به مدیریت Modal ها و Form ها...]
/* ==========================================================================
   TARAZ CORE ENGINE - SECTION 3 (PART 2/6)
   MAP INTEGRATION & GEOLOCATION
   ========================================================================== */

// [ادامه مدیریت نقشه و کدهای مربوط به Google Maps]

let map;
let markers = [];
let userLocation = null;

async function initMap() {
    if (!window.google || !document.getElementById('main-map')) {
        console.warn('Google Maps not loaded or map container missing');
        return;
    }

    // Prevent re-initializing if map already exists
    if (map) return;

    try {
        const container = document.getElementById('main-map');
        
        // Check if container exists to prevent the common "main-map" error
        if (!container) {
            console.error('Critical Error: <div id="main-map"></div> not found in index.html');
            return;
        }

        // Get user current location or default to Tehran
        userLocation = await getCurrentLocation();

        map = new google.maps.Map(container, {
            center: userLocation,
            zoom: 12,
            disableDefaultUI: true,
            styles: tarazMapStyle // Uses the custom dark/clean theme defined in constants
        });

        // Add custom map controls (Zoom, My Location)
        const zoomControl = map.getZoomControl();
        map.setControls([zoomControl]);

        // Listen for map clicks to place/move marker (for posting)
        map.addListener('click', (event) => {
            handleMapClick(event.latLng);
        });

        // Initial marker load
        loadMarkersOnMap();

    } catch (error) {
        console.error('Failed to initialize map:', error);
    }
}

async function getCurrentLocation() {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            resolve({ lat: 35.6892, lng: 51.3890 }); // Default Tehran
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                resolve({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                });
            },
            () => {
                resolve({ lat: 35.6892, lng: 51.3890 }); // Fallback
            },
            { enableHighAccuracy: true, timeout: 5000 }
        );
    });
}

function handleMapClick(latLng) {
    // Logic for adding a new listing pin or moving current pin
    if (window.isPostingNewListing) {
        updatePendingMarker(latLng);
    }
}

// [ادامه کدهای مربوط به مدیریت مارکرها (Markers)...]
/* ==========================================================================
   TARAZ CORE ENGINE - SECTION 3 (PART 3/6)
   MARKER MANAGEMENT & INFOWINDOWS
   ========================================================================== */

// [ادامه کدهای مربوط به نمایش آگهی‌ها روی نقشه]

async function loadMarkersOnMap() {
    if (!map || markers.length > 0) {
        clearMarkers();
    }

    try {
        const listings = await fetchListings(true); // true for fetch only, no UI refresh
        
        listings.forEach(listing => {
            if (listing.lat && listing.lng) {
                const marker = createListingMarker(listing);
                marker.setMap(map);
                markers.push(marker);
            }
        });
    } catch (e) {
        console.error('Error loading markers:', e);
    }
}

function createListingMarker(listing) {
    const marker = new google.maps.Marker({
        position: { lat: parseFloat(listing.lat), lng: parseFloat(listing.lng) },
        map: map,
        title: listing.title,
        icon: {
            url: listing.image_url ? listing.image_url : 'assets/icons/default-marker.png',
            scaledSize: new google.maps.Size(40, 40)
        }
    });

    const infoWindow = new google.maps.InfoWindow({
        content: createMarkerInfoWindow(listing)
    });

    marker.addListener('click', () => {
        infoWindow.open(map, marker);
    });

    return marker;
}

function createMarkerInfoWindow(listing) {
    const div = document.createElement('div');
    div.className = 'map-info-window';
    div.innerHTML = `
        <div class="info-card">
            <img src="${listing.image_url || 'assets/img/placeholder.png'}" alt="${listing.title}">
            <div class="info-content">
                <h4>${listing.title}</h4>
                <p class="price">${formatPrice(listing.price)} تومان</p>
                <button class="btn-view-detail" onclick="viewListingDetails('${listing.id}')">مشاهده جزئیات</button>
            </div>
        </div>
    `;
    return div;
}

function clearMarkers() {
    markers.forEach(m => m.setMap(null));
    markers = [];
}

// [ادامه کدهای مربوط به مدیریت رویدادهای کلیک و تعاملات کاربر...]
/* ==========================================================================
   TARAZ CORE ENGINE - SECTION 3 (PART 4/6)
   FORMS, AUTH MODALS & UI INTERACTION
   ========================================================================== */

// [ادامه کدهای مربوط به تعاملات کاربر با فرم‌ها و مودال‌ها]

function setupAuthListeners(modal) {
    const loginBtn = document.getElementById('login-submit');
    const signupBtn = document.getElementById('signup-submit');
    const closeBtn = document.getElementById('auth-close');

    if (loginBtn) {
        loginBtn.addEventListener('click', handleAuthSubmit);
    }

    if (signupBtn) {
        signupBtn.addEventListener('click', handleAuthSubmit);
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
}

async function handleAuthSubmit(e) {
    e.preventDefault();
    const form = e.target.closest('form');
    const formData = new FormData(form);
    const email = formData.get('email');
    const password = formData.get('password');
    const isSignUp = form.id === 'signup-form';

    showLoading(true);
    try {
        let error;
        if (isSignUp) {
            const { data, error: signupError } = await supabaseClient.auth.signUp({
                email,
                password,
                options: { data: { full_name: formData.get('name') } }
            });
            error = signupError;
            if (data?.user) await createProfile(data.user.id, formData.get('name'), email);
        } else {
            const { data, error: loginError } = await supabaseClient.auth.signInWithPassword({
                email,
                password
            });
            error = loginError;
        }

        if (error) throw error;
        
        // Success: Refresh UI
        await updateAuthUI();
        closeModal('auth-modal');
        showToast('خوش آمدید', 'success');
    } catch (err) {
        showToast(err.message, 'error');
    } finally {
        showLoading(false);
    }
}

function setupChatListeners(modal) {
    const closeChat = document.getElementById('chat-close');
    if (closeChat) {
        closeChat.addEventListener('click', () => closeModal('chat-modal'));
    }
}

// [ادامه کدهای مربوط به مدیریت Toast و Loading...]
/* ==========================================================================
   TARAZ CORE ENGINE - SECTION 3 (PART 5/6)
   FEEDBACK (TOAST/LOADING) & POSTING LOGIC
   ========================================================================== */

// [ادامه مدیریت نمایش وضعیت‌های سیستمی و فرم ثبت آگهی]

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerText = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

function showLoading(show) {
    const loader = document.getElementById('loading-overlay');
    if (loader) {
        loader.style.display = show ? 'flex' : 'none';
    }
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = 'none';
}

async function handlePostListingSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    showLoading(true);
    try {
        const listingData = {
            title: formData.get('title'),
            description: formData.get('description'),
            price: parseInt(formData.get('price')),
            category: formData.get('category'),
            city: formData.get('city'),
            lat: formData.get('lat'),
            lng: formData.get('lng'),
            user_id: (await supabaseClient.auth.getUser()).data.user.id
        };

        // Handle Image Upload first
        const imageFile = form.querySelector('input[type="file"]').files[0];
        let image_url = '';
        if (imageFile) {
            image_url = await uploadImage(imageFile);
            listingData.image_url = image_url;
        }

        const { error } = await supabaseClient.from('listings').insert([listingData]);
        if (error) throw error;

        showToast('آگهی با موفقیت ثبت شد', 'success');
        closeModal('post-listing-modal');
        fetchListings(); // Refresh list
    } catch (err) {
        showToast('خطا در ثبت آگهی: ' + err.message, 'error');
    } finally {
        showLoading(false);
    }
}

// [ادامه کدهای مربوط به مدیریت تصاویر و آپلود...]
/* ==========================================================================
   TARAZ CORE ENGINE - SECTION 3 (PART 6/6)
   FINAL UI UTILITIES & EVENT LISTENERS
   ========================================================================== */

// [پایان بخش سوم - کدهای مربوط به مدیریت رویدادهای نهایی]

function setupMapListeners() {
    // Listen for window resize to adjust map
    window.addEventListener('resize', () => {
        if (map) google.maps.event.trigger(map, 'resize');
    });

    // Global click listener to close modals when clicking outside
    document.addEventListener('click', (e) => {
        const modals = ['auth-modal', 'chat-modal', 'post-listing-modal'];
        modals.forEach(id => {
            const modal = document.getElementById(id);
            if (modal && modal.style.display !== 'none') {
                if (!modal.contains(e.target) && !e.target.closest(`#${id}-close`)) {
                    // Note: Only close if it's not a critical interaction
                    // closeModal(id); 
                }
            }
        });
    });
}

function formatPrice(price) {
    if (!price) return '۰';
    return new Intl.NumberFormat('fa-IR').format(price);
}

// [این انتهای بخش سوم است. بلافاصله وارد بخش چهارم و پایانی می‌شویم]
/* ==========================================================================
   TARAZ CORE ENGINE - SECTION 4 (PART 1/4)
   USER PROFILE & SETTINGS MANAGEMENT
   ========================================================================== */

// [شروع کدهای مربوط به مدیریت پروفایل کاربر و تنظیمات]

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
        console.error('Error fetching profile:', e);
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
        showToast('پروفایل با موفقیت به‌روزرسانی شد', 'success');
        return true;
    } catch (e) {
        showToast('خطا در به‌روزرسانی پروفایل', 'error');
        return false;
    }
}

async function handleProfileFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) return;

    const updates = {
        full_name: formData.get('name'),
        phone: formData.get('phone'),
        bio: formData.get('bio'),
        avatar_url: formData.get('avatar_url')
    };

    showLoading(true);
    const success = await updateProfile(user.id, updates);
    showLoading(false);

    if (success) {
        closeModal('profile-modal');
        await refreshUIState();
    }
}

// [ادامه کدهای مربوط به مدیریت تنظیمات حساب کاربری...]
/* ==========================================================================
   TARAZ CORE ENGINE - SECTION 4 (PART 2/4)
   ACCOUNT SECURITY & NOTIFICATIONS
   ========================================================================== */

// [ادامه کدهای مربوط به امنیت حساب و مدیریت اعلان‌ها]

async function deleteUserAccount(userId) {
    if (!confirm('آیا از حذف دائمی حساب کاربری خود اطمینان دارید؟ این عملیات غیرقابل بازگشت است.')) {
        return;
    }

    showLoading(true);
    try {
        // 1. Delete user's listings
        await supabaseClient.from('listings').delete().eq('user_id', userId);
        
        // 2. Delete user's profile
        await supabaseClient.from('profiles').delete().eq('id', userId);

        // 3. Sign out from Supabase
        await supabaseClient.auth.signOut();

        showToast('حساب کاربری شما حذف شد', 'info');
        window.location.reload();
    } catch (e) {
        console.error('Error deleting account:', e);
        showToast('خطا در حذف حساب کاربری', 'error');
    } finally {
        showLoading(false);
    }
}

async function toggleNotificationSettings(userId, settings) {
    try {
        const { error } = await supabaseClient
            .from('user_settings')
            .upsert({ 
                user_id: userId, 
                ...settings,
                updated_at: new Date().toISOString()
            });

        if (error) throw error;
        showToast('تنظیمات ذخیره شد', 'success');
    } catch (e) {
        showToast('خطا در ذخیره تنظیمات', 'error');
    }
}

// [ادامه کدهای مربوط به مدیریت نشست‌ها (Sessions)...]
/* ==========================================================================
   TARAZ CORE ENGINE - SECTION 4 (PART 3/4)
   SESSION & AUTH STATE MANAGEMENT
   ========================================================================== */

// [ادامه مدیریت وضعیت ورود و خروج کاربر]

async function refreshUIState() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    const authBtn = document.getElementById('auth-btn');
    const profileIcon = document.getElementById('profile-icon');
    const userDisplayName = document.getElementById('user-display-name');

    if (user) {
        // User is logged in
        if (authBtn) authBtn.innerText = 'خروج';
        if (profileIcon) profileIcon.style.display = 'block';
        if (userDisplayName) {
            const profile = await fetchUserProfile(user.id);
            userDisplayName.innerText = profile?.full_name || 'کاربر';
        }
    } else {
        // User is logged out
        if (authBtn) authBtn.innerText = 'ورود / ثبت‌نام';
        if (profileIcon) profileIcon.style.display = 'none';
        if (userDisplayName) userDisplayName.innerText = '';
    }
}

async function handleLogout() {
    try {
        showLoading(true);
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;
        
        showToast('خروج با موفقیت انجام شد', 'info');
        await refreshUIState();
        window.location.reload();
    } catch (e) {
        showToast('خطا در خروج از حساب', 'error');
    } finally {
        showLoading(false);
    }
}

// [ادامه کدهای مربوط به مانیتورینگ و مدیریت خطا...]
/* ==========================================================================
   TARAZ CORE ENGINE - SECTION 4 (PART 4/4)
   FINAL EVENT LISTENERS & INITIALIZATION
   ========================================================================== */

// [ادامه کدهای مربوط به مدیریت رویدادهای نهایی و راه‌اندازی کل سیستم]

// 1. Initial Application Boot
document.addEventListener('DOMContentLoaded', async () => {
    console.log('TARAZ System Initializing...');
    
    // Initialize UI components
    initNavigation();
    initAuthListeners();
    initFormHandlers();
    initMapLogic(); // Including fallback checks
    
    // Check user session status immediately
    await refreshUIState();
    
    // Setup Toast system and Global Listeners
    setupGlobalListeners();
    
    console.log('TARAZ System Ready.');
});

// 2. Global Event Listeners (Window/Document)
function setupGlobalListeners() {
    // Handle Escape key to close modals
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });

    // Handle Online/Offline status
    window.addEventListener('online', () => showToast('شما آنلاین هستید', 'success'));
    window.addEventListener('offline', () => showToast('اتصال اینترنت قطع شد', 'error'));

    // Handle clicks outside of modals to close them
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            closeAllModals();
        }
    });
}

// 3. Global Utility: Close all active UI components
function closeAllModals() {
    const modals = document.querySelectorAll('.modal-container');
    modals.forEach(modal => {
        modal.classList.remove('active');
        modal.style.display = 'none';
    });
    hideLoading();
}

/* 
   ==========================================================================
   END OF SCRIPT.JS - TARAZ_STATE_V3_CLEAN
   ========================================================================== 
*/
