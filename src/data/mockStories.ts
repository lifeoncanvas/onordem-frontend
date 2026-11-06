import {
  CategoryItem,
  FeelingPromptItem,
  LessonQuote,
  Story,
} from "@/types/story";

export const RELATIONSHIP_CATEGORIES: CategoryItem[] = [
  { key: "all", label: "All", iconName: "sparkles-outline" },
  { key: "Teachers", label: "Teachers", iconName: "school-outline" },
  { key: "Parents", label: "Parents", iconName: "heart-outline" },
  { key: "Coaches", label: "Coaches", iconName: "trophy-outline" },
  { key: "Friends", label: "Friends", iconName: "people-outline" },
  { key: "Leaders", label: "Leaders", iconName: "compass-outline" },
  { key: "Others", label: "Others", iconName: "bulb-outline" },
];

export const FEELING_PROMPTS: FeelingPromptItem[] = [
  {
    id: "believed",
    title: "Someone who believed in me",
    subtitle: "When doubt was louder than hope",
    iconName: "flame-outline",
  },
  {
    id: "advice",
    title: "Advice I still follow",
    subtitle: "Words that guide my everyday choices",
    iconName: "compass-outline",
  },
  {
    id: "second_chance",
    title: "A second chance",
    subtitle: "When grace changed the trajectory",
    iconName: "leaf-outline",
  },
  {
    id: "kindness",
    title: "A kindness I never forgot",
    subtitle: "A silent gesture that healed a wound",
    iconName: "heart-circle-outline",
  },
];

export const FEATURED_STORY: Story = {
  id: "featured-1",
  title: "The Teacher Who Believed in Me",
  relationship: "Teacher",
  relationshipCategory: "Teachers",
  feelingThemeId: "believed",
  excerpt:
    "When I was ready to give up, one person's belief gave me the courage to try again.",
  fullStory:
    "There was a time when I wanted to give up. I had convinced myself that I wasn't capable of achieving the things I dreamed about. But one teacher saw something in me that I couldn't see in myself.\n\nDuring my sophomore year, I was drowning under the weight of self-doubt. Every assignment felt like proof that I did not belong. One cold November afternoon, Mr. Harrison called me back to his desk. He did not reprimand my failing test score; instead, he unfolded an essay I had written two years earlier.\n\n'I don't judge your ability by your bad weeks,' he told me gently. 'I judge you by your quiet moments of genius. Rest if you must, but don't you dare stop writing.' That simple acknowledgement rewrote the story I had been telling myself.\n\nOver the months that followed, he stayed late after the final bell. He helped me break large fears into manageable craft, teaching me how to structure thoughts and trust my intuition. He showed me that mentorship is not about having all the answers, but about holding a lantern when another soul is walking in the dark.\n\nToday, whenever I face an insurmountable challenge, I hear his quiet conviction echoing in the back of my mind. One person's steadfast belief didn't just save my grades—it charted the course of my entire life.",
  paragraphs: [
    "There was a time when I wanted to give up. I had convinced myself that I wasn't capable of achieving the things I dreamed about. But one teacher saw something in me that I couldn't see in myself.",
    "During my sophomore year, I was drowning under the weight of self-doubt. Every assignment felt like proof that I did not belong. One cold November afternoon, Mr. Harrison called me back to his desk after class. He did not reprimand my failing test score; instead, he gently unfolded an essay I had written two years earlier.",
    "'I don't judge your ability by your bad weeks,' he told me gently. 'I judge you by your quiet moments of genius. Rest if you must, but don't you dare stop writing.' That simple acknowledgement rewrote the story I had been telling myself.",
    "Over the months that followed, he stayed late after the final bell. He helped me break large fears into manageable craft, teaching me how to structure thoughts and trust my intuition. He showed me that mentorship is not about having all the answers, but about holding a lantern when another soul is walking in the dark.",
    "Today, whenever I face an insurmountable challenge, I hear his quiet conviction echoing in the back of my mind. One person's steadfast belief didn't just save my grades—it charted the course of my entire life.",
  ],
  author: "A Former Student",
  authorRole: "Mentored in High School",
  readTime: "5 min read",
  publishedDate: "October 2026",
  imageUrl:
    "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=80",
  isFeatured: true,
  isBookmarked: false,
  keyLesson:
    "Sometimes, believing in someone is the first step toward helping them believe in themselves.",
  reflectionQuestion: "Who helped you believe in yourself?",
  reflectionContext:
    "A moment of encouragement became the beginning of a different future. Sometimes, one person's belief can change the way we see ourselves.",
  keywords: ["teacher", "belief", "courage", "school", "writing", "inspiration", "hope"],
  relatedStoryIds: ["story-1", "story-2", "story-3"],
};

