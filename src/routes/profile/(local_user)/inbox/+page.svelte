<script lang="ts">
    import { fly } from 'svelte/transition'
    import { getClient } from '$lib/lemmy.js'
    import { goto } from '$app/navigation'
    import { isRead } from '$lib/lemmy/inbox.js'
    import { page } from '$app/stores'
    import { profile } from '$lib/auth.js'
    import { searchParam } from '$lib/util.js'
    
    import Button from '$lib/components/input/Button.svelte'
    import InboxItem from './InboxItem.svelte'
    import MultiSelect from '$lib/components/input/MultiSelect.svelte'
    import Pageination from '$lib/components/ui/Pageination.svelte'
    import Placeholder from '$lib/components/ui/Placeholder.svelte'
    
    import {
        ArchiveBox,
        Check,
        EnvelopeOpen,
        Icon,
        Inbox,
    } from 'svelte-hero-icons'
    import FeedContainer from '$lib/components/ui/containers/FeedContainer.svelte';
    
    

    export let data

    let markingAsRead = false

    async function markAllAsRead() {
        if (!$profile?.user) {
            goto('/login')
            return
        }

        markingAsRead = true

        const response = await getClient().markAllAsRead()

        $profile.user.unreads = 0

        goto($page.url, {invalidateAll: true,}).then(() => {
            markingAsRead = false
        })

        return response.replies
    }
</script>

<svelte:head>
    <title>Profile | Inbox</title>
</svelte:head>

<h1 class="flex flex-row justify-between">
    <span class="font-bold text-2xl">Inbox</span>
    <Button on:click={markAllAsRead} loading={markingAsRead} disabled={markingAsRead} size="md" color="tertiary-border">
        <Icon src={Check} width={16} mini slot="icon" />
            Mark all as read
    </Button>
</h1>

<FeedContainer>

{#if !data.data || (data.data?.length ?? 0) == 0}
    <div class="my-auto">
        <Placeholder icon={Inbox} title="No new notifications" description="Messages, replies, and mentions will appear here." />
    </div>
{:else}
    {#each data.data as item}
        <div in:fly={{ duration: 500, y: -6, opacity: 0 }}>
            <InboxItem bind:item  />
        </div>
    {/each}

    <Pageination page={data.page} on:change={(p) => searchParam($page.url, 'page', p.detail.toString())} />
{/if}
</FeedContainer>
