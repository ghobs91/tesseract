### PUBLIC_INSTANCE_URL
 The domain of your instance's API.  Should be just the hostname without scheme.

**Example:**  `lemmy.example.com`

**Default:** `lemmy.world`

**Required:** Technically speaking, no, but you should *really* set this.  If you only set one config param, set this one.

---

### PUBLIC_LOCK_TO_INSTANCE [*bool*]
Set to `true` if you want to disallow users from logging into other instances.  Set to `false` if you want to allow users to login to accounts on multiple instances.

**Default:** `true` if `PUBLIC_INSTANCE_URL` is defined.

---

### PUBLIC_THEME 
Whether to default to dark mode, light mode, or system.

**Valid Values:** `system`, `dark`, `light`

**Default:** `system`

---

### PUBLIC_MARK_READ_POSTS
Sets the default user option to fade the titles of read posts.

**Valid Values:** `true`, `false`

**Default:** `true`

---

### PUBLIC_SHOW_COMPACT_POSTS
If `true`, sets the default view to compact.  Set to `false` or leave undefined to have card be the default view for posts.

**Valid Values**:  `true`, `false`

**Default**: `false`

---

### PUBLIC_DEFAULT_FEED_SORT
Sets the default sorting method for users.  Users can change this in their settings, but this will be the default until they do.

**Valid Values**:  See [Lemmy sort types](https://github.com/LemmyNet/lemmy-js-client/blob/main/src/types/SortType.ts)

**Default**: `Active`

--- 

### PUBLIC_DEFAULT_FEED
Sets the default listing type for users. Users can change this in their settings, but this will be the default until they do.

**Valid Values**: See [Lemmy listing types](https://github.com/LemmyNet/lemmy-js-client/blob/main/src/types/ListingType.ts)

**Default**: `Local`

---

### PUBLIC_DEFAULT_COMMENT_SORT
Sets the default comment sort direction for users.  Users can change this in their settings, but this will be the default until they do.

**Valid Values**: `Hot`, `Top`, `New`

**Default**: `Hot`

---

### PUBLIC_HIDE_DELETED
Sets the default option to hide deleted posts/comments.  May or may not be relevant for normal users (the API keeps changing behavior grrrr). 

**Valid Values**:  `true`, `false`

**Default**: `true`

--- 

### PUBLIC_HIDE_REMOVED
Sets the default option to hide removed posts/comments.  May or may not be relevant for normal users (the API keeps changing behavior grrrr). 

**Valid Values**:  `true`, `false`

**Default**: `false`

--- 

### PUBLIC_DISPLAY_NAMES
Use display names instead of usernames when showing users.  Will fall back to username if no display name is set.

**Valid Values**: `true`, `false`

**Default**: `true`

---

### PUBLIC_NSFW_BLUR
Set the default user option to blur posts flagged NSFW.  Users can change this in their settings, but this will provide a default value unless changed.

**Valid Values**:  `true`, `false`

**Default**:  `true`

---

### PUBLIC_OPEN_LINKS_NEW_TAB
Sets the default user settings for whether external links should be opened in a new tab. 

**Valid Values**:  `true`, `false`

**Default**: `false`

---

### PUBLIC_ENABLE_EMBEDDED_MEDIA_FEED
Set the default option for whether media embeds shold be enabed in the feed.

**Valid Values**:  `true`, `false`

**Default**: `false`

**Note**:  Was `true` until 1.4.0 when click to play was implemented.

---
### PUBLIC_ENABLE_EMBEDDED_MEDIA_POST
Sets the default option for whether media embeds should be enabled when clicking into posts.

**Valid Values**:  `true`, `false`

**Default**: `true`

---

### PUBLIC_YOUTUBE_FRONTEND
Sets the default YouTube frontend.  Note that enabling media in the feed and selecting Invidious as the default YT frontend _may_ result in rate limiting errors.

**Valid Values**:  `YouTube` , `Invidious`, `Piped`

**Default**:  `YouTube`

---

### PUBLIC_CUSTOM_INVIDIOUS
A comma-delimited list of custom Invidious domains to use as possible frontends (selectable in user options) or to detect Invidious videos in posts.

**Example Value**:  Can be a single, comma-delimited string or multi-line YAML.  The two examples below are functionally identical.

```
# Single Line Format
PUBLIC_CUSTOM_INVIDIOUS=invid.example.com, iv.foo.com, iv.bar.net

# Multi-line format
- |-
  PUBLIC_CUSTOM_INVIDIOUS=
    invid.example.com,
    iv.foo.com,
    iv.bar.net

```

--- 

### PUBLIC_CUSTOM_PIPED (Deprecated)
A comma-delimited list of custom Piped domains to use as possible frontends (selectable in user options) or to detect Piped videos in posts.

**Example Value**:  Can be a single, comma-delimited string or multi-line YAML.  The two examples below are functionally identical.

```
# Single Line Format
PUBLIC_CUSTOM_PIPED=piped.example.com, piped.foo.com, piped.bar.net

# Multi-line format
- |-
  PUBLIC_CUSTOM_PIPED=
    piped.example.com,
    piped.foo.com,
    piped.bar.net

```

See [Custom YouTube Frontends](/docs/CustomYoutubeFrontends.md) doc for more details.

---

### PUBLIC_ENABLE_USER_MEDIA_PROXY
Sets the default user option to enable redirecting media through Tesseract's media proxy.  Useless unless the [media proxying subsystem](./MediaProxy.md) is enabled and configured.

This allows you to force the default settings for a user to use the media proxy (if enabled). 

Recommended to leave that up to the user (they can turn it off later if they want, anyway) unless you have a good reason to force using the proxy.

**Valid Values**:  `true`, `false`

**Default**: `false`

---


### PUBLIC_ENABLE_MBFC_BADGES
Whether to show MBFC credibility badges on posts by default.

**Valid Values**:  `true`, `false`

**Default**: `true`

---

### PUBLIC_STRETCH_CARD_BANNERS
Whether to stretch the background banner images on the site, community, and user cards.

**Valid Values**:  `true`, `false`

**Default**: `false`

---

### PUBLIC_MATCH_XPOST_TITLE
Whether to match crossposts in the feed by title as well as by URL.  Reduces clutter by matching text-only posts by title and treating them as crossposts in the feed.

Posts with the same title and different links will *not* be matched.  This is to allow posts in communities that require specific titles or ones that use the same title for multiple posts to not errorneously roll up. 

**Valid Values**:  `true`, `false`

**Default**: `true`

---
### PUBLIC_FEATURED_INSTANCES
A list of instances you approve of that will be made available in the community browser (`/communities`).  Users can quick-select one of these instances or supply a custom instance to browse.

Like `PUBLIC_INSTANCE_URL`, only the base domain of the instances should be provided.

**Example Value**:  Can be a single, comma-delimited string or multi-line YAML.  The two examples below are functionally identical.  Just be sure to comma-delmit each domain regardless of which YAML style you use.

```
# Single Line Format
PUBLIC_FEATURED_INSTANCES=lemmy.world, beehaw.org, mander.xyz, lemmy.ca, programming.dev

# Multi-line format
- |-
  PUBLIC_FEATURED_INSTANCES=
    lemmy.world, 
    beehaw.org, 
    mander.xyz, 
    startrek.website,
    lemmy.ca, 
    programming.dev

```
