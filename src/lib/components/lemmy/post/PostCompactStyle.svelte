<script lang="ts">
    import type { PostView } from 'lemmy-js-client'
    import type { PostType, PostDisplayType } from './helpers.js'
    
    
    import { imageProxyURL } from '$lib/image-proxy'
    import {isImage, postType as identifyPostType} from './helpers.js'
    import { scrollToTop } from './helpers.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    import { userSettings } from '$lib/settings.js'

    import ArchiveLinkSelector from './utils/ArchiveLinkSelector.svelte';
    import Card from '$lib/components/ui/Card.svelte'
    import Crossposts from '$lib/components/lemmy/post/Crossposts.svelte'
    import Link from '$lib/components/input/Link.svelte'
    import PostActions from '$lib/components/lemmy/post/PostActions.svelte'
    import PostMeta from '$lib/components/lemmy/post/PostMeta.svelte'
    import PostTitle from '$lib/components/lemmy/post/PostTitle.svelte'
    import PostBody from '$lib/components/lemmy/post/PostBody.svelte'
    

    export let post: PostView
    export let actions: boolean = true
    export let displayType: PostDisplayType = "feed"
    export let expandCompact: boolean;
    export let expandPreviewText:boolean 
    export let disablePostLinks:boolean = false
    export let collapseBadges:boolean = false;
    export let postContainer: HTMLDivElement

    $: postType = identifyPostType(post)
</script>


<Card class="bg-white flex flex-col w-full p-2 gap-0 " >

    <PostMeta bind:post={post} showTitle={false} {collapseBadges}/>

    <!--- Post Link, Body, and Thumbnail  --->
    <div class="flex flex-row w-full gap-2 {disablePostLinks ? 'pointer-events-none list-none' : ''}">
        <!--- Thumbnail --->
        {#if post.post.thumbnail_url || isImage(post.post.url)}
            <div class="flex-none w-[20%] md:w-[15%] xl:w-[10%] h-auto mx-auto mt-2">
                <!--- Expand the post in place when clicking thumbnail--->
                <button class="cursor-pointer" title="{expandCompact ? 'Collapse' : 'Expand'}" 
                    on:click={() => {  
                        expandCompact = !expandCompact; 
                        scrollToTop(postContainer)
                    }}
                >
                    <!--- Thumbnail for Link Post--->
                    {#if post.post.thumbnail_url}
                        <img
                            src="{imageProxyURL(post.post.thumbnail_url, 256, 'webp')}"
                            loading="lazy"
                            alt={post.post.name}
                            class="object-cover bg-slate-100 rounded-md h-32 w-32 border border-slate-200 dark:border-zinc-700 mx-auto"
                            class:blur-lg={(post.post.nsfw && $userSettings.nsfwBlur)}
                        />
                    <!---Thumbnail for Image Post--->
                    {:else if post.post.url}
                        <img
                            src="{imageProxyURL(post.post.url, 256, 'webp')}"
                            loading="lazy"
                            alt={post.post.name}
                            class="object-cover bg-slate-100 rounded-md h-32 w-32 border border-slate-200 dark:border-zinc-700 mx-auto"
                            class:blur-lg={(post.post.nsfw && $userSettings.nsfwBlur)}
                        />
                    {/if}
            
                
                </button>
            </div>
        {/if}
        
        
        <!---Post body and link--->
        <div class="flex flex-col gap-0 {post.post.thumbnail_url || isImage(post.post.url) ? 'w-[80%] md:w-[85%] xl:w-[90%]' : 'w-full'}">
            
            <!---Post title--->
            <PostTitle bind:post />

            {#if post.post.url && !isImage(post.post.url)}
            <span class="flex flex-row flex-wrap w-full gap-2">
                
                <!---Show archive link if not a media post--->
                {#if postType == "link" || postType == "thumbLink" || postType == 'youtube'}
                    <ArchiveLinkSelector url={post.post?.url} {postType}/>
                {/if}
                
                <Link class="text-xs" href={post.post?.url} newtab={$userSettings.openInNewTab.links} title={post.post?.url} domainOnly={!$userSettings.uiState.showFullURL} highlight nowrap/>
            </span>
            {/if}
            
            <div class="mt-1"/>
            <PostBody bind:post bind:postContainer {displayType} previewLength={240} bind:expandCompact bind:expandPreviewText inline={!expandPreviewText}/>

            <!--- Crossposts --->
            <Crossposts bind:post size="xs" class="!pl-0"/>

        </div>
        
        
    </div>
    
    <div class="mt-1"/>
    
    <!--- Post Action Bar--->
    <div class="flex flex-row w-full mt-1">
        {#if actions}
            <div class="w-full h-full grid items-end">
                <PostActions  bind:post  bind:expandCompact bind:postContainer {displayType}
                    on:edit={(e) => {
                        toast({
                            title: 'Confirmation',
                            content: 'The post was edited successfully.',
                            type: 'success',
                        })
                    }}
                />
            </div>
        {/if}
    </div>
</Card>
