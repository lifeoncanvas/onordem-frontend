import type { FollowTarget } from "@/components/FollowButton";
import { PEOPLE } from "@/data/peopleData";
import type { Story } from "@/types/story";

/**
 * Story authors are plain names. Link to a community member when the name matches,
 * otherwise make a stable id from the name so the follow persists.
 */
export function storyAuthorTarget(story: Story): FollowTarget {
  // Bylines are stored as "By Daniel Vance".
  const name = story.author.replace(/^\s*by\s+/i, "").trim();
  const member = PEOPLE.find((p) => p.name.toLowerCase() === name.toLowerCase());
  if (member) return member;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  return { id: `author_${slug}`, name, username: slug, role: story.authorRole };
}
