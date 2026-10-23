import { WorldKnowledgeItem, KnowledgeCategory } from '@/types';

export const WORLD_KNOWLEDGE_BASE: WorldKnowledgeItem[] = [
  // =========================================================================
  // 1. WORLD NEWS & GLOBAL AFFAIRS
  // =========================================================================
  {
    id: 'news-global-1',
    title: 'Global Energy Transition: Net-Positive Fusion Milestone Verified',
    category: 'news',
    subcategory: 'Clean Energy & Physics',
    summary: 'International consortium validates sustained Q>1.4 net energy output in magnetic confinement tokamak, paving the way for commercial grid integration prototypes.',
    content: `An international scientific partnership across Europe, Asia, and North America has officially confirmed repeat net-energy gain (Q factor > 1.4) during extended plasma confinement cycles exceeding 18 minutes.

By employing advanced high-temperature superconducting (HTS) magnets with rare-earth barium copper oxide (REBCO) tapes, magnetic field strengths surpassed 21 Tesla, preventing turbulent edge-localized modes (ELMs) that previously degraded plasma stability. Commercial utility integration testbeds are slated for pilot deployment by 2031.`,
    tags: ['Fusion Energy', 'Clean Tech', 'Physics', 'Climate Solutions'],
    source: 'International Energy Agency & Nature Physics',
    sourceUrl: 'https://nature.com',
    date: 'Oct 9, 2026',
    readTime: '3 min read',
    impact: 'Global',
    featured: true,
    keyTakeaways: [
      'Net energy factor Q > 1.4 maintained for over 18 continuous minutes.',
      'REBCO high-temperature superconducting magnets reached stable 21 Tesla confinement.',
      'Decarbonization pathway offers baseload zero-carbon power without long-lived radioactive waste.',
    ],
    actionTips: [
      'Monitor national power grid modernization roadmaps.',
      'Track commercial utility micro-reactor demonstrations.',
    ],
  },
  {
    id: 'news-global-2',
    title: 'Geneva Global AI Safety & Autonomous Systems Accord Signed by 64 Nations',
    category: 'news',
    subcategory: 'Artificial Intelligence & Policy',
    summary: '64 countries ratify universal standards for safety evals, watermark cryptography, and autonomous weapon restraint frameworks.',
    content: `Delegates in Geneva formalized a landmark multilateral treaty establishing synchronized transparency benchmarks for frontier multimodal models, agentic autonomous actuators, and biometric generative engines.

The treaty institutes standardized red-teaming criteria, cryptographic watermarking for synthetic audio-visual streams, and stringent fail-safe kill switches for physical robotic systems in industrial and clinical settings.`,
    tags: ['AI Safety', 'Global Governance', 'Tech Policy', 'Cybersecurity'],
    source: 'United Nations Tech Directorate & Reuters',
    sourceUrl: 'https://reuters.com',
    date: 'Oct 8, 2026',
    readTime: '4 min read',
    impact: 'Global',
    featured: true,
    keyTakeaways: [
      'Harmonized red-teaming and safety verification across 64 participating nations.',
      'Compulsory cryptographic provenance protocols for high-fidelity generative media.',
      'Mandatory hardware containment safeguards for industrial autonomous robotics.',
    ],
    actionTips: [
      'Verify C2PA cryptographic metadata credentials on ingested media.',
      'Implement isolated sandbox container constraints for autonomous agent workflows.',
    ],
  },
  {
    id: 'news-global-3',
    title: 'Artemis Lunar Gateway Habitation Module Successfully Reaches Polar Orbit',
    category: 'news',
    subcategory: 'Space Exploration',
    summary: 'Joint NASA-ESA-JAXA deep space outpost commences deep space science operations in a Near-Rectilinear Halo Orbit (NRHO).',
    content: `The pressurized international habitation module has successfully completed its trans-lunar injection and stabilized in its operational orbit around the Moon. 

The outpost serves as a staging hub for lunar south-pole scientific expeditions, deep-space radiation biology experiments, and deep space optical laser communication relays back to Earth at 1.2 Gbps.`,
    tags: ['Space', 'NASA', 'Artemis', 'Astrophysics', 'Astronomy'],
    source: 'NASA Jet Propulsion Laboratory & ESA News',
    sourceUrl: 'https://nasa.gov',
    date: 'Oct 7, 2026',
    readTime: '3 min read',
    impact: 'High',
    keyTakeaways: [
      'Habitation module provides life support and communications for long-duration crews.',
      'Optical laser downlink enables real-time scientific telemetry transfer to Earth.',
      'Direct stepping stone for interplanetary crewed exploration.',
    ],
    actionTips: [
      'Explore open NASA Lunar Data Portal APIs for live telemetry feeds.',
    ],
  },
  {
    id: 'news-global-4',
    title: 'WHO Global Health Report: Second-Generation Malaria Vaccine Reaches 85% Child Coverage',
    category: 'news',
    subcategory: 'Global Health News',
    summary: 'R21/Matrix-M rollout slashes pediatric clinical malaria incidence by over 78% across 22 endemic African nations.',
    content: `The World Health Organization (WHO) and Gavi have released milestone epidemiology data showing unprecedented efficacy in pediatric vector-borne disease suppression. Over 45 million doses have been administered with negligible adverse reaction rates, heralding one of the most transformative public health triumphs of the decade.`,
    tags: ['WHO', 'Public Health', 'Vaccines', 'Epidemiology', 'Global Medicine'],
    source: 'World Health Organization & The Lancet Global Health',
    sourceUrl: 'https://who.int',
    date: 'Oct 6, 2026',
    readTime: '3 min read',
    impact: 'Global',
    featured: true,
    keyTakeaways: [
      '78% drop in severe clinical pediatric malaria admissions across 22 countries.',
      'Matrix-M adjuvant technology delivered scalable, cost-effective immunization.',
      'Serves as an operational blueprint for next-generation tropical disease interventions.',
    ],
  },
  {
    id: 'news-global-5',
    title: 'Global Semiconductor Consortium Achieves Commercial 1.4nm Gate-All-Around Wafers',
    category: 'news',
    subcategory: 'Semiconductors & Computing',
    summary: 'High-NA EUV lithography achieves 35% performance-per-watt efficiency gains for next-generation on-device neuromorphic chips.',
    content: `Foundries in Taiwan and the US have achieved defect density parity on 1.4nm (A14) nodes utilizing second-generation nanosheet RibbonFET architectures. The breakthrough enables mobile and edge edge devices to run 70B parameter models natively with minimal thermal throttling.`,
    tags: ['Semiconductors', 'Hardware', 'Hardware AI', 'Nanotechnology'],
    source: 'IEEE Spectrum & TechCrunch Enterprise',
    sourceUrl: 'https://ieee.org',
    date: 'Oct 5, 2026',
    readTime: '4 min read',
    impact: 'High',
    keyTakeaways: [
      'High-NA Extreme Ultraviolet lithography achieves sub-2nm pitch resolution.',
      '35% improvement in compute efficiency per watt over 3nm nodes.',
      'Enables high-speed local inference for complex cognitive tasks on portable silicon.',
    ],
  },

  // =========================================================================
  // 2. HEALTHCARE TIPS & CLINICAL PROTOCOLS
  // =========================================================================
  {
    id: 'health-protocol-1',
    title: 'Circadian Light Exposure & Cortisol Awakening Optimization',
    category: 'health',
    subcategory: 'Circadian Medicine & Sleep',
    summary: 'Evidence-backed protocol for resetting sleep-wake architecture, boosting morning alertness, and optimizing nocturnal melatonin secretion.',
    content: `The human suprachiasmatic nucleus (SCN) serves as the master biological pacemaker, synchronized primarily through retinal ganglion cells sensitive to 460-480nm spectrum light.

Immediate exposure to high lux natural sunlight triggers the Cortisol Awakening Response (CAR), which establishes the countdown for endogenous melatonin synthesis approximately 14-16 hours later.`,
    tags: ['Circadian Rhythm', 'Sleep Science', 'Cortisol', 'Biohacking', 'Wellness'],
    source: 'Mayo Clinic Sleep Disorders Center & Cell Metabolism',
    sourceUrl: 'https://mayoclinic.org',
    date: 'Updated Daily',
    readTime: '4 min read',
    impact: 'High',
    featured: true,
    keyTakeaways: [
      'Morning photon density synchronizes autonomic nervous tone and cognitive clarity.',
      'Delaying morning caffeine by 90-120 minutes prevents mid-afternoon adenosine crash.',
      'Evening blue-spectrum attenuation accelerates onset of Stage 3 restorative slow-wave sleep.',
    ],
    actionTips: [
      'View 10,000+ lux sunlight for 10-15 minutes within 30 minutes of waking (do not look directly at the sun).',
      'If sunrise is delayed, utilize a calibrated 10,000 lux seasonal daylight lamp at eye level.',
      'Cease caffeine intake 10 hours before planned bedtime to preserve sleep spindle architecture.',
      'Eliminate overhead LED fixtures after 9:00 PM; switch to warm low-intensity floor illumination.',
    ],
    clinicalDisclaimer: 'Clinical Disclaimer: For educational and lifestyle optimization purposes only. Individuals with retinal pathologies or bipolar spectrum disorders should consult an ophthalmologist or psychiatrist prior to high-lux phototherapy.',
    metrics: [
      {
        label: 'Cortisol Awakening Peak',
        value: '18.2 nmol/L',
        targetRange: '14.0 - 25.0 nmol/L',
        status: 'optimal',
      },
      {
        label: 'Melatonin Secretion Onset',
        value: '9:45 PM',
        targetRange: '9:00 - 10:30 PM',
        status: 'optimal',
      },
      {
        label: 'Adenosine Clearance Rate',
        value: '89%',
        targetRange: '> 85% at 90 min post-wake',
        status: 'optimal',
      },
    ],
  },
  {
    id: 'health-protocol-2',
    title: 'Cardiovascular Longevity: Zone-2 Conditioning & VO2 Max Protocol',
    category: 'health',
    subcategory: 'Cardiology & Longevity',
    summary: 'Clinical training regimen to maximize mitochondrial density, improve lactate clearance, and lower all-cause cardiovascular mortality.',
    content: `Cardiovascular disease remains the leading global cause of mortality. Prospective epidemiological studies demonstrate that individuals in the highest quintile of VO2 max exhibit a 50% relative risk reduction in all-cause mortality compared to the lowest quintile.

Zone-2 training (60-70% max heart rate, blood lactate 1.5-2.0 mmol/L) stimulates mitochondrial biogenesis in Type-I slow-twitch muscle fibers, enhancing fatty acid oxidation and metabolic resilience.`,
    tags: ['Cardiology', 'VO2 Max', 'Zone 2', 'Fitness', 'Longevity', 'Heart Health'],
    source: 'American College of Cardiology & Journal of the American Medical Association (JAMA)',
    sourceUrl: 'https://acc.org',
    date: 'Updated Weekly',
    readTime: '5 min read',
    impact: 'High',
    featured: true,
    keyTakeaways: [
      'Accumulate 150-180 minutes of Zone-2 exercise per week divided into 3-4 sessions.',
      'Incorporate 1 weekly session of Norwegian 4x4 high-intensity intervals to raise VO2 max ceiling.',
      'Elevated mitochondrial density significantly improves resting insulin sensitivity and lipid clearance.',
    ],
    actionTips: [
      'Maintain the "talk test" pace during Zone-2: you can speak in full sentences, but cannot sing.',
      'Monitor resting heart rate (RHR) upon waking; a downward trend indicates positive cardiac stroke volume adaptation.',
      'Pair aerobic conditioning with 2-3 sessions of progressive multi-joint resistance training for bone and lean mass preservation.',
    ],
    clinicalDisclaimer: 'Clinical Disclaimer: Individuals over 40 or those with pre-existing cardiovascular conditions, hypertension, or arrhythmia must undergo a supervised clinical exercise stress test before beginning high-intensity interval regimens.',
    metrics: [
      {
        label: 'Resting Heart Rate (RHR)',
        value: '58 bpm',
        targetRange: '50 - 65 bpm',
        status: 'optimal',
      },
      {
        label: 'Zone 2 Lactate Threshold',
        value: '1.7 mmol/L',
        targetRange: '1.4 - 2.0 mmol/L',
        status: 'optimal',
      },
      {
        label: 'Heart Rate Recovery (1 min)',
        value: '32 bpm drop',
        targetRange: '> 25 bpm drop',
        status: 'optimal',
      },
    ],
  },
  {
    id: 'health-protocol-3',
    title: 'Metabolic Flexibility: Glucose Spike Mitigation & Time-Restricted Feeding',
    category: 'health',
    subcategory: 'Metabolic Health & Nutrition',
    summary: 'Scientifically validated strategies to blunt postprandial glucose excursions, enhance insulin sensitivity, and prevent metabolic syndrome.',
    content: `Large glycemic swings induce reactive oxidative stress and vascular endothelial dysfunction. Adopting food sequencing (fibers and greens first, followed by proteins/fats, then complex carbohydrates) delays gastric emptying and dampens post-meal glucose spikes by up to 40%.`,
    tags: ['Metabolism', 'Nutrition', 'Blood Sugar', 'Insulin', 'Diet', 'HbA1c'],
    source: 'The Lancet Diabetes & Endocrinology & American Diabetes Association',
    sourceUrl: 'https://diabetes.org',
    date: 'Updated Weekly',
    readTime: '4 min read',
    impact: 'High',
    keyTakeaways: [
      'Food sequencing substantially flattens insulin spikes without reducing caloric intake.',
      'A light 10-15 minute walk post-meal recruits GLUT4 glucose transporters independently of insulin.',
      'A 12-to-14 hour overnight fasting window promotes cellular autophagy and mitochondrial turnover.',
    ],
    actionTips: [
      'Eat dietary fiber and cruciferous vegetables prior to starches and sugars.',
      'Engage in light movement or a 10-minute stroll within 30 minutes after dining.',
      'Avoid high-glycemic carbohydrates within 3 hours of sleep to prevent nocturnal adrenaline rebounds.',
      'Supplement soluble fiber (e.g. psyllium husk or inulin) if baseline dietary plant diversity is low.',
    ],
    clinicalDisclaimer: 'Clinical Disclaimer: Patients with Type 1 or Type 2 diabetes taking hypoglycemic medications or insulin should never alter dietary fasting schedules without physician supervision.',
    metrics: [
      {
        label: 'Fasting Plasma Glucose',
        value: '84 mg/dL',
        targetRange: '70 - 99 mg/dL',
        status: 'optimal',
      },
      {
        label: 'Estimated HbA1c',
        value: '5.1%',
        targetRange: '< 5.7%',
        status: 'optimal',
      },
      {
        label: 'Postprandial Peak Delta',
        value: '+28 mg/dL',
        targetRange: '< 35 mg/dL above baseline',
        status: 'optimal',
      },
    ],
  },
  {
    id: 'health-protocol-4',
    title: 'Neurobiology of Stress: Vagus Nerve Stimulation & Autonomic Reset',
    category: 'health',
    subcategory: 'Mental Health & Neuroscience',
    summary: 'Immediate somatic and respiratory techniques to dampen sympathetic overdrive, downregulate cortisol, and elevate Heart Rate Variability (HRV).',
    content: `Chronic psychological stress hyper-activates the hypothalamic-pituitary-adrenal (HPA) axis, depleting neurotrophic factors (BDNF) and promoting systemic neuroinflammation.

Engaging the vagus nerve through intentional respiratory mechanics activates cholinergic anti-inflammatory pathways and shifts cardiac pacing into parasympathetic dominance.`,
    tags: ['Mental Health', 'Vagus Nerve', 'HRV', 'Anxiety Relief', 'Neuroscience', 'Stress'],
    source: 'Nature Reviews Neuroscience & Stanford Medicine',
    sourceUrl: 'https://stanford.edu',
    date: 'Updated Weekly',
    readTime: '4 min read',
    impact: 'High',
    featured: true,
    keyTakeaways: [
      'Cyclic physiological sighing (two inhales through the nose, one prolonged exhale through the mouth) rapidly lowers autonomic arousal.',
      'Elevated Heart Rate Variability (rMSSD) correlates with systemic parasympathetic recovery capacity.',
      'Brief cold-face immersion triggers the mammalian dive reflex, immediately slowing heart rate.',
    ],
    actionTips: [
      'Perform 5 cycles of physiological sighing whenever acute stress or cognitive panic spikes.',
      'Practice 4-7-8 breathing (inhale 4s, hold 7s, exhale 8s) for 5 minutes prior to bed.',
      'Incorporate 20 minutes of outdoor nature immersion ("Shinrin-yoku") 3 times weekly to reduce prefrontal cortex fatigue.',
      'Establish strict boundaries around doom-scrolling and uncurated news alerts during evening hours.',
    ],
    clinicalDisclaimer: 'Clinical Disclaimer: Somatic relaxation techniques are supportive adjuncts and not a substitute for professional psychotherapy or psychiatric treatment for generalized anxiety or major depressive disorder.',
    metrics: [
      {
        label: 'Heart Rate Variability (rMSSD)',
        value: '64 ms',
        targetRange: '45 - 80 ms',
        status: 'optimal',
      },
      {
        label: 'Sympathetic / Parasympathetic Ratio',
        value: '0.85',
        targetRange: '0.6 - 1.2',
        status: 'optimal',
      },
    ],
  },
  {
    id: 'health-protocol-5',
    title: 'Workplace Ergonomics: Cervical Spine & Biomechanical Preservation',
    category: 'health',
    subcategory: 'Physical Therapy & Ergonomics',
    summary: 'Evidence-based workspace configuration to prevent forward head posture ("tech neck"), carpal tunnel, and lumbar disc herniation.',
    content: `Prolonged forward head flexion multiplies effective gravitational load on cervical vertebrae from 10-12 lbs up to 45-60 lbs at a 45-degree angle. Over months, this causes muscular imbalance, suboccipital tension headaches, and thoracic kyphosis.`,
    tags: ['Ergonomics', 'Posture', 'Spine Health', 'Productivity', 'Physical Health'],
    source: 'Spine Journal & Harvard Health Publishing',
    sourceUrl: 'https://health.harvard.edu',
    date: 'Updated Weekly',
    readTime: '3 min read',
    impact: 'Medium',
    keyTakeaways: [
      'Position display monitor such that the top third of the screen is at resting horizontal eye line.',
      'Keep elbows at 90-100 degrees with forearms parallel to floor surface.',
      'Implement the 20-20-20 visual rest rule: every 20 minutes, gaze at an object 20 feet away for 20 seconds.',
    ],
    actionTips: [
      'Elevate laptop screens using a stand and connect an external mechanical keyboard and ergonomic mouse.',
      'Use a lumbar support pillow or chair adjustment to preserve natural lordotic lumbar curvature.',
      'Perform 10 chin tucks and doorway pectoral stretches every 2 hours of seated desk work.',
    ],
  },
  {
    id: 'health-protocol-6',
    title: 'Emergency Medical Triage: Red Flag Indicators & Immediate Action Rules',
    category: 'health',
    subcategory: 'Clinical Triage & First Aid',
    summary: 'Critical clinical triage matrix: Recognizing acute stroke, cardiac ischemia, anaphylaxis, and pulmonary embolism indicators.',
    content: `Rapid identification of acute time-critical medical emergencies saves lives. Familiarity with standardized clinical mnemonics enables rapid triaging and EMS dispatch without dangerous delays.`,
    tags: ['First Aid', 'Emergency Medicine', 'Stroke', 'Cardiac', 'Triage', 'Safety'],
    source: 'American Heart Association (AHA) & NHS Emergency Triage Handbook',
    sourceUrl: 'https://heart.org',
    date: 'Updated Monthly',
    readTime: '4 min read',
    impact: 'Global',
    featured: true,
    keyTakeaways: [
      'STROKE (FAST): Face drooping, Arm weakness, Slurred Speech, Time to call Emergency (911/999/112).',
      'HEART ATTACK: Sudden substernal chest crushing pressure, radiation to jaw/left arm, diaphoresis (cold sweats).',
      'ANAPHYLAXIS: Acute respiratory stridor, facial swelling, urticaria (hives), sudden blood pressure collapse — administer Epinephrine immediately.',
    ],
    actionTips: [
      'Never drive oneself to an emergency room during suspected heart attack or stroke — call emergency ambulance services immediately.',
      'Note the exact time of symptom onset; clinical thrombolysis (tPA) has a narrow therapeutic window (3 to 4.5 hours).',
      'If an individual is unresponsive and not breathing normally, begin immediate bystander CPR (100-120 compressions/min to the beat of "Stayin Alive") and request an AED.',
    ],
    clinicalDisclaimer: 'Emergency Warning: If you or anyone around you is experiencing sudden severe chest pain, inability to speak, facial numbness, or severe breathing difficulties, immediately dial your local emergency services (911 / 999 / 112).',
  },
  {
    id: 'health-protocol-7',
    title: 'Evidence-Based Micronutrient & Hydration Optimization',
    category: 'health',
    subcategory: 'Preventative Medicine & Nutrition',
    summary: 'Clinical guidance on essential electrolyte ratios (Sodium, Potassium, Magnesium) and foundational blood biomarkers.',
    content: `Subclinical electrolyte deficiencies frequently masquerade as chronic brain fog, muscle cramping, and postural lightheadedness. 

Optimal intracellular hydration requires balanced electrolyte intake: approximately 3,500-4,700mg of dietary potassium, 2,000-3,000mg sodium (calibrated to sweat rate), and 350-450mg elemental magnesium (glycinate, malate, or L-threonate).`,
    tags: ['Electrolytes', 'Hydration', 'Magnesium', 'Brain Health', 'Nutrition'],
    source: 'National Institutes of Health (NIH) Office of Dietary Supplements',
    sourceUrl: 'https://nih.gov',
    date: 'Updated Weekly',
    readTime: '3 min read',
    impact: 'Medium',
    keyTakeaways: [
      'Water without adequate electrolytes can dilute plasma osmolality and exacerbate dehydration.',
      'Magnesium L-Threonate readily crosses the blood-brain barrier to support synaptic density.',
      'Annual blood testing should include Complete Blood Count (CBC), Metabolic Panel, Vitamin D (25-OH), and Ferritin.',
    ],
    actionTips: [
      'Add a pinch of unrefined mineral salt and lemon to your first glass of morning water.',
      'Target 30 different plant foods per week (vegetables, nuts, seeds, herbs) to foster gut microbiome richness.',
      'Take magnesium in the evening 1 hour prior to sleep to promote skeletal muscle relaxation.',
    ],
  },

  // =========================================================================
  // 3. SCIENCE, ACADEMIC & TECHNOLOGY FRONTIERS
  // =========================================================================
  {
    id: 'sci-frontier-1',
    title: 'Frontiers in Quantum Error Correction: Logical Qubits Exceed Physical Fidelity',
    category: 'science',
    subcategory: 'Quantum Computing & Information Theory',
    summary: 'Breakthrough surface code implementations demonstrate error suppression below the fault-tolerance threshold in superconducting architectures.',
    content: `Major research labs in superconducting and neutral-atom quantum architectures have verified error suppression where adding physical qubits exponentially reduces logical error rates. This transition from "noisy intermediate-scale quantum" (NISQ) to fault-tolerant quantum computing unlocks practical molecular simulation algorithms.`,
    tags: ['Quantum Computing', 'Physics', 'Information Theory', 'Computer Science'],
    source: 'Physical Review Letters & Quanta Magazine',
    sourceUrl: 'https://quantamagazine.org',
    date: 'Oct 4, 2026',
    readTime: '5 min read',
    impact: 'High',
    keyTakeaways: [
      'Distance-5 surface codes achieved 10x error suppression relative to raw physical qubits.',
      'Enables high-fidelity simulations of complex chemical catalysts and room-temperature superconductors.',
      'Cryptographic post-quantum migration protocols (NIST ML-KEM, SLH-DSA) become urgent priorities.',
    ],
  },
  {
    id: 'sci-frontier-2',
    title: 'CRISPR Prime Editing & In-Vivo Epigenetic Silencing Clinical Trials',
    category: 'science',
    subcategory: 'Biotechnology & Genetics',
    summary: 'Targeted single-base transversion edits without double-strand DNA breaks demonstrate durable therapeutic response in cardiometabolic trials.',
    content: `In-vivo delivery of prime editing ribonucleoproteins via targeted lipid nanoparticles (LNPs) successfully achieved permanent PCSK9 downregulation in hepatic tissue, slashing circulating LDL cholesterol by 65% in Phase 2 clinical human trials without detectable off-target chromosomal translocations.`,
    tags: ['CRISPR', 'Genetics', 'Biotechnology', 'Gene Therapy', 'Cardiology'],
    source: 'New England Journal of Medicine (NEJM) & Science',
    sourceUrl: 'https://nejm.org',
    date: 'Oct 3, 2026',
    readTime: '4 min read',
    impact: 'Global',
    featured: true,
    keyTakeaways: [
      'Prime editors rewrite genomic loci without double-stranded breaks, dramatically enhancing safety profiles.',
      'Lipid nanoparticle organ-specific tropism enables localized liver and myocardial delivery.',
      'Paves the way for one-time permanent therapeutics for inherited cardiovascular conditions.',
    ],
  },
  {
    id: 'sci-frontier-3',
    title: 'Distributed Consensus & Byzantine Fault Tolerance at Scale',
    category: 'science',
    subcategory: 'Distributed Systems & Software Engineering',
    summary: 'Comparative analysis of Raft, PBFT, and DAG-based consensus models for ultra-high transaction throughput distributed databases.',
    content: `Traditional consensus algorithms face trade-offs between latency, message complexity O(n²), and partition tolerance. Directed Acyclic Graph (DAG) memory pools coupled with Narwhal and Bullshark ordering engines decouple data dissemination from ordering, yielding over 150,000 TPS with sub-second finality.`,
    tags: ['Distributed Systems', 'Raft', 'Consensus', 'Software Architecture', 'Computer Science'],
    source: 'ACM Transactions on Computer Systems (TOCS)',
    sourceUrl: 'https://acm.org',
    date: 'Oct 2, 2026',
    readTime: '5 min read',
    impact: 'High',
    keyTakeaways: [
      'Decoupling data dissemination from transaction ordering eliminates consensus network bottlenecks.',
      'Byzantine fault tolerance tolerates up to f < n/3 malicious or partitioned validator nodes.',
      'Randomized election timers in Raft implementations prevent vote-split deadlocks during network blips.',
    ],
  },
  {
    id: 'sci-frontier-4',
    title: 'Neuroplasticity & Synaptic Pruning in Adult Learning',
    category: 'science',
    subcategory: 'Cognitive Neuroscience & Education',
    summary: 'Mechanisms of adult neuroplasticity: How focused attention, acetylcholine, and sleep consolidate complex knowledge frameworks.',
    content: `Adult neuroplasticity requires high attentional focus driven by localized acetylcholine and norepinephrine release during study sessions, followed by slow-wave NREM and REM sleep where synaptic pruning and long-term potentiation (LTP) permanently encode memory networks in the cerebral cortex.`,
    tags: ['Neuroplasticity', 'Learning', 'Cognition', 'Memory', 'Brain'],
    source: 'Neuron & Trends in Cognitive Sciences',
    sourceUrl: 'https://cell.com/neuron',
    date: 'Oct 1, 2026',
    readTime: '4 min read',
    impact: 'Medium',
    keyTakeaways: [
      'Focused bouts of 60-90 minutes trigger optimal cholinergic activation for learning.',
      'Active recall and spaced repetition accelerate synaptic structural consolidation.',
      'Sleep is the mandatory biological step where short-term hippocampal memory transfers to cortical long-term storage.',
    ],
  },

  // =========================================================================
  // 4. GLOBAL PRODUCTIVITY & COGNITIVE PERFORMANCE
  // =========================================================================
  {
    id: 'prod-global-1',
    title: 'Ultradian Rhythm Deep Work: The 90-Minute Cognitive Cycle',
    category: 'productivity',
    subcategory: 'Focus & High Performance',
    summary: 'Structuring cognitive output around biological ultradian cycles to maximize flow state and prevent mental fatigue.',
    content: `The human brain functions on 90-to-120 minute ultradian rhythms throughout wakefulness. Pushing beyond this threshold without recovery triggers cognitive deceleration, high error rates, and dopamine depletion. Integrating 15-minute non-digital recovery intervals resets executive function.`,
    tags: ['Deep Work', 'Ultradian Rhythms', 'Focus', 'Productivity', 'Peak Performance'],
    source: 'Harvard Business Review & Cognitive Psychology',
    sourceUrl: 'https://hbr.org',
    date: 'Updated Weekly',
    readTime: '3 min read',
    impact: 'Medium',
    keyTakeaways: [
      'Limit deep cognitive work blocks to 90 continuous minutes.',
      'Follow each block with 15 minutes of zero-input recovery (walking, hydration, resting eyes).',
      'Front-load highest-complexity analytical tasks into the 2-4 hour window following morning cortisol peak.',
    ],
  },
];

