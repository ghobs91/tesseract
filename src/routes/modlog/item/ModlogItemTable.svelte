<script lang="ts">
    import type {Filters, ModLog} from '../+page.js'
    import type { Post } from 'lemmy-js-client'

    import { amMod, ban, isAdmin } from '$lib/components/lemmy/moderation/moderation.js'
    import { getClient } from '$lib/lemmy'
    import { goto } from '$app/navigation';
    import { page } from '$app/stores'
    import { profile } from '$lib/auth'
    import { searchParam } from '$lib/util.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js';
    import { userSettings } from '$lib/settings.js'

    import Button from '$lib/components/input/Button.svelte';
    import CommunityLink from '$lib/components/lemmy/community/CommunityLink.svelte'
    import Link from '$lib/components/input/Link.svelte'
    import Markdown from '$lib/components/markdown/Markdown.svelte'
    import Menu from '$lib/components/ui/menu/Menu.svelte'
    import MenuButton from '$lib/components/ui/menu/MenuButton.svelte'
    import ModlogAction from '../ModlogAction.svelte'
    import RelativeDate from '$lib/components/util/RelativeDate.svelte'
    import ModlogRemoveCommentModal from '../ModlogRemoveCommentModal.svelte';
    import ModlogRemovePostModal from '../ModlogRemovePostModal.svelte';
    import UserLink from '$lib/components/lemmy/user/UserLink.svelte'
    
    import { Icon, 
        ArrowUpTray,
        Bars3,
        Fire,
        LockClosed,
        LockOpen,
        Megaphone,
        MinusCircle, 
        PlusCircle, 
        ShieldExclamation,
        Trash
    } from 'svelte-hero-icons'
    
    
    
    export let item: ModLog
    export let filter: Filters

    let locking         = false
    let removing        = false
    let removingComment = false
    
    async function lock(item: Post, lock: boolean) {
        if (!$profile?.jwt) return !lock
        locking = true

        try {
            await getClient().lockPost({
                locked: lock,
                post_id: item.id,
            })

            item.locked = lock

            toast({
                content: `Successfully ${lock ? 'locked' : 'unlocked' } that post. You must refresh to see changes.`,
                type: 'success',
                title: "Success"
            })
        } catch (err) {
            toast({
                content: err as any,
                type: 'error',
            })
        }

        locking = false
        return lock
    }

    async function pin(item: Post, pinned: boolean, toInstance: boolean = false) {
        if (!$profile?.jwt) return
        
        try {
            await getClient().featurePost({
                feature_type: toInstance ? 'Local' : 'Community',
                featured: pinned,
                post_id: item.id,
            })
            
            if (toInstance) item.featured_local = pinned
            else item.featured_community = pinned

            toast({
                content: `Successfully ${pinned ? 'pinned' : 'unpinned'} that post.`,
                type: 'success',
                title: 'Success'
            })
        } catch (err) {
            toast({
                content: err as any,
                type: 'error',
            })
        }
    }

</script>


