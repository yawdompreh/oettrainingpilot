const chapters = [
  {
    id: 1,
    title: "OET Test Overview",
    estimatedMinutes: 35,
    objectives: [
      "Understand all four OET sub-tests and their timing.",
      "Know the differences between paper, computer, and OET@Home modes.",
      "Understand how scoring and assessment are reported."
    ],
    lessonPoints: [
      "Reading: 60 minutes in three parts (A, B, C).",
      "Listening: 45 minutes in three parts (A, B, C).",
      "Writing: 45 minutes, usually one profession-specific letter.",
      "Speaking: about 20 minutes, two role plays with clinical communication focus."
    ],
    studyMaterials: {
      handbookFocus: "Use the test-day structure from the OET Teacher Handbook 2024 to practice pacing across all four sub-tests.",
      tasks: [
        "Create a timing card for Reading, Listening, Writing, and Speaking, then rehearse one full timed cycle.",
        "Compare venue, computer, and home delivery requirements and write your personal test-day checklist.",
        "Review how each sub-test is scored so your practice sessions match assessment priorities."
      ],
      selfCheck: "Can you explain the full test flow and timing from memory in under two minutes?"
    },
    videoTitle: "OET Orientation: Test Format and Strategy",
    videoEmbedUrl: "https://www.youtube.com/embed?listType=search&list=OET%20test%20format%20overview",
    quiz: [
      {
        id: "c1q1",
        question: "How long is the OET Reading sub-test?",
        options: ["45 minutes", "60 minutes", "75 minutes", "90 minutes"],
        correctIndex: 1,
        explanation: "The Reading sub-test runs for 60 minutes across Parts A, B, and C."
      },
      {
        id: "c1q2",
        question: "Which sub-test usually requires writing a letter to another healthcare professional?",
        options: ["Listening", "Speaking", "Writing", "Reading"],
        correctIndex: 2,
        explanation: "The Writing sub-test is centered on a profession-relevant letter task."
      },
      {
        id: "c1q3",
        question: "How many role plays are in the Speaking sub-test?",
        options: ["One", "Two", "Three", "Four"],
        correctIndex: 1,
        explanation: "The Speaking sub-test includes two role plays to assess communication in practice."
      }
    ]
  },
  {
    id: 2,
    title: "Get OET Ready: Study Strategy",
    estimatedMinutes: 40,
    objectives: [
      "Build a realistic weekly preparation plan.",
      "Use intro courses, masterclasses, and study tips effectively.",
      "Use diagnostic checks to target weak skills."
    ],
    lessonPoints: [
      "Start with an intro course for your profession.",
      "Use OET masterclasses to understand assessor expectations.",
      "Track progress with a checklist and frequent self-testing.",
      "Use quick diagnostics to identify your weakest sub-test first."
    ],
    studyMaterials: {
      handbookFocus: "Build a structured preparation plan aligned with readiness guidance highlighted in the OET Teacher Handbook 2024.",
      tasks: [
        "Set weekly goals for each sub-test and include one checkpoint task with measurable outcomes.",
        "Use a diagnostic baseline, then rank your weakest skills from highest to lowest priority.",
        "Create a two-week revision cycle with timed practice, feedback, and correction review."
      ],
      selfCheck: "Does your plan include specific tasks, time limits, and evidence of improvement each week?"
    },
    videoTitle: "How to Build Your OET Preparation Roadmap",
    videoEmbedUrl: "https://www.youtube.com/embed?listType=search&list=OET%20study%20plan%20for%20nurses%20doctors",
    quiz: [
      {
        id: "c2q1",
        question: "What is the most effective first step before deep practice?",
        options: ["Memorize vocabulary lists only", "Take a diagnostic or intro course", "Book the test immediately", "Skip to Speaking role plays"],
        correctIndex: 1,
        explanation: "A diagnostic baseline helps you prioritize what to improve first."
      },
      {
        id: "c2q2",
        question: "Why is a checklist useful in OET prep?",
        options: ["It replaces practice tests", "It tracks completed learning tasks", "It guarantees a high score", "It removes the need for feedback"],
        correctIndex: 1,
        explanation: "A checklist is for visible progress tracking and consistency."
      },
      {
        id: "c2q3",
        question: "Masterclasses are mainly useful because they:",
        options: ["Replace all practice", "Explain test demands and marking expectations", "Provide official scores", "Only teach grammar rules"],
        correctIndex: 1,
        explanation: "Masterclasses clarify how each sub-test is assessed and how to perform better."
      }
    ]
  },
  {
    id: 3,
    title: "Reading Sub-test Mastery",
    estimatedMinutes: 55,
    objectives: [
      "Apply different reading strategies for Parts A, B, and C.",
      "Improve speed and accuracy under time pressure.",
      "Develop inference skills for Part C."
    ],
    lessonPoints: [
      "Part A rewards scanning, skimming, and fast location of details.",
      "Part B requires understanding short workplace texts quickly.",
      "Part C tests deeper comprehension and inference across long passages.",
      "Time management and question-order strategy matter in all parts."
    ],
    studyMaterials: {
      handbookFocus: "Apply handbook-aligned reading strategies by matching technique to task type in Parts A, B, and C.",
      tasks: [
        "Run a 15-minute Part A drill focused only on locating details from multiple short texts.",
        "Practice Part B with short workplace extracts and justify each answer using text evidence.",
        "For Part C, annotate author viewpoint, attitude, and inference cues before selecting answers."
      ],
      selfCheck: "Are you choosing different reading strategies for each part rather than using one method for all tasks?"
    },
    videoTitle: "Reading Skills Lab: Parts A, B, and C",
    videoEmbedUrl: "https://www.youtube.com/embed?listType=search&list=OET%20Reading%20Part%20A%20B%20C",
    quiz: [
      {
        id: "c3q1",
        question: "Which reading part focuses most on fast scanning of multiple short texts?",
        options: ["Part A", "Part B", "Part C", "All equally"],
        correctIndex: 0,
        explanation: "Part A is the expeditious reading section where speed and scanning are key."
      },
      {
        id: "c3q2",
        question: "Part C questions often require you to:",
        options: ["Copy exact phrases only", "Infer meaning and attitude", "Ignore context", "Use outside medical knowledge"],
        correctIndex: 1,
        explanation: "Part C emphasizes deeper interpretation and inference from the text."
      },
      {
        id: "c3q3",
        question: "A high-impact reading strategy is to:",
        options: ["Spend equal time on every question", "Preview task demands before reading deeply", "Read every word twice", "Answer from memory"],
        correctIndex: 1,
        explanation: "Previewing helps you read with purpose and improves time efficiency."
      }
    ]
  },
  {
    id: 4,
    title: "Listening Sub-test Mastery",
    estimatedMinutes: 50,
    objectives: [
      "Recognize key details, paraphrases, and speaker intention.",
      "Adapt note-taking across Parts A, B, and C.",
      "Reduce errors caused by distraction and pace."
    ],
    lessonPoints: [
      "Part A centers on consultation notes and precise detail capture.",
      "Part B includes short workplace extracts with focused listening demands.",
      "Part C requires tracking opinion, attitude, and extended meaning.",
      "Build daily listening habits with healthcare podcasts and lectures."
    ],
    studyMaterials: {
      handbookFocus: "Use listening routines that reflect handbook guidance on detail accuracy, meaning, and speaker intent.",
      tasks: [
        "Practice Part A note completion with strict spelling and word-form checks.",
        "For Part B, predict possible context and intent before audio starts, then verify while listening.",
        "For Part C, track each speaker's position and supporting reasoning in a quick comparison table."
      ],
      selfCheck: "Can you consistently capture both factual detail and implied attitude during one listen?"
    },
    videoTitle: "Listening Precision: Capture Meaning Under Pressure",
    videoEmbedUrl: "https://www.youtube.com/embed?listType=search&list=OET%20Listening%20Part%20A%20B%20C",
    quiz: [
      {
        id: "c4q1",
        question: "Which listening part most commonly uses consultation note completion?",
        options: ["Part A", "Part B", "Part C", "No part"],
        correctIndex: 0,
        explanation: "Part A is built around consultation-style information capture."
      },
      {
        id: "c4q2",
        question: "Part C primarily tests your ability to:",
        options: ["Spell medical terms", "Detect tone, opinion, and stance", "Memorize all details", "Guess from keywords"],
        correctIndex: 1,
        explanation: "Part C tasks commonly depend on understanding viewpoint and nuanced meaning."
      },
      {
        id: "c4q3",
        question: "A practical listening habit for OET success is:",
        options: ["Only listen to exam recordings", "Daily exposure to healthcare English audio", "Avoid accent variation", "Never review mistakes"],
        correctIndex: 1,
        explanation: "Regular listening to healthcare content builds comprehension flexibility and speed."
      }
    ]
  },
  {
    id: 5,
    title: "Writing Sub-test Mastery",
    estimatedMinutes: 60,
    objectives: [
      "Select and organize case-note information effectively.",
      "Write concise, purpose-driven letters for a target reader.",
      "Apply assessment criteria intentionally."
    ],
    lessonPoints: [
      "Writing quality depends on purpose, clarity, and relevant detail selection.",
      "Structure should guide the reader logically from referral context to request.",
      "Language should remain professional, concise, and accurate.",
      "Use criteria and sample letters to self-assess repeatedly."
    ],
    studyMaterials: {
      handbookFocus: "Prioritize purpose, content relevance, and reader needs in line with writing assessment guidance in the OET Teacher Handbook 2024.",
      tasks: [
        "Highlight case notes as essential, useful, or unnecessary before drafting your letter.",
        "Draft one referral or discharge letter in 40 minutes and reserve 5 minutes for criteria-based review.",
        "Revise one paragraph only for clarity and one for concision to improve score impact."
      ],
      selfCheck: "If the reader only scans your first paragraph, is the letter purpose immediately clear?"
    },
    videoTitle: "Writing Like a Professional: OET Letter Excellence",
    videoEmbedUrl: "https://www.youtube.com/embed?listType=search&list=OET%20Writing%20criteria%20sample%20letters",
    quiz: [
      {
        id: "c5q1",
        question: "What is the most important principle in selecting case-note details?",
        options: ["Include every detail", "Include only reader-relevant details", "Use long quotations", "Focus on advanced vocabulary only"],
        correctIndex: 1,
        explanation: "High-scoring letters select information based on purpose and reader needs."
      },
      {
        id: "c5q2",
        question: "The opening paragraph should mainly:",
        options: ["Present unrelated background", "State purpose clearly", "Repeat all case notes", "Use informal tone"],
        correctIndex: 1,
        explanation: "A clear early purpose sets direction and supports coherence."
      },
      {
        id: "c5q3",
        question: "Which action best improves writing performance?",
        options: ["Avoid assessment criteria", "Review model letters against criteria", "Write without planning", "Ignore recipient role"],
        correctIndex: 1,
        explanation: "Criteria-based review helps you identify and fix scoring weaknesses."
      }
    ]
  },
  {
    id: 6,
    title: "Speaking Sub-test Mastery",
    estimatedMinutes: 45,
    objectives: [
      "Deliver patient-centered communication in role plays.",
      "Use structure, empathy, and clarity under timed conditions.",
      "Avoid common communication breakdowns."
    ],
    lessonPoints: [
      "Speaking tasks assess both language and clinical communication behavior.",
      "Warm-up and role play context should shape tone and explanations.",
      "Use signposting, checking understanding, and empathy statements.",
      "Practice with timed scenarios and focused feedback."
    ],
    studyMaterials: {
      handbookFocus: "Strengthen role-play performance using handbook-aligned communication behaviors such as empathy, clarity, and shared understanding.",
      tasks: [
        "Record two role-play responses and evaluate them for empathy, organization, and patient-friendly explanations.",
        "Use signposting phrases at transition points to keep consultations easy to follow.",
        "Add at least two understanding checks in each scenario and note patient responses."
      ],
      selfCheck: "Do your role plays show both language control and patient-centered communication choices?"
    },
    videoTitle: "Speaking Role-play Clinic: Confidence and Clarity",
    videoEmbedUrl: "https://www.youtube.com/embed?listType=search&list=OET%20Speaking%20role%20play%20guide",
    quiz: [
      {
        id: "c6q1",
        question: "In OET Speaking, you are primarily assessed on:",
        options: ["Medical diagnosis accuracy only", "Language plus clinical communication skills", "Speed only", "Handwriting quality"],
        correctIndex: 1,
        explanation: "Speaking assessment includes language control and communication behavior."
      },
      {
        id: "c6q2",
        question: "A strong consultation behavior is to:",
        options: ["Use jargon without explanation", "Check patient understanding regularly", "Interrupt frequently", "Avoid empathy"],
        correctIndex: 1,
        explanation: "Checking understanding improves safety, rapport, and communication quality."
      },
      {
        id: "c6q3",
        question: "When the patient is anxious, a good first response is to:",
        options: ["Ignore emotion and continue", "Acknowledge concern empathetically", "End consultation quickly", "Read the role card aloud"],
        correctIndex: 1,
        explanation: "Empathy and acknowledgement are core patient-centered communication skills."
      }
    ]
  },
  {
    id: 7,
    title: "Test Booking, Final Review, and Exam Readiness",
    estimatedMinutes: 30,
    objectives: [
      "Prepare logistics, documentation, and test-day readiness.",
      "Consolidate weak areas before booking.",
      "Build a final review cycle with confidence checks."
    ],
    lessonPoints: [
      "Choose delivery mode and verify technical or venue requirements.",
      "Confirm ID, schedule, and timing expectations in advance.",
      "Use final mock tests to identify and close score gaps.",
      "Plan sleep, pacing, and exam-day routine."
    ],
    studyMaterials: {
      handbookFocus: "Use the final readiness process from the OET Teacher Handbook 2024 to reduce avoidable test-day errors.",
      tasks: [
        "Complete one full mock under realistic conditions and document every error by sub-test.",
        "Prepare your identity, timing, and transport or technical setup checklist 48 hours before test day.",
        "Run a final 7-day revision plan that prioritizes weak areas instead of repeating comfortable tasks."
      ],
      selfCheck: "Have you verified logistics, timing, and last-week priorities with written evidence?"
    },
    videoTitle: "Final Week OET Strategy and Booking Checklist",
    videoEmbedUrl: "https://www.youtube.com/embed?listType=search&list=OET%20test%20booking%20final%20tips",
    quiz: [
      {
        id: "c7q1",
        question: "Before booking the test, you should first:",
        options: ["Skip practice tests", "Review readiness and weak areas", "Only buy study materials", "Memorize templates"],
        correctIndex: 1,
        explanation: "Booking is best done when your readiness data supports your target score."
      },
      {
        id: "c7q2",
        question: "A key final-week action is to:",
        options: ["Change all strategies", "Run targeted revision with mock feedback", "Study all night", "Ignore logistics"],
        correctIndex: 1,
        explanation: "Targeted revision based on feedback is more effective than random effort."
      },
      {
        id: "c7q3",
        question: "Why verify logistics early?",
        options: ["To reduce stress and avoid preventable mistakes", "It increases test duration", "It changes marking criteria", "It removes the Speaking test"],
        correctIndex: 0,
        explanation: "Early logistics checks prevent last-minute issues and protect performance."
      }
    ]
  }
];

module.exports = { chapters };