// ---------------------------------------------------------------------------
// Helper Search & Filter Functions
// ---------------------------------------------------------------------------

export function searchWorldKnowledge(query: string, category?: KnowledgeCategory | 'all'): WorldKnowledgeItem[] {
  const cleanQuery = query.toLowerCase().trim();
  return WORLD_KNOWLEDGE_BASE.filter((item) => {
    const matchesCategory = !category || category === 'all' || item.category === category;
    if (!matchesCategory) return false;
    if (!cleanQuery) return true;

    return (
      item.title.toLowerCase().includes(cleanQuery) ||
      item.summary.toLowerCase().includes(cleanQuery) ||
      item.subcategory.toLowerCase().includes(cleanQuery) ||
      item.tags.some((tag) => tag.toLowerCase().includes(cleanQuery)) ||
      item.keyTakeaways.some((t) => t.toLowerCase().includes(cleanQuery)) ||
      item.source.toLowerCase().includes(cleanQuery)
    );
  });
}

export function getFeaturedKnowledge(): WorldKnowledgeItem[] {
  return WORLD_KNOWLEDGE_BASE.filter((item) => item.featured);
}

export function getKnowledgeByCategory(category: KnowledgeCategory): WorldKnowledgeItem[] {
  return WORLD_KNOWLEDGE_BASE.filter((item) => item.category === category);
}

export function getKnowledgeById(id: string): WorldKnowledgeItem | undefined {
  return WORLD_KNOWLEDGE_BASE.find((item) => item.id === id);
}

export const KNOWLEDGE_CATEGORIES: { id: KnowledgeCategory | 'all'; label: string; icon: string; count: number }[] = [
  { id: 'all', label: 'All Knowledge', icon: 'Globe', count: WORLD_KNOWLEDGE_BASE.length },
  { id: 'news', label: 'World News', icon: 'Newspaper', count: WORLD_KNOWLEDGE_BASE.filter((k) => k.category === 'news').length },
  { id: 'health', label: 'Healthcare & Tips', icon: 'HeartPulse', count: WORLD_KNOWLEDGE_BASE.filter((k) => k.category === 'health').length },
  { id: 'science', label: 'Science & Frontiers', icon: 'Atom', count: WORLD_KNOWLEDGE_BASE.filter((k) => k.category === 'science').length },
  { id: 'productivity', label: 'Productivity & Habits', icon: 'Zap', count: WORLD_KNOWLEDGE_BASE.filter((k) => k.category === 'productivity').length },
];
