import {
  WallFilterTab,
  WallItem,
  WallMentorProfile,
} from "@/types/memoryWall";
import type { JourneyNode } from "@/components/MemoryWall/JourneyTogether";
import { Palette } from "@/constants/theme";

// ─── Mentor Profiles ─────────────────────────────────────────────────────────

export const WALL_MENTOR_PROFILES: WallMentorProfile[] = [
  {
    id: "mp1",
    name: "Mrs. Anita Sharma",
    relationship: "Teacher",
    category: "school",
    duration: "Taught you for 3 years",
    trait: "Patient guide",
    traitIcon: "flask-outline",
    avatarUri:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
    description:
      "My high school literature teacher who stayed hours after the bell to teach me that words have weight and that silence is where thinking begins.",
    meaningfulQuote:
      "She stayed after class until fractions finally clicked.",
    itemCount: 6,
    latestActivity: "2 days ago",
    lastThanked: "Last thanked 2 weeks ago",
    coverColor: "#93363F",
  },
  {
    id: "mp2",
    name: "Dr. David Mitchell",
    relationship: "Research Advisor",
    category: "study",
    duration: "Guided you since 2019",
    trait: "Showed me direction",
    traitIcon: "compass-outline",
    avatarUri:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    description:
      "Graduate advisor whose sunlit Thursday office discussions demolished my superficial assumptions and built genuine intellectual courage.",
    meaningfulQuote:
      "He taught me to ask better questions, not quicker answers.",
    itemCount: 4,
    latestActivity: "1 week ago",
    lastThanked: "Last thanked last month",
    coverColor: "#480E18",
  },
  {
    id: "mp3",
    name: "Vikram Rao",
    relationship: "Engineering Director",
    category: "work",
    duration: "Mentored for 4 years",
    trait: "Master craftsman",
    traitIcon: "construct-outline",
    avatarUri:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    description:
      "Senior director who shielded the team through turbulence and taught me that craftsmanship and human empathy belong together in engineering.",
    meaningfulQuote:
      "His toughest code review made me a far better engineer.",
    itemCount: 3,
    latestActivity: "3 days ago",
    lastThanked: "Last thanked 3 days ago",
    coverColor: "#E49147",
  },
  {
    id: "mp4",
    name: "Priya Nair",
    relationship: "Design Lead",
    category: "work",
    duration: "Guided you since 2021",
    trait: "Creative clarity",
    traitIcon: "sparkles-outline",
    avatarUri:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    description:
      "Design director who cured my terror of blank canvases and pushed me to trust my unique eye.",
    meaningfulQuote:
      "She told me to trust my taste and ship the idea anyway.",
    itemCount: 2,
    latestActivity: "Yesterday",
    lastThanked: "Last thanked 1 week ago",
    coverColor: "#863D46",
  },
  {
    id: "mp5",
    name: "Elena Rostova",
    relationship: "Art & Life Mentor",
    category: "life",
    duration: "Known for 5 years",
    trait: "Gentle wisdom",
    traitIcon: "heart-outline",
    avatarUri:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop&q=80",
    description:
      "Lifelong mentor and dear friend whose calm perspective steered me through early career doubts and creative crossroads.",
    meaningfulQuote:
      "Creativity begins only when you forgive yourself for the first five ugly drafts.",
    itemCount: 1,
    latestActivity: "5 days ago",
    lastThanked: "Last thanked yesterday",
    coverColor: "#9E4048",
  },
];

// ─── Wall Items ──────────────────────────────────────────────────────────────

