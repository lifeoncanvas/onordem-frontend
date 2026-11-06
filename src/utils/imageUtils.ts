/**
 * Utility functions for image manipulation and black-and-white / monochrome filtering.
 */

/**
 * Transforms an image URI into a high-contrast black-and-white / grayscale version
 * without permanently modifying stored user records.
 *
 * For Unsplash images, dynamically applies &sat=-100 query parameter to leverage
 * CDN-level high-definition monochrome transformation.
 */
export function toGrayscaleUri(uri?: string): string {
  if (!uri || typeof uri !== "string") return "";

  // Handle Unsplash images
  if (uri.includes("images.unsplash.com")) {
    if (uri.includes("sat=")) {
      return uri.replace(/sat=[^&]+/, "sat=-100");
    }
    const separator = uri.includes("?") ? "&" : "?";
    return `${uri}${separator}sat=-100`;
  }

  return uri;
}
