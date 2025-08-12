import { BookOpen, Heart, Sun, Moon } from 'lucide-react-native';

export const activities = [
  {
    id: 1,
    icon: Heart,
    title: 'Prayer Time',
    duration: '11 mins / 15 mins',
    progress: 73,
    streak: 0,
    color: 'red'
  },
  {
    id: 2,
    icon: BookOpen,
    title: 'Bible Reading',
    duration: '10 mins / 1 chapter',
    progress: 60,
    streak: 0,
    color: 'blue'
  },
  {
    id: 3,
    icon: Sun,
    title: 'Devotional',
    duration: '0 mins / 20 mins',
    progress: 0,
    streak: 0,
    color: 'orange'
  },
  {
    id: 4,
    icon: Moon,
    title: 'Evening Prayer',
    duration: '0 mins / 10 mins',
    progress: 0,
    streak: 0,
    color: 'purple'
  },
];

export const realStuffCards = [
  // FAITH PILLAR (Muted Indigo + Soft Light)
  {
    id: 1,
    pillar: 'Faith',
    title: 'What if I never feel God again?',
    subtext: 'I keep praying. I keep showing up. But lately… it\'s just been quiet.',
    scripture: 'Be still and know that I am God.',
    scriptureRef: 'Psalm 46:10',
    reflection: 'The quiet isn\'t abandonment—it\'s where trust gets built. Keep showing up. He\'s still there.',
    color: 'indigo',
    gradient: 'from-indigo-400 via-blue-400 to-indigo-300',
    bgEffect: 'light-flare',
    actions: ['Reflect With God', 'Ask Adina', 'I Feel This']
  },
  {
    id: 2,
    pillar: 'Faith',
    title: 'I\'m tired of waiting for breakthrough.',
    subtext: 'Everyone else seems to get their miracle. I just get more waiting.',
    scripture: 'Those who wait on the Lord shall renew their strength.',
    scriptureRef: 'Isaiah 40:31',
    reflection: 'Your timeline isn\'t broken. Sometimes the waiting is the breakthrough.',
    color: 'indigo',
    gradient: 'from-indigo-400 via-blue-400 to-indigo-300',
    bgEffect: 'light-flare',
    actions: ['Reflect With God', 'Ask Adina', 'I Feel This']
  },
  {
    id: 3,
    pillar: 'Faith',
    title: 'I overthink everything—even my prayers.',
    subtext: 'Do I sound holy enough? Am I saying the right words?',
    scripture: 'The Spirit intercedes with groanings too deep for words.',
    scriptureRef: 'Romans 8:26',
    reflection: 'God doesn\'t need your perfect words. He already knows your heart.',
    color: 'indigo',
    gradient: 'from-indigo-400 via-blue-400 to-indigo-300',
    bgEffect: 'light-flare',
    actions: ['Reflect With God', 'Ask Adina', 'I Feel This']
  },
  {
    id: 4,
    pillar: 'Faith',
    title: 'I don\'t feel worthy to talk to God.',
    subtext: 'I messed up again. How can I even face Him after this?',
    scripture: 'Come boldly to the throne of grace…',
    scriptureRef: 'Hebrews 4:16',
    reflection: 'You don\'t clean up first. You come as you are and He does the healing.',
    color: 'indigo',
    gradient: 'from-indigo-400 via-blue-400 to-indigo-300',
    bgEffect: 'light-flare',
    actions: ['Reflect With God', 'Ask Adina', 'I Feel This']
  },
  {
    id: 5,
    pillar: 'Faith',
    title: 'Is God disappointed in me?',
    subtext: 'I keep making the same mistakes. He must be so tired of me.',
    scripture: 'There is no condemnation for those in Christ.',
    scriptureRef: 'Romans 8:1',
    reflection: 'God\'s love doesn\'t waver with your performance. He\'s proud of your progress.',
    color: 'indigo',
    gradient: 'from-indigo-400 via-blue-400 to-indigo-300',
    bgEffect: 'light-flare',
    actions: ['Reflect With God', 'Ask Adina', 'I Feel This']
  },

  // LOVE PILLAR (Warm Blush + Subtle Glow)
  {
    id: 6,
    pillar: 'Love',
    title: 'I\'m scared I\'ll never find real love.',
    subtext: 'Everyone around me seems to have found their person. What if I\'m meant to be alone?',
    scripture: 'I have loved you with an everlasting love.',
    scriptureRef: 'Jeremiah 31:3',
    reflection: 'You are already deeply loved. Human love is a gift, not a requirement for your worth.',
    color: 'rose',
    gradient: 'from-rose-300 via-pink-300 to-orange-200',
    bgEffect: 'subtle-glow',
    actions: ['Open My Heart', 'Ask Adina', 'I Feel This']
  },
  {
    id: 7,
    pillar: 'Love',
    title: 'I give so much but get so little back.',
    subtext: 'I\'m always the one reaching out, caring more, trying harder.',
    scripture: 'Love does not dishonor… it does not insist on its own way.',
    scriptureRef: '1 Corinthians 13',
    reflection: 'Your heart is beautiful. Just make sure you\'re not pouring from an empty cup.',
    color: 'rose',
    gradient: 'from-rose-300 via-pink-300 to-orange-200',
    bgEffect: 'subtle-glow',
    actions: ['Open My Heart', 'Ask Adina', 'I Feel This']
  },
  {
    id: 8,
    pillar: 'Love',
    title: 'I don\'t feel lovable.',
    subtext: 'I watch everyone else get chosen, complimented, pursued. What\'s wrong with me?',
    scripture: 'You are fearfully and wonderfully made.',
    scriptureRef: 'Psalm 139:14',
    reflection: 'God made you exactly as you are, on purpose. You are already His beloved.',
    color: 'rose',
    gradient: 'from-rose-300 via-pink-300 to-orange-200',
    bgEffect: 'subtle-glow',
    actions: ['Open My Heart', 'Ask Adina', 'I Feel This']
  },
  {
    id: 9,
    pillar: 'Love',
    title: 'I feel like I have to be perfect to be loved.',
    subtext: 'If I show my flaws, my struggles, my real self—will they stay?',
    scripture: 'We love because He first loved us.',
    scriptureRef: '1 John 4:19',
    reflection: 'Love isn\'t a performance. The right people will love you because of who you are, not despite it.',
    color: 'rose',
    gradient: 'from-rose-300 via-pink-300 to-orange-200',
    bgEffect: 'subtle-glow',
    actions: ['Open My Heart', 'Ask Adina', 'I Feel This']
  },
  {
    id: 10,
    pillar: 'Love',
    title: 'I confused attention with love.',
    subtext: 'I was so hungry for affection that I couldn\'t tell the difference.',
    scripture: 'Love is patient, love is kind…',
    scriptureRef: '1 Corinthians 13:4-7',
    reflection: 'Real love feels peaceful, not anxious. It adds to your life instead of draining it.',
    color: 'rose',
    gradient: 'from-rose-300 via-pink-300 to-orange-200',
    bgEffect: 'subtle-glow',
    actions: ['Open My Heart', 'Ask Adina', 'I Feel This']
  },

  // RELATIONSHIPS PILLAR (Soft Teal + Gentle Wave)
  {
    id: 11,
    pillar: 'Relationships',
    title: 'They stopped responding to my messages.',
    subtext: 'We used to talk all the time. Now I\'m left wondering what I did wrong.',
    scripture: 'The Lord is close to the brokenhearted…',
    scriptureRef: 'Psalm 34:18',
    reflection: 'Sometimes people pull away for reasons that have nothing to do with you. Let them go with grace.',
    color: 'teal',
    gradient: 'from-teal-300 via-cyan-300 to-blue-200',
    bgEffect: 'gentle-wave',
    actions: ['Find Peace', 'Ask Adina', 'I Feel This']
  },
  {
    id: 12,
    pillar: 'Relationships',
    title: 'I\'m always the one making effort.',
    subtext: 'I\'m the one texting first, planning hangouts, checking in. It feels one-sided.',
    scripture: 'Two are better than one…',
    scriptureRef: 'Ecclesiastes 4:9',
    reflection: 'You deserve people who match your energy. Your effort is a gift—give it to those who appreciate it.',
    color: 'teal',
    gradient: 'from-teal-300 via-cyan-300 to-blue-200',
    bgEffect: 'gentle-wave',
    actions: ['Find Peace', 'Ask Adina', 'I Feel This']
  },
  {
    id: 13,
    pillar: 'Relationships',
    title: 'I don\'t know how to set boundaries.',
    subtext: 'I say yes to everything and then feel overwhelmed and resentful.',
    scripture: 'Let your yes be yes…',
    scriptureRef: 'Matthew 5:37',
    reflection: 'Boundaries aren\'t walls—they\'re bridges to healthier relationships. Start small.',
    color: 'teal',
    gradient: 'from-teal-300 via-cyan-300 to-blue-200',
    bgEffect: 'gentle-wave',
    actions: ['Find Peace', 'Ask Adina', 'I Feel This']
  },
  {
    id: 14,
    pillar: 'Relationships',
    title: 'I\'m afraid to trust people.',
    subtext: 'I\'ve been hurt before. What if I open up and they disappoint me again?',
    scripture: 'Love always trusts…',
    scriptureRef: '1 Corinthians 13:7',
    reflection: 'Healing takes time. It\'s okay to go slow. Trust will come again when you\'re ready.',
    color: 'teal',
    gradient: 'from-teal-300 via-cyan-300 to-blue-200',
    bgEffect: 'gentle-wave',
    actions: ['Find Peace', 'Ask Adina', 'I Feel This']
  },
  {
    id: 15,
    pillar: 'Relationships',
    title: 'I feel invisible in my friend group.',
    subtext: 'I\'m physically there but emotionally forgotten. I wonder if they\'d notice if I stopped coming.',
    scripture: 'You are the God who sees me.',
    scriptureRef: 'Genesis 16:13',
    reflection: 'God sees you fully and loves what He sees. That\'s your foundation—everything else is extra.',
    color: 'teal',
    gradient: 'from-teal-300 via-cyan-300 to-blue-200',
    bgEffect: 'gentle-wave',
    actions: ['Find Peace', 'Ask Adina', 'I Feel This']
  },

  // LUST PILLAR (Clean Clay Rose + Soft Texture)
  {
    id: 16,
    pillar: 'Lust',
    title: 'I keep falling into the same patterns.',
    subtext: 'I delete the apps, block the sites, but somehow I always end up back here.',
    scripture: 'Blessed are the pure in heart…',
    scriptureRef: 'Matthew 5:8',
    reflection: 'Every time you start over, you\'re choosing hope over shame. That\'s not failure—that\'s courage.',
    color: 'clay',
    gradient: 'from-orange-300 via-rose-300 to-pink-200',
    bgEffect: 'soft-texture',
    actions: ['Start Fresh', 'Ask Adina', 'I Feel This']
  },
  {
    id: 17,
    pillar: 'Lust',
    title: 'I compromise my values when I\'m lonely.',
    subtext: 'I have standards until I get desperate for connection. Then I settle for less.',
    scripture: 'If we confess… He is faithful to forgive.',
    scriptureRef: '1 John 1:9',
    reflection: 'God isn\'t disappointed in your humanity. He\'s proud of your desire to grow.',
    color: 'clay',
    gradient: 'from-orange-300 via-rose-300 to-pink-200',
    bgEffect: 'soft-texture',
    actions: ['Start Fresh', 'Ask Adina', 'I Feel This']
  },
  {
    id: 18,
    pillar: 'Lust',
    title: 'I use fantasy to escape reality.',
    subtext: 'When life gets stressful or boring, I retreat into fantasies that feel better than real life.',
    scripture: 'Set your mind on things above…',
    scriptureRef: 'Colossians 3:2',
    reflection: 'Next time you feel the urge to escape, pause. Ask God what your heart really needs.',
    color: 'clay',
    gradient: 'from-orange-300 via-rose-300 to-pink-200',
    bgEffect: 'soft-texture',
    actions: ['Start Fresh', 'Ask Adina', 'I Feel This']
  },
  {
    id: 19,
    pillar: 'Lust',
    title: 'I thought one mistake ruined everything.',
    subtext: 'I had this idea that purity was all-or-nothing. One slip and I\'m back to square one.',
    scripture: 'Create in me a clean heart…',
    scriptureRef: 'Psalm 51:10',
    reflection: 'Purity isn\'t about perfection—it\'s about direction. Every moment is a new chance to choose.',
    color: 'clay',
    gradient: 'from-orange-300 via-rose-300 to-pink-200',
    bgEffect: 'soft-texture',
    actions: ['Start Fresh', 'Ask Adina', 'I Feel This']
  },
  {
    id: 20,
    pillar: 'Lust',
    title: 'Temptation feels overwhelming.',
    subtext: 'Sometimes it feels like temptation is shouting while my faith is whispering.',
    scripture: 'No temptation has overtaken you…',
    scriptureRef: '1 Corinthians 10:13',
    reflection: 'The loudest voice isn\'t always the truest. Listen for the gentle whisper of love.',
    color: 'clay',
    gradient: 'from-orange-300 via-rose-300 to-pink-200',
    bgEffect: 'soft-texture',
    actions: ['Start Fresh', 'Ask Adina', 'I Feel This']
  }
];

