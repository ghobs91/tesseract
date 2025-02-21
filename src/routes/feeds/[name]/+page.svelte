<script lang="ts">
    import { getGroup, groupExists, sortGroups } from '$lib/favorites'
    import { goto } from '$app/navigation';
    import { page } from '$app/stores'
    import { profile } from '$lib/auth'
    import { searchParam } from '$lib/util.js'

    import EditCommunityGroup from '$lib/components/lemmy/modal/EditCommunityGroup.svelte'
    import Pageination from '$lib/components/ui/Pageination.svelte'
    import Placeholder from '$lib/components/ui/Placeholder.svelte'
    import PostFeed from '$lib/components/lemmy/post/PostFeed.svelte'
    import SiteCard from '$lib/components/lemmy/SiteCard.svelte'
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte'

    import { 
        Icon, 
        ArchiveBox,
        PencilSquare,
    } from 'svelte-hero-icons'
    import Button from '$lib/components/input/Button.svelte';
    import MainContentArea from '$lib/components/ui/containers/MainContentArea.svelte';


    export let data
    
    let editCommunityGroup:boolean = false;     // Controls the appearance of the community group editor modal
    $: feed = data.feed || 'Choose a Group'     // Can't bind a conditional value to the listing type in the subnavbar, so hack it.

</script>

<svelte:head>
    <title>Feeds: {data.feedName}</title>
</svelte:head>

{#if editCommunityGroup && groupExists(data.feedName)}
    <EditCommunityGroup bind:open={editCommunityGroup} group={getGroup(data.feedName)} />
{/if}

<SubNavbar 
    home compactSwitch toggleMargins refreshButton toggleCommunitySidebar
    listingType={true} listingTypeTitle="Custom Feed"
    listingTypeOptions = {[...$profile?.groups?.map((cg) => cg.name.toLowerCase())?.sort(sortGroups) ?? [] ]} 
    listingTypeOptionNames = {[...$profile?.groups?.map((cg) => cg.name)?.sort(sortGroups) ?? [] ]} 
    listingTypeOnSelect={(e) => {
        goto(`/feeds/${e.detail}?${new URL(window.location.href).searchParams.toString()}`)
    }}
    bind:selectedListingType={feed}

    sortMenu={true} bind:selectedSortOption={data.sort}
    pageSelection={true} bind:currentPage={data.page}
>
    <!--Edit Group Button-->
    <Button title="Edit Group" color="tertiary" size="sm" let:iconSize slot="right" class="{!groupExists(data.feedName) ? 'hidden' : ''}"
        on:click={() => {
            editCommunityGroup = true;
        }}
    >
        <Icon src={PencilSquare} width={iconSize} />
    </Button>
</SubNavbar>

<MainContentArea>

    {#if data}
        {#if data.posts.length > 0}
            <PostFeed posts={data.posts} />
        {:else}
            <Placeholder
                icon={ArchiveBox}
                title="No posts"
                description={
                    `There's nothing here.  
                    ${data.feed 
                        ? "You haven't added any communities to this group. Add communities or select a different group from the dropdown."
                            : `The specified group does not seem to exist yet.`
                    }
                `}
            />
        {/if}
        
        <div class="mt-auto px-2">
            <Pageination page={data.page}
                on:change={(p) => searchParam($page.url, 'page', p.detail.toString())}
            />
        </div>
    {/if}

    
    <SiteCard site={data.site.site_view} taglines={data.site.taglines} admins={data.site.admins} version={data.site.version} slot="right-panel"/>
    
</MainContentArea>