export const STORIES_DATA: Story[] = [
  {
    id: "story-1",
    title: "The Advice I Understood Years Later",
    relationship: "Leader",
    relationshipCategory: "Leaders",
    feelingThemeId: "advice",
    excerpt:
      "He told me to stop rushing toward the finish line and learn how to carry the people beside me.",
    fullStory:
      "When I landed my first leadership role at twenty-four, I was obsessed with velocity. My mentor, an architect named Paul, watched me burn out my entire junior team within three months. One evening over bitter black coffee, he drew a bridge on a napkin. 'A bridge doesn't boast about how fast cars cross it,' he whispered. 'Its glory is in how much weight it can carry without crumbling.' It took seven years, two failed projects, and a heartbreak for me to realize that genuine leadership isn't about being first—it's about building strong arches so others can safely cross.",
    paragraphs: [
      "When I landed my first leadership role at twenty-four, I was obsessed with velocity. I measured my worth by the speed of our deliverables, unaware of the toll it was taking on everyone around me.",
      "My mentor, an architect named Paul, watched me burn out my entire junior team within three months. Instead of scolding me, he invited me over for coffee. On the back of a paper napkin, he sketched a suspension bridge.",
      "'A bridge doesn't boast about how fast cars cross it,' he whispered. 'Its glory is in how much weight it can carry without crumbling.'",
      "It took seven years, two failed projects, and a heartbreak for me to truly understand his counsel. Genuine leadership isn't about rushing forward—it's about building strong arches so others can safely cross with you.",
    ],
    author: "By Daniel Vance",
    authorRole: "Engineering Lead",
    readTime: "3 min read",
    publishedDate: "September 2026",
    imageUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=700&auto=format&fit=crop&q=80",
    isBookmarked: false,
    keyLesson: "Leadership is the quiet art of bearing weight so others can walk forward.",
    reflectionQuestion: "What piece of guidance did you only understand with time?",
    reflectionContext:
      "True wisdom rarely makes sense immediately. It ripens as we face the trials it was meant to prepare us for.",
    keywords: ["advice", "leadership", "patience", "career", "wisdom", "mentor"],
    relatedStoryIds: ["featured-1", "story-6", "story-5"],
  },
  {
    id: "story-2",
    title: "When Someone Refused to Give Up on Me",
    relationship: "Teacher",
    relationshipCategory: "Teachers",
    feelingThemeId: "second_chance",
    excerpt:
      "Everyone had written me off as restless and unteachable, except Mrs. Callahan.",
    fullStory:
      "I was the troublemaker who sat in the corner, staring out the window and skipping tests. The school was preparing to transfer me to a disciplinary program. Mrs. Callahan volunteered to mentor me every Tuesday after school. She didn't force-feed me math equations; she handed me charcoal pencils and asked me to draw the shadows on the oak tree outside. She taught me that energy without focus turns into rebellion, but channeled into passion, it creates art. She stayed after hours for ten months until I passed my exams.",
    paragraphs: [
      "I was the kid every substitute teacher warned the principal about. Restless, argumentative, and convinced that nobody understood what was happening behind my closed bedroom door at home.",
      "The administration was preparing paperwork to transfer me to an alternative disciplinary facility. Then Mrs. Callahan stepped in. She volunteered her own unpaid Tuesday afternoons to tutor me.",
      "She never opened a textbook during our first month. Instead, she handed me charcoal pencils and asked me to draw the tangled branches of the oak tree outside the window. She recognized that my anger was just unchanneled creative friction.",
      "She stayed with me through ten agonizing months of doubts, tears, and drafts. Because one person refused to walk away, I didn't just graduate—I became an art educator myself.",
    ],
    author: "By Rachel Green",
    authorRole: "High School Art Educator",
    readTime: "5 min read",
    publishedDate: "August 2026",
    imageUrl:
      "https://images.unsplash.com/photo-1544717305-2782549b5136?w=700&auto=format&fit=crop&q=80",
    isBookmarked: false,
    keyLesson: "Patience is love in action. It refuses to judge the final harvest by a dry season.",
    reflectionQuestion: "Who stayed by your side when everyone else walked away?",
    reflectionContext:
      "Unconditional patience is rare and sacred. It leaves an indelible blueprint of empathy in whoever receives it.",
    keywords: ["perseverance", "teacher", "second chance", "art", "discipline", "unconditional"],
    relatedStoryIds: ["featured-1", "story-4", "story-3"],
  },
  {
    id: "story-3",
    title: "The Small Act of Kindness I Still Remember",
    relationship: "Friend",
    relationshipCategory: "Friends",
    feelingThemeId: "kindness",
    excerpt:
      "Without saying a word, she slid half her notebook across the library desk when I broke down in tears.",
    fullStory:
      "I had just lost my grandfather the night before midterm exams. I was sitting alone in the university basement library, trembling and unable to comprehend the printed words. Claire, a classmate I had only exchanged polite nods with, sat down opposite me. She didn't offer empty platitudes or ask intrusive questions. She simply poured me hot ginger tea from her thermos, opened her detailed summary notes, and pushed them toward my hands. That quiet, wordless companionship kept me afloat that entire week.",
    paragraphs: [
      "I had just lost my grandfather the night before my most difficult midterm exams. I was sitting in the chilly basement library, trembling and utterly unable to comprehend the syllabus.",
      "Claire, an acquaintance who usually sat two rows ahead of me in lecture, noticed my tears. She didn't offer hollow platitudes or ask what went wrong.",
      "Without saying a word, she pulled out a steel thermos, poured me a cup of steaming ginger tea, and slid her beautifully transcribed summary notes across the mahogany table.",
      "In moments of deep sorrow, words often fall short. Her silence and practical generosity gave me enough warmth to survive that heartbreaking semester.",
    ],
    author: "By Elena Rostova",
    authorRole: "Classmate & Lifelong Friend",
    readTime: "3 min read",
    publishedDate: "July 2026",
    imageUrl:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=700&auto=format&fit=crop&q=80",
    isBookmarked: true,
    keyLesson: "The deepest kindness is often silent. It doesn't demand explanations.",
    reflectionQuestion: "What small gesture gave you unexpected strength?",
    reflectionContext:
      "We often overestimate the necessity of grand speeches, while simple kindness heals the deepest fractures.",
    keywords: ["kindness", "friend", "grief", "compassion", "silence", "support"],
    relatedStoryIds: ["story-7", "featured-1", "story-2"],
  },
  {
    id: "story-4",
    title: "The Coach Who Taught Me to Keep Going",
    relationship: "Coach",
    relationshipCategory: "Coaches",
    feelingThemeId: "believed",
    excerpt:
      "He saw my twisted ankle in the qualifying heat and taught me what courage actually looks like.",
    fullStory:
      "I sprained my ankle fifty meters before the semifinal finish line. As the medics rushed over, Coach Alvarez knelt in the dirt beside me. He didn't care about the gold medal slipping away; he looked into my eyes and said, 'The race isn't in your legs today, son. It's in your willingness to stand back up on Monday morning.' He personally accompanied me to rehabilitation every single morning for six months. He taught me that champions aren't defined by their trophies, but by how they honor the dignity of the climb.",
    paragraphs: [
      "I tore my ligament fifty meters before the state semifinal finish line. As the medical team rushed out, Coach Alvarez was the first to reach me in the red dirt.",
      "He didn't sigh over the lost trophy. He looked straight into my tears and said: 'The race isn't in your legs today, son. It's in your willingness to show up on Monday morning.'",
      "For six grueling months, he met me at the gymnasium at 6:00 AM before classes, walking beside me as I learned to run without fear.",
      "He taught me that resilience is not a trophy you win; it's a character you forge every time you refuse to stay in the dust.",
    ],
    author: "By Marcus Thorne",
    authorRole: "Collegiate Athlete",
    readTime: "4 min read",
    publishedDate: "June 2026",
    imageUrl:
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=700&auto=format&fit=crop&q=80",
    isBookmarked: false,
    keyLesson: "Courage isn't the absence of falling; it's the refusal to stay down.",
    reflectionQuestion: "Who taught you how to recover after a painful loss?",
    reflectionContext:
      "Defeat tests our pride, but the mentors who stand with us in the dirt turn loss into character.",
    keywords: ["coach", "sports", "courage", "resilience", "rehabilitation", "discipline"],
    relatedStoryIds: ["featured-1", "story-1", "story-2"],
  },
  {
    id: "story-5",
    title: "A Parent's Lesson That Stayed With Me",
    relationship: "Parent",
    relationshipCategory: "Parents",
    feelingThemeId: "advice",
    excerpt:
      "My father's hands were calloused from ironwork, but his counsel was softer than silk.",
    fullStory:
      "My father worked thirty years in the steel mill. One evening when I was feeling bitter about not receiving credit for a community project, he showed me the foundation stones of our house. 'Nobody ever compliments the stones buried underground,' he said gently, tapping his boot on the granite slab. 'Yet without them, the roof caves in before the first storm. Do your work for the integrity of the roof, not for the applause of the street.' That single lesson saved me from a lifetime of chasing vanity.",
    paragraphs: [
      "My father worked thirty years in the blast furnaces of the steel mill. His hands were weathered and calloused, but his words carried the weight of pure gold.",
      "When I was twenty, I complained bitterly about doing days of unacknowledged volunteer labor for our local town hall. He walked me outside into the evening chill and pointed at the foundation stones beneath our front porch.",
      "'Nobody ever compliments the stones buried underground,' he said quietly. 'Yet without them, the roof caves in before the first autumn squall. Do your work for the integrity of the roof, son, not for the applause of the street.'",
      "That single conversation became my North Star through decades of public service.",
    ],
    author: "By Tariq Al-Mansoor",
    authorRole: "Architect & Son",
    readTime: "4 min read",
    publishedDate: "May 2026",
    imageUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=700&auto=format&fit=crop&q=80",
    isBookmarked: false,
    keyLesson: "Build your character like a foundation stone: unshakeable, even when hidden.",
    reflectionQuestion: "What principle did your parents embody without needing words?",
    reflectionContext:
      "The strongest values aren't lectured; they are quietly lived in daily duty and humility.",
    keywords: ["parent", "father", "humility", "wisdom", "integrity", "advice", "family"],
    relatedStoryIds: ["story-1", "featured-1", "story-6"],
  },
  {
    id: "story-6",
    title: "The Second Chance That Saved My Career",
    relationship: "Leader",
    relationshipCategory: "Leaders",
    feelingThemeId: "second_chance",
    excerpt:
      "I deleted the client database on a Friday evening. My director called me in on Monday with a notebook.",
    fullStory:
      "It was a catastrophic human error that cost thousands of dollars to restore. I walked into Director Sandra's office with my resignation letter drafted. She looked at me, slid the letter back across the mahogany desk, and said: 'Why would I let you resign after spending so much money on the most valuable lesson of your career? Write down what you learned and teach the entire department tomorrow.' Her profound trust transformed my paralyzing terror into fierce loyalty and excellence.",
    paragraphs: [
      "It was a catastrophic human error on a Friday afternoon that wiped out three days of mission-critical production data.",
      "I arrived on Monday morning with my formal resignation letter already folded in my coat pocket, expecting immediate termination.",
      "Director Sandra looked at the letter, slid it gently back across her desk, and poured me a cup of water. 'Why would I accept your resignation after we just invested thousands in the most valuable lesson of your career?'",
      "She asked me to write down the preventative protocols and lead the all-hands training. Her unexpected trust turned paralyzing terror into lifelong dedication.",
    ],
    author: "By Julian Hayes",
    authorRole: "Systems Operations Manager",
    readTime: "4 min read",
    publishedDate: "April 2026",
    imageUrl:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=700&auto=format&fit=crop&q=80",
    isBookmarked: false,
    keyLesson: "Grace turns mistakes into wisdom. Fear only buries them.",
    reflectionQuestion: "When were you granted mercy instead of punishment?",
    reflectionContext:
      "A leader who extends grace when failure is evident inspires a depth of loyalty that rules could never enforce.",
    keywords: ["second chance", "leader", "workplace", "grace", "mistakes", "trust"],
    relatedStoryIds: ["story-1", "story-2", "featured-1"],
  },
  {
    id: "story-7",
    title: "The Stranger's Umbrella on a Rainy Tuesday",
    relationship: "Other",
    relationshipCategory: "Others",
    feelingThemeId: "kindness",
    excerpt:
      "An elderly bookkeeper handed me her blue umbrella and disappeared into the autumn storm.",
    fullStory:
      "I was waiting outside the hospital after receiving devastating family news, completely drenched by a sudden November downpour. An elderly woman walking past stopped, pressed her sturdy blue umbrella into my hands, pressed my shoulder gently, and whispered, 'The storm always passes, darling. Hold onto this.' Before I could thank her or ask for her address, she had turned the corner. Whenever life turns dark, that blue umbrella reminds me of the anonymous mercy stitched into the fabric of everyday humanity.",
    paragraphs: [
      "I had just stepped out of the oncology clinic after receiving heartbreaking news about my mother, standing in the stinging November rain in total shock.",
      "An elderly woman walking toward the subway station saw me shivering on the curb without an overcoat.",
      "Without asking what had happened, she walked over, placed her sturdy navy umbrella firmly into my hands, pressed my wrist, and said: 'The storm always passes, darling. Hold onto this.'",
      "She vanished into the crowd before I could ask her name. That blue umbrella hangs in my hallway today, a constant reminder of the grace carried by strangers.",
    ],
    author: "By Sophia Chen",
    authorRole: "Writer & Daughter",
    readTime: "3 min read",
    publishedDate: "March 2026",
    imageUrl:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=700&auto=format&fit=crop&q=80",
    isBookmarked: false,
    keyLesson: "Human kindness is contagious. One quiet gesture can echo for decades.",
    reflectionQuestion: "What anonymous kindness has stayed with you through the years?",
    reflectionContext:
      "We often never see the stranger again, but their presence becomes an anchor during our darkest hours.",
    keywords: ["kindness", "stranger", "compassion", "mercy", "storm", "hope"],
    relatedStoryIds: ["story-3", "featured-1", "story-2"],
  },
];

export const WISDOM_LESSON: LessonQuote = {
  id: "lesson-primary",
  quote:
    "Sometimes the right words from one person can change the direction of a life.",
  attribution: "A lesson from a mentor",
  storyTitle: "The Teacher Who Believed in Me",
  storyId: "featured-1",
  isSaved: false,
};

export function getStoryById(id?: string): Story {
  if (!id) return FEATURED_STORY;
  if (id === FEATURED_STORY.id) return FEATURED_STORY;
  const found = STORIES_DATA.find((s) => s.id === id);
  return found ?? FEATURED_STORY;
}

export function getAllStories(): Story[] {
  return [FEATURED_STORY, ...STORIES_DATA];
}