export const bibleStories = [
  {
    id: 1,
    title: "David and Goliath",
    description: "A story of courage and faith",
    imageSrc: "https://via.placeholder.com/400x300"
  },
  {
    id: 2,
    title: "Birth of Jesus",
    description: "The nativity story",
    imageSrc: "https://via.placeholder.com/400x300"
  },
  {
    id: 3,
    title: "Moses and the Exodus",
    description: "Journey to freedom",
    imageSrc: "https://via.placeholder.com/400x300"
  }
];

export const thisCantBeJustMe = [
  {
    id: 1,
    emoji: "👻",
    title: "He ghosted me... then sent a Bible verse",
    subtitle: "When spiritual manipulation meets dating",
    hook: "Three weeks of silence. Three weeks of me checking my phone every thirty seconds, wondering if I said something wrong, if I was too much, if I wasn't enough. Then at 2:47 AM, my phone buzzes.\n\n\"Proverbs 31:10 🙏\"",
    narrative: "Not \"hey sorry I disappeared.\" Not \"I've been thinking about you.\" Just a Bible verse about virtuous women. Like some kind of spiritual consolation prize.\n\nI stared at that message for an hour. Was this his way of saying I wasn't good enough? That I needed to be more virtuous? Or was he trying to make himself feel better about treating me like I was disposable?\n\nThe worst part? I actually looked it up. \"A wife of noble character who can find? She is worth far more than rubies.\" And for a split second, I wondered if he was right. If I wasn't worth pursuing because I wasn't that woman yet.",
    revelation: "This was Hosea's story too. God told him to love someone who would leave, who would break his heart, who would make him question everything. But Hosea's love wasn't about her being \"virtuous enough.\" It was about showing what unconditional love looks like - messy, painful, and completely unearned.",
    scripture: "I will betroth you to me in faithfulness, and you will acknowledge the Lord.",
    scriptureRef: "Hosea 2:20",
    color: 'pink',
    readTime: '3 min read',
    category: 'Dating & Love'
  },
  {
    id: 2,
    emoji: "💸",
    title: "I overdrafted — and still tithed like I'm rich",
    subtitle: "When faith meets financial reality",
    hook: "Account balance: -$43. Tithe amount: $25.\n\nMy friends think I'm insane. \"God doesn't want you to be broke,\" they say. \"Be practical.\" But Sunday morning comes and I'm transferring money I don't have, praying the gas station doesn't decline my card later.",
    narrative: "It's not about the money, though. It's about the fear. The fear that if I don't give, if I don't prove I trust Him, maybe He'll stop providing. Maybe this is the test. Maybe my faith is measured in dollars I can't afford to lose.\n\nI sit in church afterward, stomach growling because I chose between groceries and giving. The pastor talks about abundant life while I calculate how to make ramen last three days.\n\nAm I faithful or just foolish? Am I trusting God or trying to manipulate Him with my sacrifice?",
    revelation: "This was the widow's story too. Two small coins - everything she had. But Jesus didn't praise her poverty; He honored her heart. She gave from her need, not her abundance, and Jesus saw it as worship, not transaction.",
    scripture: "Truly I tell you, this poor widow has put more into the treasury than all the others.",
    scriptureRef: "Mark 12:43",
    color: 'orange',
    readTime: '4 min read',
    category: 'Money & Faith'
  },
  {
    id: 3,
    emoji: "😰",
    title: "Anxiety doesn't even knock anymore. It just walks in.",
    subtitle: "When your mind becomes your enemy",
    hook: "It used to announce itself. Racing heart before big presentations. Sweaty palms before first dates. Normal stuff.\n\nNow it's just... there. In my morning coffee. In my evening shower. In the space between sleeping and waking.",
    narrative: "It's redecorated my brain without permission, rearranged all my thoughts, and somehow convinced me this is just how I live now.\n\nI pray about it. I really do. But anxiety laughs at my prayers. It knows my weak spots better than I do. It whispers about all the things that could go wrong, all the ways I'm not enough, all the reasons why today might be the day everything falls apart.\n\n\"Cast your cares on Him,\" they say. But what if your cares have roots? What if they've been growing in the dark for so long that pulling them up feels like losing a piece of yourself?",
    revelation: "This was Elijah's story too. Fresh off a mountain-top victory, he was running scared, convinced he was alone and that death was better than the fight. God didn't rebuke his fear - He fed him, let him rest, and whispered His presence in the quiet.",
    scripture: "A gentle whisper. When Elijah heard it, he pulled his cloak over his face.",
    scriptureRef: "1 Kings 19:12-13",
    color: 'purple',
    readTime: '5 min read',
    category: 'Mental Health'
  },
  {
    id: 4,
    emoji: "🔄",
    title: "I sinned. Swiped it clean. Then did it again.",
    subtitle: "The cycle of shame and starting over",
    hook: "The delete button is so convenient. Clear search history. Archive the messages. Block the number. Like it never happened.\n\nBut my heart keeps receipts my phone doesn't.",
    narrative: "Every compromise, every \"just this once,\" every time I promised myself I'd stop after this. The evidence is gone but the weight remains.\n\nI confess. I get clean. I feel forgiven. Then Tuesday happens, or loneliness happens, or temptation shows up wearing my favorite outfit, and I'm back to the same patterns with the same shame.\n\nHow many times can you start over before it stops being repentance and starts being routine? How many times can you break the same promise to God before He stops believing you mean it?",
    revelation: "This was David's story too. The man after God's own heart who kept falling into the same traps, making the same mistakes, breaking the same promises. Yet God kept calling him beloved, kept using him, kept forgiving him.",
    scripture: "Create in me a pure heart, O God, and renew a steadfast spirit within me.",
    scriptureRef: "Psalm 51:10",
    color: 'red',
    readTime: '4 min read',
    category: 'Struggle & Sin'
  },
  {
    id: 5,
    emoji: "🎭",
    title: "They loved me healed. But never held me broken.",
    subtitle: "When testimony becomes performance",
    hook: "The testimony was beautiful. Three minutes of how God brought me through. Standing ovation. Tears in the audience. \"You're so strong,\" they said. \"You're such an inspiration.\"\n\nBut when I was in the middle of it? When I was more questions than answers, more doubt than faith, more mess than message? The church felt smaller then.",
    narrative: "The texts were fewer. The invitations stopped. Everyone loves a good comeback story. But nobody wants to sit in the waiting room while it's being written. Nobody wants to hold space for the ugly middle part where you're not sure if you're going to make it.\n\nI learned to perform my healing before I felt it. To speak victory while still tasting defeat. Because broken people make others uncomfortable, but healed people make good content.",
    revelation: "This was Job's story too. His friends came to comfort him but ended up judging him. They wanted to fix his theology instead of sitting in his pain. But God honored Job's honest questions more than his friends' empty answers.",
    scripture: "My ears had heard of you but now my eyes have seen you.",
    scriptureRef: "Job 42:5",
    color: 'blue',
    readTime: '6 min read',
    category: 'Church Community'
  },
  {
    id: 6,
    emoji: "🎤",
    title: "I rehearse my prayers like it's an audition",
    subtitle: "When talking to God becomes performance",
    hook: "\"Dear God...\" Delete. \"Heavenly Father...\" Delete. \"Lord, I come before you...\" Delete.\n\nEven my prayers need editing now.",
    narrative: "I craft them like Instagram captions, worried about the tone, the theology, the impression I'm making. Do I sound grateful enough? Humble enough? Faithful enough?\n\nI used to just talk to Him. Stream of consciousness. Random thoughts. Now I'm performing, even in private. Like He's keeping score of my spiritual vocabulary, like He's impressed by proper prayer protocol.\n\nWhat if I say the wrong thing? What if I'm not reverent enough? What if my doubt shows through my devotion? What if He hears my heart instead of my words?",
    revelation: "This was the tax collector's story too. While the Pharisee performed his prayer like a soliloquy, the tax collector just beat his chest and said, \"God, have mercy on me, a sinner.\" Jesus said that simple, honest prayer was the one that reached heaven.",
    scripture: "But the tax collector stood at a distance. He would not even look up to heaven, but beat his breast and said, 'God, have mercy on me, a sinner.'",
    scriptureRef: "Luke 18:13",
    color: 'indigo',
    readTime: '3 min read',
    category: 'Prayer & Worship'
  },
  {
    id: 7,
    emoji: "📱",
    title: "I looked like peace. I felt like chaos.",
    subtitle: "The Instagram vs. reality gap",
    hook: "The Instagram post got 200 likes. \"Living my best life ✨ #blessed #grateful #peace\"\n\nBut the camera didn't catch the anxiety attack twenty minutes before.",
    narrative: "The tears I wiped away before I put on the smile. The way I practiced looking serene in the mirror until it looked natural.\n\nI've become a master of spiritual theater. I know exactly how to tilt my head during worship, how to nod during sermons, how to laugh at the right moments during small group. I look like I have it all together.\n\nMeanwhile, my inner world is a storm. Questions I can't ask out loud. Doubts I can't confess. Fears I can't name. But nobody sees the chaos when the performance is so convincing.",
    revelation: "This was the disciples' story too. Sleeping in the boat while Jesus calmed the storm they hadn't even noticed was coming. They looked peaceful from the outside, but inside they were terrified - until Jesus spoke peace over what they couldn't control.",
    scripture: "He got up, rebuked the wind and said to the waves, 'Quiet! Be still!' Then the wind died down and it was completely calm.",
    scriptureRef: "Mark 4:39",
    color: 'teal',
    readTime: '4 min read',
    category: 'Authenticity'
  },
  {
    id: 8,
    emoji: "🚪",
    title: "What if I missed it? What if this isn't a detour — it's the end?",
    subtitle: "When God's plan feels like no plan",
    hook: "I had a plan. God had a plan. Somehow they were supposed to align, but here I am at 26, living in my childhood bedroom, wondering if I took a wrong turn somewhere.",
    narrative: "Everyone else seems to be hitting their milestones. Promotions. Marriages. Babies. Houses. Purpose. I'm refreshing job boards and questioning if I heard God right when He said \"trust me with your future.\"\n\nWhat if the door I was waiting for was never going to open? What if I was supposed to make something happen instead of waiting for something to happen to me? What if I'm not delayed, I'm just... done?\n\nThe scariest question isn't \"What if I fail?\" It's \"What if this is it? What if I'm exactly where I'm supposed to be and it's just not what I thought it would look like?\"",
    revelation: "This was Joseph's story too. Thirteen years between the dream and the palace. Thirteen years of wondering if he'd heard God wrong, if the vision was just wishful thinking, if he was forgotten in the waiting. But God was preparing him for something bigger than he could imagine.",
    scripture: "You intended to harm me, but God intended it for good to accomplish what is now being done, the saving of many lives.",
    scriptureRef: "Genesis 50:20",
    color: 'green',
    readTime: '5 min read',
    category: 'Purpose & Calling'
  }
];

const homeData = {
  // ... existing data ...
};

export default homeData; 