import type { SortType } from 'lemmy-js-client'

import { get } from 'svelte/store'
import { getClient } from '$lib/lemmy.js'
import { getItemPublished } from '$lib/lemmy/item.js'
import { profile } from '$lib/auth.js'
import { userSettings } from '$lib/settings'

interface LoadParams {
    url: any,
}

export async function load({ url }: LoadParams) {
    const page = Number(url.searchParams.get('page')) || 1
    const type: 'comments' | 'posts' | 'all' = (url.searchParams.get('type') as 'comments' | 'posts' | 'all') || 'all'
    const sort: SortType = (url.searchParams.get('sort') as SortType) || 'New'
    const limit = Number(url.searchParams.get('limit')) || get(userSettings)?.uiState.postsPerPage || 20

    const user = await getClient().getPersonDetails({
        limit: limit,
        page: page,
        username: get(profile)!.username,
        sort: sort,
    })

    const items = [...user.posts, ...user.comments]

    if (sort.startsWith('Top')) {
        items.sort( (a, b) => b.counts.upvotes - b.counts.downvotes - (a.counts.upvotes - a.counts.downvotes) )
    } 
    
    else if (sort == 'New') {
        items.sort( (a, b) => Date.parse(getItemPublished(b)) - Date.parse(getItemPublished(a)) )
    }
    
    else if (sort == 'Old') {
        items.sort( (a, b) => Date.parse(getItemPublished(a)) - Date.parse(getItemPublished(b)) )
    }

    return {
        limit: limit,
        type: type,
        page: page,
        sort: sort,
        person_view: user.person_view,
        items: items,
        moderates: user.moderates
    }
}
