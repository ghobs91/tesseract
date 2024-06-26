<script lang="ts">
    import type { CommunityView, PostView } from 'lemmy-js-client'
    import type { PostType, PostDisplayType } from './helpers.js'
    
    import { amMod, isAdmin, report} from '$lib/components/lemmy/moderation/moderation.js'
    import { instance } from '$lib/instance.js'
    import { page } from '$app/stores'
    import { profile } from '$lib/auth.js'
    import { scrollToTop } from './helpers.js'
    import { userSettings } from '$lib/settings.js'
    
    import Button               from '$lib/components/input/Button.svelte'
    import ModerationMenu       from '$lib/components/lemmy/moderation/ModerationMenu.svelte'
    
    // Post Action Bar Components
    import CommentCountButton   from './PostActions/CommentCountButton.svelte'
    import CommunityActionMenu  from './PostActions/CommunityActionMenu.svelte'
    import DebugButton          from './PostActions/DebugButton.svelte'
    import InstanceMenu          from './PostActions/InstanceMenu.svelte'
    import PostActionsMenu      from './PostActions/PostActionsMenu.svelte'
    import PostReplyButton      from './PostActions/PostReplyButton.svelte'
    import PostVote             from './PostActions/PostVote.svelte'

    import {
        ArrowsPointingIn,
        ArrowsPointingOut,
        Icon,
    } from 'svelte-hero-icons'
   
    export let post: PostView
    //export let postType: PostType = 'text'
    export let displayType: PostDisplayType
    export let expandCompact: boolean
    export let showCommentForm:boolean = false;
    export let postContainer: HTMLDivElement

    $: onHomeInstance = ($page.params.instance ?? $instance)  == $instance

</script>

<div  class="flex {$userSettings.uiState.reverseActionBar ? 'flex-row-reverse' : 'flex-row'} gap-1 sm:gap-2 items-center h-8 
    {displayType == 'post' ? 'mt-auto' : 'mt-2'} 
    {displayType == 'feed' && $userSettings.showCompactPosts && !expandCompact ? '' : 'ml-[-0.5rem]'}
    {displayType == 'post' ? 'ml-[-0.5rem]' : ''}
    "
>

    <!--- Post Vote Buttons--->
    <PostVote bind:post  />

    <!--- Comment Count and Link to Post--->
    {#if displayType == 'feed'}
        <CommentCountButton bind:post displayType={displayType} />
    {/if}
    

    <!---Reply Button that enables the comment form--->
    <PostReplyButton displayType={displayType} bind:showCommentForm bind:post/>
  
    <!--- Spacer --->
    <div class="ml-auto" />

    <!---Debug Button--->
    <DebugButton bind:post />
  
    
    <!--- Expand Compact Post to Card--->
    {#if displayType == 'feed' && $userSettings.showCompactPosts}
        <Button  color="tertiary-border" title="{expandCompact ? 'Collapse' : 'Expand'}" 
            on:click={() => {  
                expandCompact = !expandCompact; 
                scrollToTop(postContainer)
            }}
        >
            <Icon src={expandCompact ? ArrowsPointingIn : ArrowsPointingOut} mini size="16" slot="icon" />
        </Button>
    {/if}

    <!--- Moderation Menu--->
    {#if onHomeInstance && $profile?.user && (amMod($profile.user, post.community) || isAdmin($profile.user))}
        <ModerationMenu bind:item={post} />
    {/if}

    <!---Explore Menu--->
    <InstanceMenu bind:post />

    <!---Community Action Menu--->
    <CommunityActionMenu bind:post />
        
    <!--- Post Actions Menu --->
    <PostActionsMenu bind:post />
    
</div>
