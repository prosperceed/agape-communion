import bcrypt from "bcryptjs";
import * as schema from "./schema";
import * as relations from "./relations";
import { env } from "@/config/env";
import type { PgliteDatabase } from "drizzle-orm/pglite";

type DatabaseInstance = PgliteDatabase<typeof schema & typeof relations>;

export async function seedDatabaseIfEmpty(db: DatabaseInstance) {
  const existingUsers = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .limit(1);

  if (existingUsers.length > 0) {
    return;
  }

  const superAdminPasswordHash = await bcrypt.hash(
    env.INITIAL_SUPER_ADMIN_PASSWORD,
    12
  );
  const editorAdminPasswordHash = await bcrypt.hash("AgapeEditor!2026", 12);

  const [superAdmin] = await db
    .insert(schema.users)
    .values({
      name: env.INITIAL_SUPER_ADMIN_NAME,
      email: env.INITIAL_SUPER_ADMIN_EMAIL.toLowerCase(),
      passwordHash: superAdminPasswordHash,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
    })
    .returning();

  const [editorAdmin] = await db
    .insert(schema.users)
    .values({
      name: "Deaconess Chidinma Okonkwo",
      email: "editor@agapecommunion.org.ng",
      passwordHash: editorAdminPasswordHash,
      role: "EDITOR_ADMIN",
      status: "ACTIVE",
      invitedById: superAdmin.id,
    })
    .returning();

  const coreBeliefs = [
    {
      title: "The Authority of Scripture",
      description:
        "We believe the Holy Bible is the inspired, infallible, and authoritative Word of God for faith, doctrine, and daily Christian living.",
      scripture: "2 Timothy 3:16-17",
    },
    {
      title: "The Triune God",
      description:
        "We worship one eternal God existing in three persons: the Father, the Son Jesus Christ, and the Holy Spirit.",
      scripture: "Matthew 28:19",
    },
    {
      title: "Salvation by Grace Through Faith",
      description:
        "Redemption and forgiveness of sins come solely through repentance and faith in the finished work of Jesus Christ on the cross.",
      scripture: "Ephesians 2:8-9",
    },
    {
      title: "The Fellowship of the Church",
      description:
        "We are called into a loving covenant body of believers committed to communion, mutual edification, prayer, and service.",
      scripture: "Acts 2:42-47",
    },
  ];

  const leadershipTeam = [
    {
      name: "Pastor Emmanuel Adeyemi",
      role: "Senior Pastor",
      bio: "Pastor Emmanuel has served in pastoral ministry for over eighteen years, teaching the Scriptures with clarity and shepherding families across Lagos.",
      imageUrl: "/assets/leadership/pastor-emmanuel-adeyemi.jpg",
    },
    {
      name: "Pastor Samuel Okafor",
      role: "Associate Pastor, Teaching & Discipleship",
      bio: "Pastor Samuel oversees small groups, biblical foundations classes, and leadership development for emerging ministers.",
      imageUrl: "/assets/leadership/pastor-samuel-okafor.jpg",
    },
    {
      name: "Minister Grace Nwosu",
      role: "Director of Community Care & Family Life",
      bio: "Minister Grace coordinates benevolence outreach, counseling care, and family discipleship initiatives across our local communities.",
      imageUrl: "/assets/leadership/minister-grace-nwosu.jpg",
    },
  ];

  await db.insert(schema.settings).values({
    churchName: "Agape Communion Church",
    tagline: "Church Love, Faith Love",
    logoUrl: "/assets/branding/logo.svg",
    address: "Plot 24 Admiralty Way, Lekki Phase 1, Lagos, Nigeria",
    phone: "+234 803 456 7890",
    email: "hello@agapecommunion.org.ng",
    vision:
      "To raise a Christ-centered community across Nigeria and beyond who walk in the fullness of God's love, sound biblical truth, and redemptive purpose.",
    mission:
      "We gather in reverent worship, equip believers through faithful teaching of the Word, nurture genuine Christian fellowship, and serve our local neighborhoods with practical compassion.",
    aboutIntro:
      "Agape Communion Church is a welcoming congregation in Lagos where people from every walk of life gather to encounter Jesus Christ, grow in biblical truth, and build lasting relationships.",
    aboutBackground:
      "Founded in Lagos as a home prayer and Bible study fellowship, Agape Communion Church has grown into a vibrant generational church family. Our ministry remains anchored in expositional preaching, fervent intercession, the Lord's Table, and compassionate service to our neighbors.",
    coreBeliefsJson: JSON.stringify(coreBeliefs),
    leadershipJson: JSON.stringify(leadershipTeam),
    serviceSummary:
      "Join us every Sunday at 9:00 AM and 11:00 AM WAT, and Wednesdays at 6:00 PM for Midweek Bible Study.",
    mapLink:
      "https://maps.google.com/?q=Admiralty+Way+Lekki+Phase+1+Lagos+Nigeria",
    youtubeUrl: "https://www.youtube.com/@agapecommunionchurch",
    facebookUrl: "https://www.facebook.com/agapecommunionchurch",
    instagramUrl: "https://www.instagram.com/agapecommunionchurch",
    livestreamDefaultSchedule: "Every Sunday at 9:00 am & 11:00 am",
    updatedById: superAdmin.id,
  });

  const [catChristianLiving, catPrayer, catHopeSeries] = await db
    .insert(schema.categories)
    .values([
      {
        name: "Christian Living",
        slug: "christian-living",
        scope: "BLOG",
        description: "Practical biblical wisdom for everyday faithfulness.",
      },
      {
        name: "Prayer & Devotion",
        slug: "prayer-and-devotion",
        scope: "BLOG",
        description: "Encouragement for cultivating a consistent prayer life.",
      },
      {
        name: "Hope for Tomorrow",
        slug: "hope-for-tomorrow",
        scope: "MESSAGE",
        description: "Sermon series on steadfast hope in Christ.",
      },
    ])
    .returning();

  const [tagFaith, tagScripture, tagCommunity, tagPrayer] = await db
    .insert(schema.tags)
    .values([
      { name: "Faith", slug: "faith" },
      { name: "Scripture", slug: "scripture" },
      { name: "Community", slug: "community" },
      { name: "Prayer", slug: "prayer" },
    ])
    .returning();

  const insertedServices = await db
    .insert(schema.services)
    .values([
      {
        title: "Weekly Services",
        slug: "weekly-sunday-communion-services",
        description:
          "Gather with the church family for congregational worship, expositional preaching, and the Lord's Supper.",
        location: "Main Sanctuary, Plot 24 Admiralty Way, Lekki Phase 1",
        imageUrl: "/assets/services/sunday-communion-service.jpg",
        isRecurring: true,
        status: "PUBLISHED",
        displayOrder: 1,
        authorId: superAdmin.id,
        publishedAt: new Date("2026-09-01T08:00:00Z"),
      },
      {
        title: "Youth",
        slug: "youth-and-young-adults-fellowship",
        description:
          "Discipleship, mentorship, and vibrant fellowship equipping students and young professionals to live boldly for Christ.",
        location: "Youth Hall, Second Floor",
        imageUrl: "/assets/services/youth-fellowship.jpg",
        isRecurring: true,
        status: "PUBLISHED",
        displayOrder: 2,
        authorId: superAdmin.id,
        publishedAt: new Date("2026-09-01T08:00:00Z"),
      },
      {
        title: "Kids",
        slug: "agape-kids-bible-ministry",
        description:
          "Safe, age-appropriate Bible teaching and worship designed to help children know and love God's Word early.",
        location: "Children's Wing, Ground Floor",
        imageUrl: "/assets/services/midweek-bible-study.jpg",
        isRecurring: true,
        status: "PUBLISHED",
        displayOrder: 3,
        authorId: superAdmin.id,
        publishedAt: new Date("2026-09-01T08:00:00Z"),
      },
      {
        title: "Special Events",
        slug: "midweek-bible-study-and-teaching",
        description:
          "Verse-by-verse study of Scripture and interactive questions that deepen doctrinal understanding.",
        location: "Main Sanctuary & Online Livestream",
        imageUrl: "/assets/services/midweek-bible-study.jpg",
        isRecurring: true,
        status: "PUBLISHED",
        displayOrder: 4,
        authorId: superAdmin.id,
        publishedAt: new Date("2026-09-01T08:00:00Z"),
      },
      {
        title: "Counseling",
        slug: "biblical-counseling-and-pastoral-care",
        description:
          "Confidential pastoral guidance, premarital preparation, and prayer support rooted in the wisdom of Scripture.",
        location: "Pastoral Care Office",
        imageUrl: "/assets/services/friday-prayer-vigil.jpg",
        isRecurring: true,
        status: "PUBLISHED",
        displayOrder: 5,
        authorId: superAdmin.id,
        publishedAt: new Date("2026-09-01T08:00:00Z"),
      },
      {
        title: "Benevolence",
        slug: "community-benevolence-and-outreach",
        description:
          "Serving families across Lagos through food distribution, medical outreach, and practical neighborhood support.",
        location: "Community Outreach Center",
        imageUrl: "/assets/church/community-fellowship.jpg",
        isRecurring: true,
        status: "PUBLISHED",
        displayOrder: 6,
        authorId: superAdmin.id,
        publishedAt: new Date("2026-09-01T08:00:00Z"),
      },
      {
        title: "Monthly Covenant Communion & Anointing Service",
        slug: "monthly-covenant-communion-service",
        description:
          "A dedicated first-Sunday gathering of thanksgiving, family blessing, and communion as we begin the new month.",
        location: "Main Sanctuary, Lekki Phase 1",
        imageUrl: "/assets/services/sunday-communion-service.jpg",
        isRecurring: false,
        eventDate: new Date("2026-12-06T08:00:00Z"),
        status: "PUBLISHED",
        displayOrder: 7,
        authorId: superAdmin.id,
        publishedAt: new Date("2026-10-01T08:00:00Z"),
      },
    ])
    .returning();

  await db.insert(schema.serviceSchedules).values([
    {
      serviceId: insertedServices[0].id,
      dayOfWeek: "SUNDAY",
      startTime: "09:00 AM",
      endTime: "10:45 AM",
      frequency: "WEEKLY",
      notes: "First Service",
    },
    {
      serviceId: insertedServices[0].id,
      dayOfWeek: "SUNDAY",
      startTime: "11:00 AM",
      endTime: "12:45 PM",
      frequency: "WEEKLY",
      notes: "Second Service",
    },
    {
      serviceId: insertedServices[1].id,
      dayOfWeek: "SATURDAY",
      startTime: "04:00 PM",
      endTime: "06:00 PM",
      frequency: "WEEKLY",
      notes: "Youth & Young Adults",
    },
    {
      serviceId: insertedServices[2].id,
      dayOfWeek: "SUNDAY",
      startTime: "09:00 AM",
      endTime: "12:30 PM",
      frequency: "WEEKLY",
      notes: "Ages 4 to 14",
    },
    {
      serviceId: insertedServices[3].id,
      dayOfWeek: "WEDNESDAY",
      startTime: "06:00 PM",
      endTime: "07:30 PM",
      frequency: "WEEKLY",
      notes: "Midweek Word Study",
    },
    {
      serviceId: insertedServices[4].id,
      dayOfWeek: "THURSDAY",
      startTime: "10:00 AM",
      endTime: "03:00 PM",
      frequency: "WEEKLY",
      notes: "By Appointment",
    },
    {
      serviceId: insertedServices[5].id,
      dayOfWeek: "SATURDAY",
      startTime: "09:00 AM",
      endTime: "12:00 PM",
      frequency: "BIWEEKLY",
      notes: "Community Food & Care Pantry",
    },
  ]);

  await db.insert(schema.events).values([
    {
      title: "Lagos Night of Worship & Communion",
      slug: "lagos-night-of-worship-and-communion",
      excerpt:
        "An evening of extended congregational worship, corporate intercession, and communion with believers across Lagos.",
      description:
        "<p>Join the Agape Communion Church family for our quarterly Night of Worship and Communion. Together we will lift up the name of Jesus in psalms, hymns, and spiritual songs, intercede for our nation Nigeria, and share in the Lord's Table.</p><p>Doors open at 5:00 PM WAT. Free shuttle buses are available from Lekki Phase 1 Gate and Victoria Island.</p>",
      coverImage: "/assets/events/night-of-worship.jpg",
      startDate: new Date("2026-11-27T18:00:00Z"),
      endDate: new Date("2026-11-27T21:30:00Z"),
      venue: "Main Sanctuary, Plot 24 Admiralty Way, Lekki Phase 1, Lagos",
      registrationUrl: "https://agapecommunion.org.ng/contact",
      isFeatured: true,
      status: "PUBLISHED",
      authorId: superAdmin.id,
      publishedAt: new Date("2026-10-15T10:00:00Z"),
    },
    {
      title: "Youth & Campus Faith Summit 2026",
      slug: "youth-and-campus-faith-summit-2026",
      excerpt:
        "Equipping students and young professionals to stand firm in biblical truth and lead with integrity in their callings.",
      description:
        "<p>The Youth and Campus Faith Summit brings together young believers from across Lagos State for two days of intensive Bible teaching, career and purpose workshops, and uplifting worship.</p>",
      coverImage: "/assets/events/youth-fire-conference.jpg",
      startDate: new Date("2026-12-12T09:00:00Z"),
      endDate: new Date("2026-12-13T16:00:00Z"),
      venue: "Agape Youth Auditorium, Lekki Phase 1, Lagos",
      registrationUrl: "https://agapecommunion.org.ng/contact",
      isFeatured: true,
      status: "PUBLISHED",
      authorId: editorAdmin.id,
      publishedAt: new Date("2026-10-20T10:00:00Z"),
    },
    {
      title: "Lekki Community Love & Medical Outreach",
      slug: "lekki-community-love-and-medical-outreach",
      excerpt:
        "Serving our neighbors with free health screenings, essential food packs, and personal prayer support.",
      description:
        "<p>Our medical professionals and hospitality volunteers are partnering to provide blood pressure checks, eye screenings, essential supplies, and gospel encouragement to families in our community.</p>",
      coverImage: "/assets/events/community-love-outreach.jpg",
      startDate: new Date("2026-12-19T08:30:00Z"),
      endDate: new Date("2026-12-19T14:00:00Z"),
      venue: "Community Ground, Marwa Axis, Lekki, Lagos",
      isFeatured: false,
      status: "PUBLISHED",
      authorId: editorAdmin.id,
      publishedAt: new Date("2026-10-25T10:00:00Z"),
    },
    {
      title: "Annual Church Family Prayer Retreat",
      slug: "annual-church-family-prayer-retreat",
      excerpt:
        "A three-day season of fasting, Scripture meditation, and spiritual renewal.",
      description:
        "<p>Thank you to everyone who joined our autumn prayer retreat as we sought the Lord together for spiritual renewal.</p>",
      coverImage: "/assets/church/sanctuary-intercession.jpg",
      startDate: new Date("2026-09-18T17:00:00Z"),
      endDate: new Date("2026-09-20T13:00:00Z"),
      venue: "Main Sanctuary, Lekki Phase 1, Lagos",
      isFeatured: false,
      status: "PUBLISHED",
      authorId: superAdmin.id,
      publishedAt: new Date("2026-08-20T10:00:00Z"),
    },
    {
      title: "2027 Leadership Planning Workshop (Internal Draft)",
      slug: "2027-leadership-planning-workshop-draft",
      excerpt: "Draft schedule for department leaders and deacons.",
      description: "<p>Internal draft event for department heads.</p>",
      coverImage: "/assets/church/community-fellowship.jpg",
      startDate: new Date("2027-01-16T09:00:00Z"),
      venue: "Conference Room B",
      isFeatured: false,
      status: "DRAFT",
      authorId: superAdmin.id,
    },
  ]);

  await db.insert(schema.messages).values([
    {
      title: "Renewing your Mind",
      slug: "renewing-your-mind",
      speaker: "Pastor Emmanuel Adeyemi",
      seriesName: "Hope for Tomorrow",
      description:
        "How daily immersion in the living Word of God transforms our thinking, anchors our peace, and aligns our desires with God's good and perfect will.",
      scriptureReferences: "Romans 12:1-2, Philippians 4:8",
      datePreached: new Date("2026-11-01T09:00:00Z"),
      thumbnailUrl: "/assets/messages/renewing-your-mind.jpg",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      audioUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      categoryId: catHopeSeries.id,
      status: "PUBLISHED",
      authorId: superAdmin.id,
      publishedAt: new Date("2026-11-01T14:00:00Z"),
    },
    {
      title: "Having Faith when life is Hard",
      slug: "having-faith-when-life-is-hard",
      speaker: "Pastor Emmanuel Adeyemi",
      seriesName: "Hope for Tomorrow",
      description:
        "Discover how trials refine our trust in Christ and why God's sustaining grace is sufficient in every season of testing.",
      scriptureReferences: "James 1:2-8, 2 Corinthians 12:9",
      datePreached: new Date("2026-10-25T09:00:00Z"),
      thumbnailUrl: "/assets/messages/having-faith-when-life-is-hard.jpg",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      audioUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      categoryId: catHopeSeries.id,
      status: "PUBLISHED",
      authorId: superAdmin.id,
      publishedAt: new Date("2026-10-25T14:00:00Z"),
    },
    {
      title: "The Hope of His Calling",
      slug: "the-hope-of-his-calling",
      speaker: "Pastor Samuel Okafor",
      seriesName: "Hope for Tomorrow",
      description:
        "Paul's prayer in Ephesians invites every believer to see the glorious inheritance and resurrection power available to those who belong to Christ.",
      scriptureReferences: "Ephesians 1:17-23",
      datePreached: new Date("2026-10-18T09:00:00Z"),
      thumbnailUrl: "/assets/messages/the-hope-of-his-calling.jpg",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      audioUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      categoryId: catHopeSeries.id,
      status: "PUBLISHED",
      authorId: editorAdmin.id,
      publishedAt: new Date("2026-10-18T14:00:00Z"),
    },
    {
      title: "God Our Refuge and Strength",
      slug: "god-our-refuge-and-strength",
      speaker: "Pastor Emmanuel Adeyemi",
      seriesName: "Psalms of Assurance",
      description:
        "Learning to pour out our hearts before the Lord and rest securely in His unshakeable character.",
      scriptureReferences: "Psalm 62:1-8",
      datePreached: new Date("2026-10-11T09:00:00Z"),
      thumbnailUrl: "/assets/messages/god-our-refuge-and-strength.jpg",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      categoryId: catHopeSeries.id,
      status: "PUBLISHED",
      authorId: superAdmin.id,
      publishedAt: new Date("2026-10-11T14:00:00Z"),
    },
  ]);

  const insertedPosts = await db
    .insert(schema.posts)
    .values([
      {
        title: "Abiding in the Living Word Through Busy Seasons",
        slug: "abiding-in-the-living-word-through-busy-seasons",
        excerpt:
          "Practical ways for families and professionals in Lagos to keep Scripture at the center of daily life.",
        content:
          "<p>Life in a fast-paced city can easily crowd out quiet communion with God. Yet Jesus reminds us in John 15 that fruitfulness flows from abiding in Him and letting His words abide in us.</p><h3>Start the Morning With Open Scripture</h3><p>Before checking messages or traffic updates, spend fifteen focused minutes reading a passage of Scripture and turning its promises into prayer.</p><h3>Share the Word Around the Table</h3><p>Brief family readings in the evening build a shared language of faith and anchor children in timeless biblical truth.</p>",
        coverImage: "/assets/blog/abiding-in-the-living-word.jpg",
        categoryId: catChristianLiving.id,
        authorId: superAdmin.id,
        authorName: "Pastor Emmanuel Adeyemi",
        status: "PUBLISHED",
        seoTitle: "Abiding in the Living Word | Agape Communion Church",
        seoDescription:
          "Practical habits for keeping Scripture at the center of everyday life.",
        publishedAt: new Date("2026-11-03T09:00:00Z"),
      },
      {
        title: "The Strength of Christian Fellowship and Mutual Care",
        slug: "the-strength-of-christian-fellowship-and-mutual-care",
        excerpt:
          "Why God designed believers to grow together in local church community rather than walking in isolation.",
        content:
          "<p>From the earliest days of the Church in Acts 2, believers devoted themselves to the apostles' teaching and to fellowship, breaking bread and praying together.</p><p>When we commit to a local congregation, we discover brothers and sisters who rejoice with us in victories and carry our burdens during seasons of difficulty.</p>",
        coverImage: "/assets/blog/the-power-of-christian-communion.jpg",
        categoryId: catChristianLiving.id,
        authorId: editorAdmin.id,
        authorName: "Pastor Samuel Okafor",
        status: "PUBLISHED",
        seoTitle: "The Strength of Christian Fellowship | Agape Communion Church",
        seoDescription:
          "Why God designed believers to grow together in local church community.",
        publishedAt: new Date("2026-10-27T09:00:00Z"),
      },
      {
        title: "Cultivating a Steadfast Life of Secret Prayer",
        slug: "cultivating-a-steadfast-life-of-secret-prayer",
        excerpt:
          "Learning from the Psalms how honest, unhurried prayer deepens our trust in the Father.",
        content:
          "<p>Public worship is strengthened by private devotion. When we kneel before the Father in secret, we trade anxiety for the peace of Christ that surpasses understanding.</p>",
        coverImage: "/assets/blog/cultivating-a-life-of-secret-prayer.jpg",
        categoryId: catPrayer.id,
        authorId: superAdmin.id,
        authorName: "Pastor Emmanuel Adeyemi",
        status: "PUBLISHED",
        seoTitle: "Cultivating a Steadfast Life of Secret Prayer | Agape Communion",
        seoDescription:
          "How honest, unhurried prayer deepens our trust in the Father.",
        publishedAt: new Date("2026-10-19T09:00:00Z"),
      },
      {
        title: "Upcoming Advent Reading Guide (Draft)",
        slug: "upcoming-advent-reading-guide-draft",
        excerpt: "Draft guide for December congregation readings.",
        content: "<p>This article is currently in draft status for December.</p>",
        coverImage: "/assets/blog/finding-peace-in-the-psalms.jpg",
        categoryId: catPrayer.id,
        authorId: editorAdmin.id,
        authorName: "Deaconess Chidinma Okonkwo",
        status: "DRAFT",
      },
    ])
    .returning();

  await db.insert(schema.postTags).values([
    { postId: insertedPosts[0].id, tagId: tagScripture.id },
    { postId: insertedPosts[0].id, tagId: tagFaith.id },
    { postId: insertedPosts[1].id, tagId: tagCommunity.id },
    { postId: insertedPosts[2].id, tagId: tagPrayer.id },
  ]);

  await db.insert(schema.devotionals).values([
    {
      title: "Waiting Quietly Upon God Alone",
      slug: "waiting-quietly-upon-god-alone",
      scriptureReference: "Psalm 62:5-8",
      biblePassage:
        "My soul, wait silently for God alone, for my expectation is from Him. He only is my rock and my salvation; He is my defense; I shall not be moved.",
      content:
        "<p>David wrote Psalm 62 when surrounded by pressure, yet he commanded his own soul to rest in God alone. Our expectation does not rest on shifting circumstances, human connections, or uncertain economies, but on the unchanging character of our Rock and Redeemer.</p><p>Take time today to quiet competing voices and pour out your heart honestly before the Lord. He is a refuge for us in every season.</p>",
      reflectionPrompt:
        "Father, I quiet my heart before You today. Help me place my full expectation in Your faithfulness and rest securely in Your unfailing love. Amen.",
      coverImage: "/assets/blog/finding-peace-in-the-psalms.jpg",
      authorName: "Pastor Emmanuel Adeyemi",
      status: "PUBLISHED",
      authorId: superAdmin.id,
      publishedAt: new Date("2026-11-07T06:00:00Z"),
    },
    {
      title: "Strength for the Weary Traveler",
      slug: "strength-for-the-weary-traveler",
      scriptureReference: "Isaiah 40:28-31",
      biblePassage:
        "He gives power to the weak, and to those who have no might He increases strength. But those who wait on the Lord shall renew their strength.",
      content:
        "<p>God never grows faint or weary, and His understanding is unsearchable. When we acknowledge our human limitations and wait upon Him in prayer, He exchanges our exhaustion for His enduring strength.</p>",
      reflectionPrompt:
        "Lord Jesus, thank You that Your grace is sufficient for every responsibility before me today. Renew my strength as I trust in You. Amen.",
      coverImage: "/assets/blog/abiding-in-the-living-word.jpg",
      authorName: "Pastor Samuel Okafor",
      status: "PUBLISHED",
      authorId: editorAdmin.id,
      publishedAt: new Date("2026-11-06T06:00:00Z"),
    },
    {
      title: "Rooted and Grounded in Christ's Love",
      slug: "rooted-and-grounded-in-christs-love",
      scriptureReference: "Ephesians 3:16-19",
      biblePassage:
        "That Christ may dwell in your hearts through faith; that you, being rooted and grounded in love, may be able to comprehend with all the saints what is the width and length and depth and height.",
      content:
        "<p>Spiritual maturity is measured by how deeply we are rooted in the love of Christ. When we know how dearly Christ loves us, we can extend patience, forgiveness, and generosity to others.</p>",
      reflectionPrompt:
        "Gracious Father, root my heart deeply in the love of Christ so that my home and work reflect Your kindness today. Amen.",
      coverImage: "/assets/blog/cultivating-a-life-of-secret-prayer.jpg",
      authorName: "Minister Grace Nwosu",
      status: "PUBLISHED",
      authorId: superAdmin.id,
      publishedAt: new Date("2026-11-05T06:00:00Z"),
    },
  ]);

  await db.insert(schema.testimonies).values([
    {
      title: "God Restored My Health and Strengthened Our Family",
      slug: "god-restored-my-health-and-strengthened-our-family",
      personName: "Deacon Chinedu Obi",
      displayPersonName: true,
      hasMediaPermission: true,
      hasStoryPermission: true,
      roleOrRelation: "Church Member since 2021",
      excerpt:
        "After months of medical uncertainty, the prayer support of the church and God's healing hand brought complete recovery.",
      fullTestimony:
        "Early this year I faced a sudden health crisis that left our family anxious and exhausted. The pastors and brethren at Agape Communion stood with us in prayer and practical care every single week. Today my medical reports are completely clear, and our household is stronger in faith than ever before.",
      imageUrl: "/assets/testimonies/deacon-chinedu-obi.jpg",
      isFeatured: true,
      status: "PUBLISHED",
      approvedById: superAdmin.id,
      publishedAt: new Date("2026-10-28T10:00:00Z"),
    },
    {
      title: "Finding Purpose and Godly Mentorship in Lagos",
      slug: "finding-purpose-and-godly-mentorship-in-lagos",
      personName: "Brother Tunde Bakare",
      displayPersonName: true,
      hasMediaPermission: true,
      hasStoryPermission: true,
      roleOrRelation: "Youth & Young Adults Fellowship",
      excerpt:
        "Moving to Lagos as a young graduate felt overwhelming until I found a spiritual home and biblical mentorship at Agape Communion.",
      fullTestimony:
        "When I relocated to Lagos for my career, I prayed for a church where God's Word is taught faithfully and where people genuinely care for one another. Through the midweek Bible studies and young adults fellowship, I grew in prayer, found godly mentors, and secured a role where I can honor Christ.",
      imageUrl: "/assets/testimonies/brother-tunde-bakare.jpg",
      isFeatured: true,
      status: "PUBLISHED",
      approvedById: superAdmin.id,
      publishedAt: new Date("2026-10-20T10:00:00Z"),
    },
    {
      title: "Peace and Provision in a Season of Transition",
      slug: "peace-and-provision-in-a-season-of-transition",
      personName: "Sister Blessing Eze",
      displayPersonName: true,
      hasMediaPermission: true,
      hasStoryPermission: true,
      roleOrRelation: "Hospitality Ministry",
      excerpt:
        "The Hope for Tomorrow sermon series anchored my heart when our family business went through a difficult transition.",
      fullTestimony:
        "Walking through financial uncertainty tested my faith deeply, but the weekly teaching of Scripture and fellowship at Agape Communion kept my eyes on Jesus. God opened unexpected doors for our business and filled our home with peace.",
      imageUrl: "/assets/testimonies/sister-blessing-eze.jpg",
      isFeatured: true,
      status: "PUBLISHED",
      approvedById: editorAdmin.id,
      publishedAt: new Date("2026-10-12T10:00:00Z"),
    },
    {
      title: "Grateful for Answered Prayer Over My Studies",
      slug: "grateful-for-answered-prayer-over-my-studies",
      personName: "Sister Amaka Nwachukwu",
      displayPersonName: false,
      hasMediaPermission: true,
      hasStoryPermission: true,
      roleOrRelation: "Campus Fellowship",
      excerpt:
        "God granted me favor and clarity during my final professional examinations.",
      fullTestimony:
        "I submitted a prayer request during the Wednesday Bible study before my professional exams, and the Lord granted me peace and distinction.",
      imageUrl: "/assets/testimonies/family-restoration.jpg",
      isFeatured: false,
      status: "PENDING",
    },
  ]);

  await db.insert(schema.livestreams).values([
    {
      title: "Sunday Morning Worship & Communion Service",
      slug: "sunday-morning-worship-and-communion-live",
      description:
        "Join Agape Communion Church live from Lekki, Lagos for congregational worship, prayer, and the preaching of God's Word.",
      platform: "YOUTUBE",
      streamUrl: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
      embedUrl: "https://www.youtube.com/embed/jfKfPfyJRdk",
      thumbnailUrl: "/assets/hero/sunday-livestream-banner.jpg",
      status: "LIVE",
      scheduledFor: new Date("2026-11-08T08:00:00Z"),
      startedAt: new Date("2026-11-08T08:00:00Z"),
      updatedById: superAdmin.id,
    },
    {
      title: "Midweek Word & Doctrine Study: Book of Ephesians",
      slug: "midweek-word-study-ephesians",
      description:
        "Midweek verse-by-verse Bible study exploring our spiritual blessings in Christ.",
      platform: "YOUTUBE",
      streamUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      thumbnailUrl: "/assets/services/midweek-bible-study.jpg",
      status: "SCHEDULED",
      scheduledFor: new Date("2026-11-11T17:00:00Z"),
      updatedById: editorAdmin.id,
    },
    {
      title: "First Sunday Thanksgiving & Communion Service",
      slug: "first-sunday-thanksgiving-and-communion-service",
      description:
        "Recorded broadcast of our November Thanksgiving and Communion service.",
      platform: "YOUTUBE",
      streamUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      thumbnailUrl: "/assets/services/sunday-communion-service.jpg",
      status: "ENDED",
      scheduledFor: new Date("2026-11-01T08:00:00Z"),
      startedAt: new Date("2026-11-01T08:00:00Z"),
      endedAt: new Date("2026-11-01T11:00:00Z"),
      updatedById: superAdmin.id,
    },
  ]);

  await db.insert(schema.media).values([
    {
      filename: "worship-sanctuary.jpg",
      originalName: "agape1.jpg",
      objectKey: "assets/hero/worship-sanctuary.jpg",
      url: "/assets/hero/worship-sanctuary.jpg",
      mimeType: "image/jpeg",
      sizeBytes: 245000,
      width: 1920,
      height: 1280,
      altText: "Congregation worshipping with hands raised in sanctuary",
      folder: "hero",
      uploadedById: superAdmin.id,
    },
    {
      filename: "sunday-livestream-banner.jpg",
      originalName: "agape2.jpg",
      objectKey: "assets/hero/sunday-livestream-banner.jpg",
      url: "/assets/hero/sunday-livestream-banner.jpg",
      mimeType: "image/jpeg",
      sizeBytes: 198000,
      width: 1920,
      height: 1280,
      altText: "Warm worship stage during Sunday service",
      folder: "hero",
      uploadedById: superAdmin.id,
    },
    {
      filename: "renewing-your-mind.jpg",
      originalName: "agape4.jpg",
      objectKey: "assets/messages/renewing-your-mind.jpg",
      url: "/assets/messages/renewing-your-mind.jpg",
      mimeType: "image/jpeg",
      sizeBytes: 215000,
      width: 1600,
      height: 1067,
      altText: "Believer taking notes with open Bible during sermon",
      folder: "messages",
      uploadedById: editorAdmin.id,
    },
    {
      filename: "abiding-in-the-living-word.jpg",
      originalName: "agape10.jpg",
      objectKey: "assets/blog/abiding-in-the-living-word.jpg",
      url: "/assets/blog/abiding-in-the-living-word.jpg",
      mimeType: "image/jpeg",
      sizeBytes: 230000,
      width: 1600,
      height: 1067,
      altText: "Open Bible turned to the prophet Jeremiah",
      folder: "blog",
      uploadedById: editorAdmin.id,
    },
  ]);

  await db.insert(schema.adminActivityLogs).values([
    {
      actorId: superAdmin.id,
      actorName: superAdmin.name,
      actorRole: "SUPER_ADMIN",
      action: "PROVISION_SUPER_ADMIN",
      entityType: "USER",
      entityId: superAdmin.id,
      summary: "Provisioned initial Super Admin account and church settings.",
    },
    {
      actorId: superAdmin.id,
      actorName: superAdmin.name,
      actorRole: "SUPER_ADMIN",
      action: "INVITE_EDITOR_ADMIN",
      entityType: "USER",
      entityId: editorAdmin.id,
      summary: "Provisioned Editor Admin account for Deaconess Chidinma Okonkwo.",
    },
  ]);
}
