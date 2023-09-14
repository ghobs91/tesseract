import { getClient } from '$lib/lemmy.js'
import { error } from '@sveltejs/kit'

export async function load(req: any) {
    try {
        return {
            site: await getClient(undefined, req.fetch).getSite({}),
        }
    } catch (err) {
        throw error(500, {
            message: 'Failed to fetch legal page.',
        })
    }
}