export const WALL_ITEMS: WallItem[] = [
  // ─── Appreciation cards ───────────────────────────────────────
  {
    kind: "tribute",
    id: "t1",
    mentorId: "mp1",
    mentorName: "Mrs. Anita Sharma",
    relationship: "Teacher",
    title: "Appreciation for Careful Words",
    photoUri:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&auto=format&fit=crop&q=80",
    ],
    quote: "She taught me that a sentence written with care is an act of love.",
    story:
      "In Room 204, the autumn light came through tall casement windows and illuminated chalk dust floating in the air. When every other teacher corrected my grammar with quick red ink, Mrs. Sharma asked questions in the margins: 'Why this word here?' and 'What were you feeling when you wrote this turn of phrase?'\n\nShe never let me settle for easy clichés. One rainy afternoon in October, she stayed two full hours after the bell to help me rework an essay about my grandfather. She poured chamomile tea from an old thermos and said, 'The world will tempt you to say things fast. Promise me you will always take the time to say things true.'\n\nThat one afternoon shifted how I understand language. I carry her quiet patience with me every single time I put pen to paper.",
    lessonCarried:
      "Patience is not hesitation; it is the deliberate refusal to rush truth.",
    momentToRemember:
      "The rainy Tuesday in tenth grade when she handed back my paper with no grade, just the note: 'You found your voice today. Keep protecting it.'",
    achievements: [
      "Finished my first published short story collection",
      "Honours student in English Literature",
    ],
    createdAt: "2026-10-18",
    templateId: "editorial",
    frameStyle: "clean",
    typographyStyle: "serif",
    isPinned: true,
    isShared: true,
  },
  {
    kind: "tribute",
    id: "t2",
    mentorId: "mp3",
    mentorName: "Vikram Rao",
    relationship: "Engineering Director",
    title: "The Architecture of Trust",
    photoUri:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80",
    ],
    quote: "Build things that outlive your tenure and elevate people around you.",
    story:
      "When our core database cluster crashed at 2:00 AM on launch night, panic rippled through the war room. People were pointing fingers and voices were rising. Vikram walked in with a bag of warm croissants and thermos coffee. He did not ask who pushed the faulty migration. He pulled up a chair next to the junior engineer with shaking hands and whispered, 'We solve the problem first together. We examine how we built the system tomorrow.'\n\nUnder his steady leadership, we restored the cluster by sunrise. But more importantly, no one felt humiliated. Over the next three years, he taught me how to design scalable architectures that human beings actually enjoy maintaining.\n\nHe showed me that leadership is not about having every answer—it is about keeping the room grounded so the truth can surface.",
    lessonCarried:
      "Great engineering is ultimately a service to human beings, both those using it and those maintaining it.",
    momentToRemember:
      "At our product launch celebration, he quietly handed the award trophy to the apprentice intern and stood in the back row smiling.",
    achievements: [
      "Scaled the platform from zero to two million active users",
      "Promoted to Principal Architect under his mentorship",
    ],
    createdAt: "2026-10-15",
    templateId: "journal",
    frameStyle: "instant",
    typographyStyle: "display",
    isPinned: false,
    isShared: false,
  },

  // ─── Memories ─────────────────────────────────────────────────
  {
    kind: "memory",
    id: "m1",
    mentorId: "mp2",
    mentorName: "Dr. David Mitchell",
    relationship: "Research Advisor",
    title: "The Thursday Afternoons",
    excerpt:
      "Every Thursday we'd sit in his sunlit office and he'd challenge every assumption I brought in—and I'd leave a little less certain, a lot more alive.",
    story:
      "The wooden clock on Dr. Mitchell's bookshelf ticked with steady rhythm. The shelves were packed two rows deep with leather-bound journals and scientific treatises. Every Thursday at 3:00 PM was our scheduled check-in.\n\nI would come prepared with neat charts and confident hypotheses. He would listen with his head tilted, fingers folded under his chin, nodding warmly. Then he would smile disarmingly and ask a single, gentle question that unraveled my whole theory.\n\nAt first, it terrified me. But within a semester, I looked forward to Thursdays more than any other day of the week. He taught me that intellectual humility is not weakness—it is the prerequisite for discovering anything genuinely new.",
    imageUri:
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80",
    ],
    year: "2021",
    emotion: "Gratitude",
    emotionColor: Palette.accentPeach,
    quote: "Do not defend an idea simply because it was born in your own mind.",
    lessonCarried:
      "The joy of research is not being proven right; it is discovering where reality is richer than your models.",
    momentToRemember:
      "When our experimental run gave completely unexpected results and instead of frowning, he grinned and said: 'Now we are finally doing science.'",
    createdAt: "2026-10-12",
    isPinned: true,
  },
  {
    kind: "memory",
    id: "m2",
    mentorId: "mp4",
    mentorName: "Elena Rostova",
    relationship: "Art & Design Coach",
    title: "The Summer Workshop",
    excerpt:
      "She handed me a paintbrush in June and by August I'd stopped being afraid of blank things.",
    story:
      "The studio smelled of linseed oil, dry clay, and eucalyptus leaves. I had spent twenty years believing I didn't have an artistic bone in my body. On my first day, Elena took a tube of burnt sienna and smeared a bold, messy streak across the center of my pristine white canvas.\n\nI gasped. She laughed and handed me a wide hog-bristle brush: 'There. Now you cannot ruin it anymore, because it is already imperfect. Now you can only make it alive.'\n\nThat summer cracked open a part of my spirit that had been locked behind self-consciousness for decades. I learned to sketch without erasing, to welcome unexpected paint runs, and to understand that beauty often hides inside what feels unfinished.",
    imageUri:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&auto=format&fit=crop&q=80",
    ],
    year: "2019",
    emotion: "Joy",
    emotionColor: Palette.accentPink,
    quote: "Perfectionism is just fear disguised as high standards.",
    lessonCarried:
      "Start before you feel ready. The act of creation creates the confidence, not the other way around.",
    momentToRemember:
      "Sitting on the studio floor eating watermelon slices after six hours of painting, our fingers stained indigo and gold.",
    createdAt: "2026-10-08",
    isPinned: false,
  },
  {
    kind: "memory",
    id: "m3",
    mentorId: "mp1",
    mentorName: "Mrs. Anita Sharma",
    relationship: "Teacher",
    title: "When She Stayed Late",
    excerpt:
      "She stayed two hours after the bell rang, just to help me find the right word. That's the most someone can give — time.",
    story:
      "The hallway outside was empty and echoing with the sound of the janitor's mop. Sunset was turning the sky behind the school maple trees into amber and purple. I was stuck on the concluding paragraph of my college admissions essay, unable to express what my immigrant family's sacrifices meant without sounding formulaic.\n\nMrs. Sharma pulled up a wooden chair beside my desk. She didn't suggest sentences; she asked me about dinner conversations with my grandmother, about the smell of cardamoms in our kitchen, about what made my mother's hands calloused.\n\nShe gently said, 'Write those details down. Do not write what you think an admissions officer wants to read. Write the kitchen you love.' That was the night I learned honesty on the page.",
    imageUri:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80",
    year: "2015",
    emotion: "Moved",
    emotionColor: Palette.accentLavender,
    quote: "Specific truth is universal. Generalities touch nobody.",
    lessonCarried:
      "When someone gives you their undivided time and presence, they are giving you a piece of their life they will never get back.",
    createdAt: "2026-09-30",
    isPinned: false,
  },

  // ─── Letters ──────────────────────────────────────────────────
  {
    kind: "letter",
    id: "l1",
    mentorId: "mp3",
    mentorName: "Vikram Rao",
    relationship: "Engineering Director",
    title: "A Letter I Never Sent",
    preview:
      "Dear Vikram, There are things I should have said before you moved to London. About the night the whole product almost collapsed and you just stayed…",
    salutation: "Dear Vikram,",
    letterBody:
      "There are things I should have said before you packed up your desk and moved across the Atlantic. In the rush of handovers and farewell dinners, we talked mostly about tickets, roadmap milestones, and airport logistics.\n\nWhat I never had the courage to say plainly is how much you changed the trajectory of my life.\n\nWhen I first joined the team, I was terrified of speaking in architecture meetings. I thought my accent and my background made me an outsider. You noticed before anyone else did. You started deliberately passing questions to me: 'I know Sarah has looked at this caching layer, let us hear her thought.'\n\nYou gave me credit publicly and corrected me gently in private. You taught me how to lead with vulnerability instead of bravado.\n\nEven now, whenever our team faces a crisis, I ask myself: 'What would Vikram do?' And almost always, the answer is: take a breath, listen first, and protect the team.\n\nThank you for seeing who I could become before I saw it myself.",
    signoff: "With enduring gratitude,\nSarah",
    wordCount: 412,
    mood: "Reflective",
    quote: "Leadership is about creating the conditions for others to be brave.",
    lessonCarried:
      "Praise publicly, guide privately, and never let ego cloud collective mission.",
    momentToRemember:
      "The final team handshake on the 14th floor terrace overlooking the evening skyline.",
    createdAt: "2026-10-10",
    isPinned: false,
  },
  {
    kind: "letter",
    id: "l2",
    mentorId: "mp2",
    mentorName: "Dr. David Mitchell",
    relationship: "Research Advisor",
    title: "Thank You, From the Other Side",
    preview:
      "You probably don't remember the Tuesday you said 'just try.' But I do. And it changed everything about the direction I took.",
    salutation: "Dear Dr. Mitchell,",
    letterBody:
      "I am writing this from my new laboratory across the country, surrounded by unboxed monitors and whiteboard diagrams.\n\nYou probably do not remember a dreary Tuesday in November during my second year when I knocked on your door ready to quit the doctoral program. I had just received my third manuscript rejection and felt completely out of my depth.\n\nYou poured a cup of black coffee, handed me a dry-erase marker, and said two words that stayed anchored in my mind: 'Just try.'\n\nYou did not offer platitudes. You stood by the board and helped me map out an entirely new methodology. That paper went on to become the cornerstone of our patent.\n\nToday, I welcome my very first graduate students. As they sat nervously across from my desk this morning, I realized my greatest ambition as a professor is to be for them what you were for me.",
    signoff: "Ever your student,\nSarah Chen",
    wordCount: 287,
    mood: "Warm",
    quote: "Every breakthrough looks like a mistake until the very last step.",
    lessonCarried:
      "Mentorship is not a transaction; it is a torch passed forward to the next generation.",
    createdAt: "2026-09-25",
    isPinned: true,
  },

  // ─── Lessons ──────────────────────────────────────────────────
  {
    kind: "lesson",
    id: "ls1",
    mentorId: "mp1",
    mentorName: "Mrs. Anita Sharma",
    relationship: "Teacher",
    lessonTitle: "Patience is a Form of Respect",
    quote:
      "She never rushed my sentences. That silence taught me that good ideas need space before they become words.",
    category: "Life Philosophy",
    story:
      "Mrs. Sharma had a rare gift in a classroom of forty noisy teenagers: she was completely comfortable with silence. When she asked a difficult question, she would wait—sometimes thirty seconds, sometimes a full minute—letting the thoughts settle rather than jumping in with answers.\n\nShe once told me: 'When you interrupt someone because you already think you know what they will say, you are not communicating; you are performing. Wait for them.'\n\nI apply this every day in boardrooms, family dinners, and difficult conversations. Giving someone unhurried silence is one of the highest compliments you can pay them.",
    lessonCarried:
      "Silence is not empty time; it is the space where empathy does its work.",
    createdAt: "2026-10-05",
    isPinned: true,
  },
  {
    kind: "lesson",
    id: "ls2",
    mentorId: "mp2",
    mentorName: "Dr. David Mitchell",
    relationship: "Research Advisor",
    lessonTitle: "Always Ask the Next Question",
    quote:
      "He'd say — 'That's a good answer. Now what's the better question?' I use that every day in my work.",
    category: "Professional Growth",
    story:
      "In academia and in life, people are praised for having quick answers. Dr. Mitchell prized something far rarer: the discipline of framing the right inquiry.\n\nWhenever a student arrived triumphant with clean statistical findings, he would celebrate genuinely, then push their gaze further: 'What does this finding make possible to ask that we could not even conceive before?'\n\nThis single practice has saved me from resting on laurels and taught me to view every finish line as simply a clearer starting block.",
    lessonCarried:
      "Answers satisfy the present; better questions create the future.",
    createdAt: "2026-09-20",
    isPinned: false,
  },
  {
    kind: "lesson",
    id: "ls3",
    mentorId: "mp3",
    mentorName: "Vikram Rao",
    relationship: "Engineering Director",
    lessonTitle: "Done Is Better Than Perfect, But Care Matters",
    quote:
      "Ship it — but care while you build it. Both things are true and both are necessary.",
    category: "Engineering",
    story:
      "Vikram despised reckless shortcuts, but he had equal distaste for endless paralysis by analysis. He believed that real craftsmanship happens in public, in iterations, with genuine users rather than in theoretical isolation.\n\nHe would tell us: 'Put something honest into the world today. If it has heart and rigor, you can improve it tomorrow. But an unreleased masterpiece helps no one.'",
    lessonCarried:
      "Speed without soul creates clutter; perfectionism without delivery creates regret. Find the balance in honest craft.",
    createdAt: "2026-09-12",
    isPinned: false,
  },

  {
    kind: "memory",
    id: "journey-2016",
    mentorId: "mp1",
    mentorName: "Mrs. Anita Sharma",
    relationship: "Teacher",
    title: "First meeting",
    excerpt:
      "Walked into honors literature hesitant to speak. She asked for my opinion first.",
    story:
      "Walked into honors literature hesitant to speak. She asked for my opinion first.",
    year: "2016",
    emotion: "Hopeful",
    emotionColor: Palette.accentCoral,
    createdAt: "2016-09-01",
    isPinned: false,
  },

  // ─── Milestones ───────────────────────────────────────────────
  {
    kind: "milestone",
    id: "journey-2019",
    mentorId: "mp1",
    mentorName: "Mrs. Anita Sharma",
    relationship: "Teacher",
    title: "College recommendation",
    description:
      "A letter that opened doors across the country and changed where I could dream of going.",
    story:
      "A letter that opened doors across the country and changed where I could dream of going.",
    year: "2019",
    type: "life-change",
    accentColor: Palette.accentAmber,
    createdAt: "2019-11-01",
    isPinned: false,
  },
  {
    kind: "milestone",
    id: "journey-2022",
    mentorId: "mp2",
    mentorName: "Dr. David Mitchell",
    relationship: "Research Advisor",
    title: "First job offer",
    description:
      "He rehearsed my interview with me three times, and then told me I did not need to.",
    story:
      "He rehearsed my interview with me three times, and then told me I did not need to.",
    year: "2022",
    type: "life-change",
    accentColor: Palette.accentPink,
    createdAt: "2022-06-01",
    isPinned: false,
  },
  {
    kind: "milestone",
    id: "ms1",
    mentorId: "mp2",
    mentorName: "Dr. David Mitchell",
    relationship: "Research Advisor",
    title: "First Research Paper Published",
    description:
      "He co-signed the submission and told me my instinct was already publishable. That was the moment I stopped doubting my own thinking.",
    story:
      "The notification email arrived on an overcast Thursday in March: 'Manuscript Accepted for Publication with Distinction.' I ran up the three flights of stairs to Dr. Mitchell's office, papers clutched in hand. He printed out the title page, taped it to the corkboard beside his desk, and said: 'Remember this feeling. The world now knows what you know.'\n\nThat milestone broke the spell of imposter syndrome that had haunted me for years.",
    year: "2022",
    type: "breakthrough",
    accentColor: Palette.accentPeach,
    quote: "You belong in every room your hard work has earned entry to.",
    achievements: [
      "Published in the National Journal of Computational Science",
      "Presented oral keynote at the Annual Graduate Symposium",
    ],
    createdAt: "2026-10-01",
    isPinned: true,
  },
  {
    kind: "milestone",
    id: "ms2",
    mentorId: "mp1",
    mentorName: "Mrs. Anita Sharma",
    relationship: "Teacher",
    title: "Graduated with Honours",
    description:
      "She was in the front row. She'd read the thesis three times and told me every flaw — which made standing on that stage feel earned.",
    story:
      "On commencement morning, amidst hundreds of caps and gowns, I spotted Mrs. Sharma sitting proudly next to my parents. She had driven ninety miles to be there. When my name was announced and I walked across the stage to receive the departmental honours medal, she was the first to stand.\n\nAfterward, she handed me an inscribed fountain pen with the words: 'To a writer of truth.'",
    year: "2018",
    type: "graduation",
    accentColor: Palette.accentLavender,
    quote: "Honours fade; the discipline of craft remains.",
    achievements: [
      "Summa Cum Laude in English Literature",
      "Recipient of the Faculty Departmental Medal",
    ],
    createdAt: "2026-09-15",
    isPinned: false,
  },
  {
    kind: "milestone",
    id: "ms3",
    mentorId: "mp3",
    mentorName: "Vikram Rao",
    relationship: "Engineering Director",
    title: "Launched First Product",
    description:
      "Vikram was the first person I called. He said 'That's just the beginning.' He was right.",
    story:
      "At 9:00 AM on a Monday, the deploy script ran clean and our consumer app went live to fifty thousand initial users. My heart was in my throat. Vikram dialed my cell from the airport lounge where he was traveling for a conference: 'Look out the window. The sky did not fall. You built something that works. Now enjoy today, because tomorrow the real learning begins.'",
    year: "2023",
    type: "life-change",
    accentColor: Palette.accentSky,
    quote: "Every beginning requires the bravery to be misunderstood at first.",
    achievements: [
      "Featured #1 Product of the Day on Launch Week",
      "Grew active users to over 50,000 in first quarter",
    ],
    createdAt: "2026-09-05",
    isPinned: false,
  },
];

