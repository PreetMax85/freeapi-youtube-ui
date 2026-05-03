const API_BASE_URL = 'https://api.freeapi.app/api/v1/public/youtube/videos';
const videoGrid = document.getElementById('video-grid');
const skeletonContainer = document.getElementById('skeleton-container');
const errorContainer = document.getElementById('error-container');
const loadMoreBtn = document.getElementById('load-more-btn');
const retryBtn = document.getElementById('retry-btn');

let currentPage = 1;
const limit = 12;
let isLoading = false;

// Formatters from GEMINI.md
function formatViews(n) {
    if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B views';
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M views';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K views';
    return n + ' views';
}

function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr);
    const days = Math.floor(diff / 86400000);
    if (days < 1) return 'Today';
    if (days < 30) return `${days} days ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
}

function createSkeletonHTML() {
    return `
        <div class="animate-pulse">
            <div class="aspect-video bg-gray-200 rounded-lg mb-3"></div>
            <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div class="h-3 bg-gray-200 rounded w-1/4"></div>
        </div>
    `;
}

function showSkeletons() {
    skeletonContainer.innerHTML = Array(12).fill(createSkeletonHTML()).join('');
    skeletonContainer.classList.remove('hidden');
    loadMoreBtn.classList.add('hidden');
}

function hideSkeletons() {
    skeletonContainer.classList.add('hidden');
}

function showError() {
    errorContainer.classList.remove('hidden');
    videoGrid.classList.add('hidden');
    loadMoreBtn.classList.add('hidden');
}

function hideError() {
    errorContainer.classList.add('hidden');
    videoGrid.classList.remove('hidden');
}

async function fetchVideos(page = 1) {
    if (isLoading) return;
    isLoading = true;
    
    showSkeletons();
    hideError();

    try {
        const response = await fetch(`${API_BASE_URL}?page=${page}&limit=${limit}`);
        const result = await response.json();

        if (result.success && result.data && result.data.data) {
            // Map the actual API structure to the expected format if necessary
            const mappedVideos = result.data.data.map(video => {
                // If the data is already flattened (as per GEMINI.md), use it
                if (video.videoId) return video;
                
                // Otherwise map from the real API structure
                return {
                    videoId: video.items?.id || '',
                    title: video.items?.snippet?.title || 'No Title',
                    thumbnail: video.items?.snippet?.thumbnails?.high?.url || 
                               video.items?.snippet?.thumbnails?.medium?.url || 
                               video.items?.snippet?.thumbnails?.default?.url || '',
                    channelTitle: video.items?.snippet?.channelTitle || 'Unknown Channel',
                    viewCount: video.items?.statistics?.viewCount || '0',
                    publishedAt: video.items?.snippet?.publishedAt || new Date().toISOString()
                };
            });

            renderVideos(mappedVideos);
            
            // Check if there's more data
            if (result.data.hasNextPage) {
                loadMoreBtn.classList.remove('hidden');
            } else {
                loadMoreBtn.classList.add('hidden');
            }
        } else {
            throw new Error('Invalid API response');
        }
    } catch (error) {
        console.error('Error fetching videos:', error);
        if (page === 1) showError();
    } finally {
        isLoading = false;
        hideSkeletons();
    }
}

function renderVideos(videos) {
    videos.forEach(video => {
        const card = document.createElement('a');
        card.href = `https://youtube.com/watch?v=${video.videoId}`;
        card.target = '_blank';
        card.className = 'group block bg-white rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1';
        
        card.innerHTML = `
            <div class="aspect-video relative overflow-hidden bg-gray-100">
                <img src="${video.thumbnail}" alt="${video.title}" class="w-full h-full object-cover">
            </div>
            <div class="p-3">
                <h3 class="font-semibold text-gray-900 line-clamp-2 leading-snug mb-1" title="${video.title}">
                    ${video.title}
                </h3>
                <p class="text-sm text-gray-600 mb-1">${video.channelTitle}</p>
                <div class="flex items-center text-xs text-gray-500">
                    <span>${formatViews(video.viewCount)}</span>
                    <span class="mx-1">•</span>
                    <span>${timeAgo(video.publishedAt)}</span>
                </div>
            </div>
        `;
        
        videoGrid.appendChild(card);
    });
}

loadMoreBtn.addEventListener('click', () => {
    currentPage++;
    fetchVideos(currentPage);
});

retryBtn.addEventListener('click', () => {
    currentPage = 1;
    videoGrid.innerHTML = '';
    fetchVideos(currentPage);
});

// Initial fetch
fetchVideos(currentPage);