<!---Remove/Restore Post
{#if item.post && item.community && (amMod($profile?.user, item.community) || isAdmin($profile?.user))}
    <ModlogRemovePostModal bind:open={removing} bind:post={item.post} purge={false} reason='' 
        on:remove={(e) => {
            goto($page.url.href, {invalidateAll: true})
        }}
    />
{/if}
--->

<!---Remove/Restore Comment
{#if item.comment && item.community && (amMod($profile?.user, item.community) || isAdmin($profile?.user))}
    <ModlogRemoveCommentModal bind:open={removingComment} bind:comment={item.comment} purge={false} reason='' 
        on:remove={(e) => {
            goto($page.url.href, {invalidateAll: true})
        }}
    />
{/if}
--->

<div class="flex flex-col-reverse gap-1 items-start lg:flex-row lg:gap-4 lg:items-center w-full max-w-full" >
    
    <!---Date/time column--->
    <div class="flex flex-row gap-2 px-1 text-xs w-full lg:w-[5%]">
        <span class="lg:hidden text-xs font-bold w-24">When:</span>
        <RelativeDate date={item.when} />
    </div>

    <!---Community--->
    <div class="flex flex-row gap-1 px-1 text-xs w-full lg:w-[15%] items-center">
        {#if item.community}
            <span class="flex flex-row gap-2 items-center w-full">
                <span class="lg:hidden text-xs font-bold w-24">Community:</span>
                
                <button class="cursor-pointer" title="Filter modlog for {item.community.name}" on:click={() => {
                    filter.community.set = !filter.community.set;
                    if (item?.community?.id && filter.community.set) {
                        filter.community.community = item.community;
                        searchParam($page.url, 'community', item.community.id.toString(), 'page');
                    } else {
                        searchParam($page.url, 'community', '', 'community');
                    }
                    
                }}>
                    <Icon src={filter.community.set ? MinusCircle : PlusCircle} mini width={24} />
                </button>

                <CommunityLink showInstance={true} avatar={false} avatarSize={20} community={item.community} inline={true}/>
            </span>
        {/if}
    </div>
    
    <!---Moderator--->
    {#if $profile?.user}
        <div class="flex flex-row gap-1 px-1 text-xs w-full lg:w-[20%] items-center">
            {#if item.moderator}
            <span class="flex flex-row gap-2 items-center w-full">    
                <span class="lg:hidden text-xs font-bold w-24">Mod:</span>
                
                <button class="cursor-pointer" title="Filter modlog for {item.moderator.name}" on:click={() => {
                    filter.moderator.set = !filter.moderator.set;
                    if (item?.moderator && filter.moderator.set) {
                        filter.moderator.person = item.moderator;
                        searchParam($page.url, 'mod_id', item.moderator.id.toString(), 'page');
                    } else {
                        searchParam($page.url, 'mod_id', '', 'mod_id');
                    }
                    
                }}>
                    <Icon src={filter.moderator.set ? MinusCircle : PlusCircle} mini width={24} />
                </button>

                <UserLink showInstance={true} avatar={false} avatarSize={20} user={item.moderator} inline={true}/>
            </span>
            {/if}
        </div>
    {/if}

    <!---Moderatee / user --->
    <div class="flex flex-row gap-1 px-1 text-xs w-full lg:w-[20%] items-center">
        {#if item.moderatee}
        <span class="flex flex-row gap-2 items-center w-full">        
            <span class="lg:hidden text-xs font-bold w-24">User:</span>
            
            <button class="cursor-pointer" title="Filter modlog for {item.moderatee.name}" on:click={() => {
                filter.moderatee.set = !filter.moderatee.set;
                if (item?.moderatee && filter.moderatee.set) {
                    filter.moderatee.person = item.moderatee;
                    searchParam($page.url, 'other_person_id', item.moderatee.id.toString(), 'page');
                } else {
                    searchParam($page.url, 'other_person_id', '', 'other_person_id');
                }
                
            }}>
                <Icon src={filter.moderatee.set ? MinusCircle : PlusCircle} mini width={24} />
            </button>

            
            <UserLink avatar={false} showInstance={true} user={item.moderatee} inline={true}/>
        </span>
        {/if}

    </div>


    <!---Details--->
    <div class="flex flex-row gap-1 px-1 text-xs w-full {$profile?.user ? 'lg:w-[40%]' : 'lg:w-[60%]'}">
        <div class="flex flex-col gap-2 text-xs w-full">
            <ModlogAction action={item.actionName} expires={item.expires} />

            <span class="text-xs">
                {#if item.expires}
                    <span class="flex flex-nowrap gap-1">
                        <strong>Expires</strong>: {new Date(item.expires).toLocaleDateString()}
                    </span>
                {/if}

                
                {#if item.reason}
                <span class="flex flex-nowrap gap-1 items-start">
                    <Markdown noPreview={true} source={item.reason} class="w-full" />
                </span>
                {/if}
                

                {#if item.link || item.content}
                    <span class="flex flex-row gap-1">
                        <span class="text-xs font-bold w-24 lg:w-fit">Item:</span>

                        <span class="flex flex-nowrap w-full gap-1 overflow-hidden">
                            {#if item.link && item.content}
                                <Link href={item.link} highlight newtab={$userSettings.openInNewTab.links} title={item.content}> {item.content.substring(0, 250)} </Link>
                            {:else if item.content}
                                <span title="{item.content}">{item.content.substring(0,250)}</span>
                            {:else if item.link}
                                <Link href={item.link} highlight newtab={$userSettings.openInNewTab.links}/>
                            {/if}
                        </span>
                    </span>
                {/if}
            </span>
        </div>


    </div>
    

</div>
