// Canonical site URL — must match Netlify production domain
export const SITE_URL = "https://sageherb.dev";

// Site display title (used in <title> and header)
export const SITE_TITLE = "<SageHerb />";

// Default meta description
export const SITE_DESCRIPTION = "A personal tech blog by SageHerb";

// Author name
export const AUTHOR = "SageHerb";

// Favicon emoji (rendered as SVG data URI in BaseHead)
export const SITE_FAVICON = "🌿";

// Default OG image (relative to public/)
export const DEFAULT_OG_IMAGE = "/og-default.png";

// Copyright display name
export const COPYRIGHT_NAME = "SageHerb";

// Content license
export const LICENSE = "All rights reserved.";

// Posts per page for blog listing
export const POSTS_PER_PAGE = 10;

// Social links — omit or set to empty string to hide
export const SOCIAL_LINKS = {
  github: "https://github.com/sageherb",
  email: "prestoferoce@gmail.com",
} as const;
