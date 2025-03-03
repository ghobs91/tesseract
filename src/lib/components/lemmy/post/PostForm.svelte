<script lang="ts">
    interface PostData {
        alt_text?: string
        community?: Community
        name: string
        body?: string
        image?: FileList
        url?: string
        nsfw: boolean
        loading: boolean
        thumbnail_url?: string,
        embed_description?: string,
        embed_video_url?: string,
        embed_title?: string
    }

    import type { Community, PostView, UploadImageResponse} from 'lemmy-js-client'

    import { ENABLE_MEDIA_PROXY } from '$lib/settings'
    import { createEventDispatcher } from 'svelte'
    import { blobToFileList, deleteImageUpload, readImageFromClipboard } from '$lib/components/uploads/helpers';
    import { getClient, minAPIVersion } from '$lib/lemmy.js'
    import { imageProxyURL } from '$lib/image-proxy'
    import { isImage, isVideo } from './helpers'
    import { objectCopy } from '$lib/util'
    import { profile } from '$lib/auth.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    import { userSettings } from '$lib/settings'
    import { validateURL } from '$lib/blacklists'

    

    import Button from '$lib/components/input/Button.svelte'
    import Card from '$lib/components/ui/Card.svelte';
    import CommunityAutocomplete from '../CommunityAutocomplete.svelte';
    import CommunityLink from '../community/CommunityLink.svelte'
    import CrosspostItem from './CrosspostItem.svelte';
    import FeedContainer from '$lib/components/ui/containers/FeedContainer.svelte';
    import ImageUploadDeleteButton from '$lib/components/uploads/ImageUploadDeleteButton.svelte'
    import ImageUploadModal from '$lib/components/lemmy/modal/ImageUploadModal.svelte'
    import MarkdownEditor from '$lib/components/markdown/MarkdownEditor.svelte'
    import PostPreview from './Post.svelte'
    import SettingToggle from '$lib/components/ui/settings/SettingToggle.svelte'
    import SettingToggleContainer from '$lib/components/ui/settings/SettingToggleContainer.svelte'
    import Spinner from '$lib/components/ui/loader/Spinner.svelte';
    import TextInput from '$lib/components/input/TextInput.svelte'
    
    import { 
        ArrowUturnDown,
        CheckCircle,
        Cloud,
        CloudArrowDown,
        ExclamationCircle,
        Eye,
        Icon, 
        MagnifyingGlass, 
        PencilSquare,
        Photo,
        QueueList,
        Window,
        XCircle
    } from 'svelte-hero-icons'
    
    
    
    
    // The post to edit, as passed from the PostActions component
    export let editingPost: PostView | undefined = undefined

    // The community passed from sessionStorage via /create/post
    export let community: Community | undefined = undefined
    export let crosspostData: PostData | undefined = undefined
    export let hideCommunityInput = false
    export let textEditorRows:number = 10
    export let inModal = false
    export let editing: boolean = false

    let postContainer: HTMLDivElement

    let default_data: PostData = crosspostData ?? {
        community: editingPost?.community ?? community,
        image: undefined,
        name: editingPost?.post.name ?? '',
        body: editingPost?.post.body,
        url: editingPost?.post.url,
        nsfw: editingPost?.post.nsfw ?? false,
        alt_text: editingPost?.post.alt_text,
        loading: false,
        embed_description: editingPost?.post.embed_description,
        embed_video_url: editingPost?.post.embed_video_url,
        embed_title: editingPost?.post.embed_title
    }

    let data = objectCopy(default_data)
    
    // Holds the data from the upload response for use in the form
    let uploadResponse: UploadImageResponse | undefined
    
    // Bound from the markdown editor so that they can be referenced by the reset script in order to delete them
    let bodyImages:UploadImageResponse[]
    
    // Bound to the upload modal. Used when pasting an image into the URL field to pre-populate the preview and supply the upload data
    let postImage: FileList | null
    
    // Bound from the delete image button so its inner delete function can be called
    let deletePostImage: () => Promise<void>

    let pastingImage     = false
    let uploadingImage   = false
    let previewing       = false
    let fetchingMetadata = false
    let previewPost: PostView | undefined
    let resetting        = false
    
    
    let searching        = false
    let showSearch       = false
    let URLSearchResults = [] as PostView[]
    let oldCommunity:Community

    const dispatcher = createEventDispatcher<{ submit: PostView }>()

    // If community is provided, set the data object's community key to that
    $: if (community) data.community = community
    
    // Automatically convert the uploaded image's URL to a proxy URL if the option is selected
    $: if ($userSettings.proxyMedia.useForImageUploads && uploadResponse?.url)     data.url = imageProxyURL(uploadResponse.url)
    $: if (!$userSettings.proxyMedia.useForImageUploads && uploadResponse?.url)    data.url = uploadResponse.url

    // Reset URL search results when the community changes
    $:  data.community, rerunSearch()

    async function submit() {
        if (!data.name || !$profile?.jwt) return
        
        // Validate the post URL if supplied
        if (data.url) {
            let { allowed, reason } = validateURL(data.url)
            
            if (!allowed) {
                toast({
                    content: reason,
                    type: 'error',
                    title: 'Invalid URL',
                    duration: 15 *1000
                })
                return
            }
        }

        data.loading = true

        try {
            if (editingPost) {
                const post = await getClient().editPost({
                    name: data.name,
                    body: data.body,
                    url: data.url || undefined,
                    post_id: editingPost.post.id,
                    nsfw: data.nsfw,
                    alt_text: data.alt_text
                })

                if (!post) throw new Error('Failed to edit post')
                dispatcher('submit', post.post_view)
                
            } 
            else {
                const post = await getClient().createPost({
                    community_id: data.community!.id,
                    name: data.name,
                    body: data.body,
                    url: data.url || undefined,
                    nsfw: data.nsfw,
                    alt_text: data.alt_text
                })

                if (!post) throw new Error('Failed to create post')

                dispatcher('submit', post.post_view)
            }
        } catch (err) {
            toast({ title: 'Error', content: err as any, type: 'error' })
            data.loading = false
        }
    }

    async function getWebsiteMetadata() {
        if (!$profile?.jwt) return
        if (!data.url) return
        
        let { allowed, reason } = validateURL(data.url)
            
        if (!allowed) {
            toast({
                content: reason,
                type: 'error',
                title: 'Invalid URL',
                duration: 15000
            })
            data.url = ''
            fetchingMetadata = false
            return
        }

        fetchingMetadata = true    
        
        try {        
            const metadata = await getClient().getSiteMetadata({
                url: data.url
            })

            if (metadata?.metadata) {
                if (metadata.metadata.title && data.name == '') data.name = metadata.metadata.title
                
                if (metadata.metadata.description)      data.embed_description = metadata.metadata.description
                if (metadata.metadata.image)            data.thumbnail_url = metadata.metadata.image
                if (metadata.metadata.image)            data.thumbnail_url = metadata.metadata.image
                if (metadata.metadata.embed_video_url)  data.embed_video_url = metadata.metadata.embed_video_url
            }
        }
        catch (err) {
            toast({
                type: 'warning',
                title: 'No Metadata',
                content: 'Unable to fetch metadata for the given URL'
            })
        }
        finally {
            fetchingMetadata = false
        }
    }

    // Creates a second PostView object based on either the current form data or the post data passed from the edit event.  
    // Used to generate a fully-stocked PostView object to pass to the Post component in order to get a fully-rendered preview.
    async function generatePostPreview() {
        if (!$profile?.user) return

        // Validate URL
        if (data.url) {
            let { allowed, reason } = validateURL(data.url)
            
            if (!allowed) {
                toast({
                    content: reason,
                    type: 'error',
                    title: 'Invalid URL',
                    duration: 15000
                })
                data.url = ''
                return
            }
        }
        
        // Grab site metadata to use in the preview
        if (!previewing && data.url && !isImage(data.url) && !isVideo(data.url)) {
            await getWebsiteMetadata()
        }
        
        if (!data.name) data.name = 'Untitled'
            
        // If editing a post and the post details were passed, add them to the preview
        if (editingPost) {
            
            let newPost: PostView = objectCopy(editingPost)

            // Override the editable values with those from the form
            newPost.post.body = data.body;
            newPost.post.url = data.url;
            newPost.post.name = data.name;
            newPost.post.nsfw = data.nsfw;
            newPost.post.alt_text = data.alt_text
            
            // Unset these for the prevew generation step (if present from the original post)
            newPost.post.embed_description = undefined
            newPost.post.embed_title = undefined
            newPost.post.embed_video_url = data.embed_video_url ?? undefined
            newPost.post.thumbnail_url = data.thumbnail_url ?? undefined

            return newPost
        }
        
        // If creating a post, add some dummy values so the Post component can handle it for preview rending
        else {
            let newPost:PostView = {
                post: { 
                    ...data,
                    id: -1,
                    creator_id: $profile.user?.local_user_view.person.id,
                    community_id: data.community!.id,
                    thumbnail_url: data.thumbnail_url,
                    nsfw: data.nsfw,
                    removed: false,
                    locked: false,
                    deleted: false,
                    ap_id: 'none',
                    local: false,
                    featured_local: false,
                    featured_community: false,
                    language_id: -1,
                    published: new Date().toISOString(),
                    alt_text: data.alt_text
                },
                creator: objectCopy($profile.user?.local_user_view.person),

                community:  {...data.community},
                // @ts-ignore
                counts: {
                    upvotes: 1,
                    downvotes: 0
                },
                saved: false,
                featured: false,
                deleted: false,
                read: false,
                locked: false,
                removed: false
            }
            
            return newPost
            
        } 
    }

    function resetSearch() {
        URLSearchResults = []
        showSearch = false
    }

    function rerunSearch() {
        // Hack to not search on every change to the `data` object since Svelte triggers on the whole thing and not just the `community` key.
        if (oldCommunity == data.community) return
        oldCommunity = data.community

        URLSearchResults = []
        if (data.url) {
            searchForPostByURL(true)
        }
        else {
            showSearch = false
        }
    }

    async function searchForPostByURL(background:boolean=false) {
        if (!data.url || editing) return
        URLSearchResults = [] as PostView[]
        
        try {
            searching = true
            showSearch = !background && true

            const instance = data.community
                ? new URL(data.community.actor_id).hostname
                : undefined

            const community_name = data.community
                ? data.community.name + '@' + new URL(data.community.actor_id).hostname
                : undefined
            
            let results = await getClient(instance).search({
                q: data.url,
                type_: 'Url',
                community_name: community_name
            })

            searching = false
            
            
            URLSearchResults = URLSearchResults = results?.posts ?? []

            if (background && URLSearchResults.length > 0) showSearch = true


        }
        catch (err) {
            searching = false
        }

    }


   
