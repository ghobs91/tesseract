import { getClient, site } from '$lib/lemmy.js'
import { userSettings } from '$lib/settings.js'
import type { ListingType, SortType } from 'lemmy-js-client'
import { get } from 'svelte/store'
import { error } from '@sveltejs/kit'
import { profile } from '$lib/auth.js'

export async function load({ url, fetch }) {
    const page = Number(url.searchParams.get('page') || 1) || 1

    const sort: SortType = (url.searchParams.get('sort') as SortType) || get(userSettings).defaultSort.sort

    const listingType: ListingType = (url.searchParams.get('type') as ListingType) || get(userSettings).defaultSort.feed
    
   
    try {
        let posts = await getClient(undefined, fetch).getPosts({
            limit: 20,
            page: page,
            sort: sort,
            type_: listingType,
            auth: get(profile)?.jwt,
        });
    
        let siteData = await getClient(undefined, fetch).getSite({});
        
        site.set(siteData)

        return {
            sort: sort,
            listingType: listingType,
            page: page,
            posts: posts,
            site: siteData,
        }
    } catch (err) {
        throw error(500, {
            message: 'Failed to fetch homepage.',
        })
    }
}
