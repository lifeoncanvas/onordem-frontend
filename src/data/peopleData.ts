/**
 * Mock community members (other people using the app) and their public tributes.
 * Replace with backend data (GET /users/{id}, /tributes/public-feed?userId=…) once
 * follow endpoints exist on the server.
 */
import type { MemoryData } from "@/components/home/MemoryCard";

export interface Person {
  id: string;
  name: string;
  username: string;
  avatar: string;
  role: string;
  bio: string;
  /** Follower count before the current user's own follow is counted. */
  followerCount: number;
  followingCount: number;
  /** Short reason shown on suggestion cards. */
  suggestionReason?: string;
}

const avatar = (photoId: string) =>
  `https://images.unsplash.com/${photoId}?w=300&auto=format&fit=crop&q=80`;

export const PEOPLE: Person[] = [
  {
    id: "f1",
    name: "Aarav Patel",
    username: "aarav_p",
    avatar: avatar("photo-1500648767791-00dcc994a43e"),
    role: "Computer Science Graduate",
    bio: "Honouring professors who inspired my journey in engineering.",
    followerCount: 214,
    followingCount: 180,
    suggestionReason: "Follows you",
  },
  {
    id: "f2",
    name: "Elena Rostova",
    username: "elena_r",
    avatar: avatar("photo-1534528741775-53994a69daeb"),
    role: "Visual Artist & Designer",
    bio: "Documenting timeless advice from art directors and teachers.",
    followerCount: 1290,
    followingCount: 341,
    suggestionReason: "Follows you",
  },
  {
    id: "f3",
    name: "Kavita Rao",
    username: "kavita_r",
    avatar: avatar("photo-1544005313-94ddf0286df2"),
    role: "Literature Fellow",
    bio: "Stories of kindness and patience that outlived school halls.",
    followerCount: 532,
    followingCount: 410,
  },
  {
    id: "f4",
    name: "David Kim",
    username: "david_k",
    avatar: avatar("photo-1507003211169-0a1dd7228f2d"),
    role: "Biotech Researcher",
    bio: "Honouring Dr. Mitchell and the lab family.",
    followerCount: 98,
    followingCount: 120,
    suggestionReason: "Follows you",
  },
  {
    id: "p5",
    name: "Meera Iyer",
    username: "meera.writes",
    avatar: avatar("photo-1438761681033-6461ffad8d80"),
    role: "Primary School Teacher",
    bio: "Writing thank-you letters to the teachers who taught me to teach.",
    followerCount: 3120,
    followingCount: 288,
    suggestionReason: "Also honours teachers",
  },
  {
    id: "p6",
    name: "Rohan Mehta",
    username: "rohan.m",
    avatar: avatar("photo-1506794778202-cad84cf45f1d"),
    role: "Football Coach",
    bio: "Every coach I've had left a drill and a life lesson. Collecting both.",
    followerCount: 845,
    followingCount: 402,
    suggestionReason: "Also honours coaches",
  },
  {
    id: "p7",
    name: "Sara Thomas",
    username: "sara_t",
    avatar: avatar("photo-1517841905240-472988babdf9"),
    role: "Product Manager",
    bio: "My first manager taught me that clarity is a kindness.",
    followerCount: 1704,
    followingCount: 530,
    suggestionReason: "Popular this week",
  },
  {
    id: "p8",
    name: "Imran Sheikh",
    username: "imran.s",
    avatar: avatar("photo-1472099645785-5658abf4ff4e"),
    role: "Medical Resident",
    bio: "For the attending physicians who stayed after every night shift.",
    followerCount: 612,
    followingCount: 233,
    suggestionReason: "Popular this week",
  },
];

/** Public tributes written by each person, keyed by person id. */
export const PEOPLE_TRIBUTES: Record<string, MemoryData[]> = {
  f1: [
    {
      id: "pt-f1-1",
      type: "photo",
      title: "The Lab at Midnight",
      mentorName: "Prof. Sunil Kapoor",
      date: "Mar 2022",
      content: "He kept the lab open past midnight so I could finish my first working compiler.",
      image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80",
      likes: 54,
    },
    {
      id: "pt-f1-2",
      type: "lesson",
      title: "Read the Error",
      mentorName: "Prof. Sunil Kapoor",
      date: "Jan 2023",
      content: "The computer is telling you exactly what is wrong. Slow down and listen to it.",
      likes: 31,
    },
  ],
  f2: [
    {
      id: "pt-f2-1",
      type: "gratitude",
      title: "Blank Canvas",
      mentorName: "Maria Lopez",
      date: "Jun 2019",
      content: "You told me the first mark is the bravest one, and then you handed me the brush.",
      likes: 120,
    },
  ],
  f3: [
    {
      id: "pt-f3-1",
      type: "tribute",
      title: "Margins Full of Notes",
      mentorName: "Mrs. Anita Sharma",
      date: "Aug 2020",
      content: "Every essay came back with more ink from you than from me. That ink became my voice.",
      likes: 76,
    },
  ],
  p5: [
    {
      id: "pt-p5-1",
      type: "photo",
      title: "Class of 2009",
      mentorName: "Mr. Joseph Dsouza",
      date: "Apr 2009",
      content: "He learnt every one of our names on the first day and never once got them wrong.",
      image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop&q=80",
      likes: 341,
    },
    {
      id: "pt-p5-2",
      type: "gratitude",
      title: "Patience, Again",
      mentorName: "Mr. Joseph Dsouza",
      date: "Sep 2024",
      content: "Now I'm the one at the front of the room, and I hear your voice every time I wait one more second for an answer.",
      likes: 208,
    },
    {
      id: "pt-p5-3",
      type: "voice",
      title: "Retirement Speech",
      mentorName: "Mr. Joseph Dsouza",
      date: "Mar 2025",
      content: "Recording of his farewell speech to the staff room.",
      audioDuration: "3:12",
      likes: 97,
    },
  ],
  p6: [
    {
      id: "pt-p6-1",
      type: "lesson",
      title: "Run the Last Lap Hardest",
      mentorName: "Coach Bhatia",
      date: "Nov 2015",
      content: "Nobody remembers how you started a race. Run the last lap like it's the only one.",
      likes: 153,
    },
  ],
  p7: [
    {
      id: "pt-p7-1",
      type: "tribute",
      title: "Clarity Is Kindness",
      mentorName: "Priya Nair",
      date: "Feb 2021",
      content: "You rewrote my first spec with me line by line and never once made me feel small.",
      likes: 410,
    },
  ],
};