</script>


<ImageUploadModal bind:open={uploadingImage} bind:image={postImage} useAltText={false} on:upload={(e) => {
        uploadResponse = e.detail
        if (uploadResponse?.url) data.url = uploadResponse.url
        uploadingImage = false
    }}
/>

<Card class="p-2">
    <form on:submit|preventDefault={submit} class="flex flex-col gap-4 h-full {previewing ? '' : 'pb-6'}">
        
        <div class="flex flex-row justify-between">
            <!--- Edit / Preview Toggle --->
            <Button  loading={fetchingMetadata} disabled={(!data || !data.community)} color="tertiary-border" title="{previewing ? 'Edit' : 'Preview'}"
                on:click={ async () => {
                    previewPost = await generatePostPreview()
                    if (previewPost) previewing = !previewing;
                }}
            >
                <Icon src={previewing ? PencilSquare : Eye} mini size="16"/>                
                {previewing ? 'Edit' : 'Preview'}
            </Button>
            
            <!--- Reset Form --->
            <Button  loading={resetting} disabled={previewing||resetting} color="tertiary-border" title="{editingPost ? 'Undo' : 'Reset'}"
                on:click={async () => {
                    resetting = true
                    // Reset the crosspost search
                    resetSearch()
                    
                    if (uploadResponse) deletePostImage()
                    for (let i=0; i < bodyImages.length; i++) {
                        await deleteImageUpload(bodyImages[i])
                    }
                    bodyImages = bodyImages = []
                    
                    data = objectCopy(default_data)
                    data = data
                    resetting = false
                }}
            >
                <Icon src={ArrowUturnDown} mini size="16"/>
                <span class="hidden md:block">
                    {editingPost ? 'Undo' : 'Reset'}
                </span>             
            </Button>
            
            <!--- Submit/Save--->
            <Button submit color="tertiary-border" loading={data.loading} size="lg" title="{editingPost ? 'Save' : 'Create' }" disabled={!data || data.loading || !data.name || !data.community} >
                <Icon src={CheckCircle} mini size="16"/>
                {editingPost ? 'Save' : 'Create' }
            </Button>
        </div>
        <!--- Show Form Fields if not Previewing--->
        {#if !previewing}
            
            <!--- Hide Community Selection Field if Editing Existing Post--->
            <div class="flex flex-col gap-4" class:hidden={editingPost}>
                
                <!---If community is not set, display autocomplete input to select one--->
                {#if !data.community}

                    <CommunityAutocomplete label="Community" containerClass="!w-full" placeholder="Community" listing_type="All"
                        on:select={(e) => {
                            data.community = e.detail
                        }}
                    />
                
                <!---If community is set, show a community link object and button to unselect it--->
                {:else if !hideCommunityInput}
                    <div class="flex flex-row items-center justify-between">
                        <CommunityLink avatar={true} community={data.community} />
                        
                        <Button size="md" color="tertiary" on:click={()=> data.community=undefined}>
                            <Icon src={XCircle} mini size="20"/>
                        </Button>
                    </div>
                {/if}
            </div>
            

            <!--- Post Title--->
            <TextInput required label="Title" bind:value={data.name} />
            
            <!--- Post URL and URl-related buttons--->
            <div class="flex flex-row gap-2 w-full items-end">
                <TextInput label="URL" bind:value={data.url} class="w-full" readonly={(uploadResponse) ? true : false} 
                    on:change={() => {
                        if (!editing) searchForPostByURL(true)
                    }}
                    on:paste={async (e) => { 
                        pastingImage = true
                        const imageBlob = await readImageFromClipboard(e.detail) 
                        if (imageBlob) {
                            postImage = blobToFileList(imageBlob)
                            uploadingImage = true
                        }
                        pastingImage = false
                    }}
                />
                
                <div class="flex flex-row items-center gap-2 ml-auto items-end">
                    <!---Fetch metadata from URL to populate title and append description to body--->
                    <Button color="tertiary-border" size="square-form" 
                        icon={CloudArrowDown} iconSize={18}
                        loading={fetchingMetadata} disabled={!data.url || fetchingMetadata || uploadResponse} title="Fetch title and description"
                        on:click={() => (getWebsiteMetadata())}
                    />

                    <!---Search for any crossposts to that URL--->
                    <Button color="tertiary-border" size="square-form" 
                        icon={MagnifyingGlass} iconSize={18}
                        loading={searching} disabled={!data.url || searching || fetchingMetadata || uploadResponse} title="Search for Existing Posts"
                        on:click={() => (searchForPostByURL())}
                        hidden={editing}
                    />
                    

                    <!---Upload an Image--->
                    <Button color="tertiary-border" size="square-form" icon={Photo} iconSize={18}
                        loading={uploadingImage||pastingImage} disabled={uploadingImage|| data.url || pastingImage} title="Upload an image"
                        on:click={() => (uploadingImage = !uploadingImage)}
                    />

                    <!---Image Upload Delete Button--->
                    <ImageUploadDeleteButton bind:uploadResponse bind:deleteImage={deletePostImage} iconSize={18} on:delete={(e) => {
                            if (e.detail) data.url = '' 
                        }}
                    />
                </div>
            </div>

            {#if minAPIVersion("0.19.5") && (isImage(data.url) || isVideo(data.url))}
                <TextInput label="Alt Text" bind:value={data.alt_text} />
            {/if}

            <!---Results for Existing Posts by that URL--->
            {#if showSearch}
            <div class="flex flex-col gap-2 items-start w-full p-2 border border-slate-300 dark:border-zinc-700 rounded-lg shadow-sm bg-slate-200/50 dark:bg-zinc-800/50">
                
                <div class="flex flex-row items-start w-full justify-between">
                    <span class="font-bold text-sm text-left mb-1 w-max self-start">
                        { data.community 
                            ? `Existing posts in community` 
                            : `Crossposts`
                        }
                        ({URLSearchResults.length})
                    </span>
                    
                    <Button color="primary" size="md" class="h-8"
                        icon={XCircle} iconSize={18} 
                        on:click={() => resetSearch() }
                    >
                    Clear
                </Button>

                </div>

                {#if searching}
                    <Spinner />
                {:else if URLSearchResults.length > 0}
                    <div class="divide-y divide-slate-300 dark:divide-zinc-700 flex w-full flex-col max-h-[13rem] overflow-y-scroll">
                        {#each URLSearchResults as crosspost}
                            <CrosspostItem {crosspost} showTitle showUser noClick voteButtons={false}/>
                        {/each}
                    </div>
                {:else}
                    <span class="mx-auto">No Results</span>
                {/if}
            </div>
            {/if}

            <!--- Post Body --->
            <!---<MarkdownEditor rows={textEditorRows} label="Body" resizeable={false} bind:value={data.body} bind:previewing={previewing} bind:imageUploads={bodyImages}/>--->
            <MarkdownEditor rows={textEditorRows} label="Body" resizeable={false} bind:value={data.body} previewButton bind:imageUploads={bodyImages}/>
            
            <!---Options--->
            <SettingToggleContainer>
                <SettingToggle bind:value={data.nsfw} icon={ExclamationCircle} title="NSFW" description="Flag post as not-safe-for-work" />
                
                {#if ENABLE_MEDIA_PROXY && $userSettings.proxyMedia.enabled}
                    <SettingToggle bind:value={$userSettings.proxyMedia.useForImageUploads} icon={Cloud} title="Use Image Proxy" 
                        description="Use the Tesseract image proxy URL for the post URL. Will reduce load on your home server." 
                    />
                {/if}
            </SettingToggleContainer>


            

        
        {/if}
        
    </form>
</Card>

<!---Previewing Post--->
{#if previewPost && previewing}
    
    {#if inModal}
        <div bind:this={postContainer} class="mt-4 pb-3">
            <PostPreview  post={previewPost}  actions={false}  displayType="post"  autoplay={false}  />
        </div>
    {:else}
    
        <FeedContainer>
            <div bind:this={postContainer} class="mt-4 pb-3">
                <PostPreview  post={previewPost}  actions={false}  displayType="post"   autoplay={false}  />
            </div>
        </FeedContainer>
    {/if}
    
{/if}