export const JOURNEY_NODES: JourneyNode[] = [
  {
    id: "journey-2016",
    memoryId: "journey-2016",
    year: "2016",
    title: "First meeting",
    mentorName: "Mrs. Anita Sharma",
    snippet:
      "Walked into honors literature hesitant to speak. She asked for my opinion first.",
  },
  {
    id: "journey-2019",
    memoryId: "journey-2019",
    year: "2019",
    title: "College recommendation",
    mentorName: "Mrs. Anita Sharma",
    snippet:
      "A letter that opened doors across the country and changed where I could dream of going.",
    isMilestone: true,
  },
  {
    id: "journey-2022",
    memoryId: "journey-2022",
    year: "2022",
    title: "First job offer",
    mentorName: "Dr. David Mitchell",
    snippet:
      "He rehearsed my interview with me three times, and then told me I did not need to.",
  },
];

export function getJourneyNodes(items: WallItem[]): JourneyNode[] {
  return JOURNEY_NODES.flatMap((node) => {
    const item = items.find((candidate) => candidate.id === node.memoryId);
    if (!item) return [];

    const title =
      "title" in item && item.title
        ? item.title
        : "lessonTitle" in item
          ? item.lessonTitle
          : node.title;
    const snippet =
      ("story" in item && item.story) ||
      ("description" in item && item.description) ||
      ("excerpt" in item && item.excerpt) ||
      node.snippet;

    return [{
      ...node,
      year: "year" in item ? item.year : node.year,
      title,
      mentorName: item.mentorName,
      snippet,
      isMilestone: item.kind === "milestone",
    }];
  });
}

// ─── Filter Tabs ─────────────────────────────────────────────────────────────

export const WALL_FILTER_TABS: WallFilterTab[] = [
  { key: "all", label: "All", icon: "apps", count: WALL_ITEMS.length },
  {
    key: "tributes",
    label: "Appreciation",
    icon: "heart",
    count: WALL_ITEMS.filter((i) => i.kind === "tribute").length,
  },
  {
    key: "memories",
    label: "Memories",
    icon: "images",
    count: WALL_ITEMS.filter((i) => i.kind === "memory").length,
  },
  {
    key: "letters",
    label: "Letters",
    icon: "mail",
    count: WALL_ITEMS.filter((i) => i.kind === "letter").length,
  },
  {
    key: "lessons",
    label: "Lessons",
    icon: "bulb",
    count: WALL_ITEMS.filter((i) => i.kind === "lesson").length,
  },
  {
    key: "milestones",
    label: "Milestones",
    icon: "flag",
    count: WALL_ITEMS.filter((i) => i.kind === "milestone").length,
  },
];
