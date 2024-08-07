import { get } from 'svelte/store'
import { getInstance } from '$lib/lemmy.js'
import { page } from '$app/stores'
import { 
    userSettings, 
    ENABLE_MEDIA_PROXY,
    ENABLE_MEDIA_PROXY_LOCAL,
    MEDIA_PROXY_BLACKLIST,
    MEDIA_PROXY_LEMMY_ONLY
} from '$lib/settings.js'

// Accepts an image URL as input and determines whether to convert it into a proxied image URL or keep the original
export function imageProxyURL(url?:string, size?:number, format?:string): string|undefined {
    const $page = get(page)
    const $userSettings = get(userSettings)
    const origin = new URL($page.url.href).origin

    if (!url) return
    
    // Return original URL if media proxying is globally disabled
    if (!ENABLE_MEDIA_PROXY) return url;                        
    
    // Return original URL if user preference for media proxing is disabled
    if (!$userSettings?.proxyMedia.enabled) return url;     

    // Return original URL if image url matches an entry in the blacklist
    if (MEDIA_PROXY_BLACKLIST.length > 0) {
        for (let i:number=0; i< MEDIA_PROXY_BLACKLIST.length; i++) {
            if ( url.includes(MEDIA_PROXY_BLACKLIST[i]) ) return url;
        }
    }

    // Return original URL if image is not on another Lemmy instance (identified by /pictrs/image in the url) and admin configured to only proxy Lemmy images
    if (MEDIA_PROXY_LEMMY_ONLY && !url.includes('/pictrs/image')) return url;             
    
    // Return original URL if local media/home instance image proxying is disabled
    if ( !ENABLE_MEDIA_PROXY_LOCAL && url.includes(getInstance())) return url;

    // Don't proxy local blobs
    if (url.startsWith('blob:')) return url;

    // Don't proxy inline data images
    if (url.startsWith('data:')) return url;

    // Don't proxy images that are already going through the local proxy
    if (url.includes(`${origin}/image_proxy/`)) return url;


    // Build the image proxy URL to return
    try {
        let image = new URL(url);
        
        let host = image.host;
        let params = image.searchParams;
        let path = image.pathname;

        if ($userSettings?.proxyMedia.fallback) {
            params.append('fallback', 'true');
        }

        // Only add the thumbnail and format parameters to pictrs URLs (to avoid caching multiple version of a GIF from Giphy, etc where those aren't respected)
        if (url.includes('/pictrs/image')) {
            if (size) {
                params.set('thumbnail', size.toString());
            }

            if (format) {
                params.set('format', format)
            }
        }

        return `${origin}/image_proxy/${host}${path}?${params}`
    }
    
    // If building the URL fails, fallback to returning the original
    catch {
        return url;
    }
}