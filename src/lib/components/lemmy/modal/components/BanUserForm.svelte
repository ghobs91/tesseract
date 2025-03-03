<script lang="ts">
    import type { Community, Person } from "lemmy-js-client"

    import { createEventDispatcher } from "svelte"
    import { dispatchWindowEvent } from "$lib/ui/events"
    import { getClient } from '$lib/lemmy'
    import { profile } from '$lib/auth'

    import Avatar from "$lib/components/ui/Avatar.svelte"
    import MarkdownEditor from "$lib/components/markdown/MarkdownEditor.svelte"
    import Button from "$lib/components/input/Button.svelte"
    import { toast } from "$lib/components/ui/toasts/toasts"
    import SettingToggleContainer from "$lib/components/ui/settings/SettingToggleContainer.svelte"
    import SettingToggle from "$lib/components/ui/settings/SettingToggle.svelte"
    import SettingDateInput from "$lib/components/ui/settings/SettingDateInput.svelte"
    
    import { CalendarDays, HandRaised, Trash } from "svelte-hero-icons"
    
    

    export let person: Person
    export let community: Community | undefined = undefined
    export let creator_banned_from_community: boolean = false

    const dispatcher = createEventDispatcher()
    let reason = ''
    let expiry = ''
    let loading = false
    let removeContent = false
    let ban_all_remote_communities = false



    async function banUser() {
        if (!$profile?.user || !$profile?.jwt) return
    
    
        loading = true
        
            
        try {
            let date: number | undefined
            // Validate ban expiry date
            if (expiry != '') {
                date = Date.parse(expiry)
                if (Number.isNaN(date) || date < Date.now()) {
                    //invalidDateErrorToast()
                    loading = false
                    return
                }
            }

            // Ban from community if `community` is provided in the call
            if (community) {
                const response = await getClient().banFromCommunity({
                    ban: creator_banned_from_community ? false : true ,
                    community_id: community.id,
                    person_id: person.id,
                    reason: reason || undefined,
                    remove_data: removeContent,
                    expires: date ? Math.floor(date / 1000) : undefined,
                })

                creator_banned_from_community = response?.banned

                // Dispatch global event so other components can react
                dispatchWindowEvent('banCommunity', {
                    person_id: person.id,
                    community_id: community.id,
                    banned: creator_banned_from_community,
                    remove_content: removeContent
                })

                

            }
            
            // Ban from instance if no community provided
            else {
                const response = await getClient().banPerson({
                    ban: !person.banned,
                    person_id: person.id,
                    reason: reason || undefined,
                    remove_data: removeContent,
                    expires: date ? Math.floor(date / 1000) : undefined,
                })

                person.banned = response?.person_view.person.banned

                // Dispatch global event so other components can react
                dispatchWindowEvent('banUser', {
                    person_id: person.id,
                    banned: person.banned,
                    remove_content: removeContent
                })

                // Ban from all non-local communities if option selected
                if (ban_all_remote_communities && $profile.user.moderates?.length > 0) {
                    
                    $profile.user.moderates.forEach(async (c) => {
                        if (c.community.instance_id != $profile.user?.local_user_view.person.instance_id) {
                            await getClient().banFromCommunity({
                                community_id: c.community.id,
                                ban: person.banned,
                                reason: reason,
                                person_id: person.id,
                                remove_data: removeContent,
                                expires: date ? Math.floor(date / 1000) : undefined,
                            })

                            dispatchWindowEvent('banCommunity', {
                                person_id: person.id,
                                banned: person.banned,
                                community_id: c.community.id,
                                remove_content: removeContent
                            })
                        }
                    })

                }

            }
            
            dispatcher('ban')

            toast({
                content: `Successfully ${ (community ? creator_banned_from_community : person.banned ) ? 'banned' : 'unbanned'}  ${person.name}@${new URL(person.actor_id).hostname} ${community ? 'from the community' : 'from the instance'}.`,
                type: 'success',
                title: 'Success'
            })
            loading= false

        } catch (err) {
            loading = false
            toast({
                content: err as any,
                type: 'error',
                title: 'Error'
            })
        }
    
    
    }
</script>

<form class="flex flex-col gap-4" on:submit|preventDefault={banUser}>
                    
    <div class="flex flex-col gap-1">
        
        
        <span class="text-sm">
            {(community ? creator_banned_from_community : person.banned) ? 'Unbanning' : 'Banning'} from
            <span class="font-bold">
                {
                    community 
                    ? `${community.name}@${new URL(community.actor_id).hostname}`
                    : 'Instance'
                }
            </span>
        </span>
        
        
        <span class="flex flex-row gap-1 text-xs items-center">
            <Avatar url={person.avatar} alt={person.actor_id} width={24} />
            <span class="font-bold">{person.name}@{new URL(person.actor_id).hostname}</span>
        </span>
    
    
        

    </div>


    <MarkdownEditor required previewButton images={false} rows={6} 
        bind:value={reason} label="Reason"
        placeholder="Why are you { (community ? creator_banned_from_community : person.banned) ? 'unbanning' : 'banning'} {person.name}@{new URL(person.actor_id).hostname}?"
    >
        <Button submit color="primary" loading={loading} disabled={loading} size="lg" slot="actions">
            {(community ? creator_banned_from_community : person.banned) ? 'Unban' : 'Ban'}
        </Button>
    </MarkdownEditor>
    
    <SettingToggleContainer>
        
        <SettingToggle bind:value={ban_all_remote_communities} icon={HandRaised} condition={!community} title="{person.banned ? 'Unban' : 'Ban'} All Remote Communities"
            description="{person.banned ? 'Unban' : 'Ban'} this user from all remote communities I moderate."
        />
        
        {#if !(community ? creator_banned_from_community : person.banned)}
            <SettingToggle bind:value={removeContent} icon={Trash} title="Remove Content" description="Remove all of this user's content when banning." />
            <SettingDateInput bind:value={expiry} icon={CalendarDays} title="Ban Expires" description="To effect a temporary ban, enter a date for the ban to expire. Leave blank for a permanent ban." />
        {/if}
    
    </SettingToggleContainer>


    
</form>