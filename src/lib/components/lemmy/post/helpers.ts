import type { CommentView, PersonView, PostView } from 'lemmy-js-client'
import { YTFrontends } from '$lib/settings.js'

export type t_postDisplayType = 'post' | 'feed'
export type t_postType = 
    'image' | 'video' | 'youtube' | 'spotify' | 
    'soundcloud' | 'link' |  'thumbLink' | 'text';

export const isMutable = (post: PostView, me: PersonView) =>
  (me.person.admin && post.post.local) || me.person.id == post.creator.id

export const isCommentMutable = (comment: CommentView, me: PersonView) =>
  me.person.id == comment.creator.id


export const isImage = (url: string | undefined) => {
  if (!url) return false

  return /\.(jpeg|jpg|gif|png|svg|bmp|webp)$/i.test(new URL(url).pathname)
}

export const isVideo = (inputUrl: string | undefined) => {
  if (!inputUrl) return false

  const url = new URL(inputUrl).pathname.toLowerCase()

  return url.endsWith('mp4') || url.endsWith('webm') || url.endsWith('mov') || url.endsWith('m4v')
}

// Checks if the post's URL is for a video Tesseract is capable of embedding
export const isEmbeddableVideo = (url: string | undefined):boolean => {
    if (!url) return false
    return (
        isInvidious(url) ||
        isYouTube(url) ||
        isPiped(url)
    )
}

// Check if URL is an embeddable Youtube from YT, Invidious, or Piped
// Invidious
export const isInvidious = (url: string):boolean => {
    for (let i=0; i<YTFrontends.invidious.length; i++) {
        if (url.startsWith(`https://${YTFrontends.invidious[i]}`)) {
            return true;
        }
    }
    return false;
}

// YouTube
export const isYouTube = (url:string):boolean => {
    return (
        url.startsWith('https://youtu.be') || 
        url.startsWith('https://m.youtube.com') || 
        url.startsWith('https://www.youtube.com') || 
        url.startsWith('https://youtube.com')
    )
}

//  Piped
export const isPiped = (url: string):boolean => {
    for (let i=0; i<YTFrontends.piped.length; i++) {
        if (url.startsWith(`https://${YTFrontends.piped[i]}`)) {
            return true;
        }
    }
    return false;

}




// Check if URL is for Spotify content
export const isSpotify = (url: string | undefined):boolean => {
    if (!url) return false;
    
    if (url.startsWith('https://open.spotify.com')) {
        return true;
    }
    return false;

}

// Check if URL is for a Soundcloud asset
export const isSoundCloud = (url:string):boolean => {
    return (
        url.startsWith('https://m.soundcloud.com') || 
        url.startsWith('https://soundcloud.com') 
    )
}


// Returns a string representing the detected post type
// image | video | youtube | spotify | soundcloud | link | thumbLink | text
export const postType = (post: PostView | undefined, displayType: postDisplayType ) => {
    
    if (!post) return false
    
    if (post.post.url && isImage(post.post.url)) {
        return "image"
    }

    if (post.post.url && isVideo(post.post.url)) {
        return "video"
    }

    if (post.post.url && isEmbeddableVideo(post.post.url)) {
        return "youtube"
    }
    
    if (post.post.url && isSpotify(post.post.url)) {
        return "spotify"
    }
    
    if (post.post.url && isSoundCloud(post.post.url)) {
        return "soundcloud"
    }


    if (
        post.post.url && !post.post.thumbnail_url) {
        return "link"
    }

    if (
        post.post.thumbnail_url && post.post.url) {
        return "thumbLink"
    }

    // If no other type matches, render as a plain text
    return "text"
}