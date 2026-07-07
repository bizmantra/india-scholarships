export interface University {
  name: string;
  slug: string;
  description: string;
  keywords: string[];
  nationalEligible: boolean;
}

export const UNIVERSITIES: University[] = [
  {
    name: "BITS Pilani",
    slug: "bits-pilani",
    description: "Birla Institute of Technology and Science (BITS), Pilani (covering Pilani, Goa, and Hyderabad campuses) offers robust merit and merit-cum-need tuition fee waivers to support students across engineering, science, and pharmacy programs.",
    keywords: ["bits", "bitsat", "pilani"],
    nationalEligible: true
  },
  {
    name: "IIT Bombay",
    slug: "iit-bombay",
    description: "Indian Institute of Technology (IIT) Bombay provides extensive financial support including merit-cum-means (MCM) scholarships, full/partial tuition waivers, and free messing schemes to ensure no student is held back due to financial constraints.",
    keywords: ["iit bombay", "iitb"],
    nationalEligible: true
  },
  {
    name: "IIT Delhi",
    slug: "iit-delhi",
    description: "Indian Institute of Technology (IIT) Delhi offers a variety of institutional assistance programs including MCM scholarships, donor-sponsored awards, and postgraduate research fellowships to support its academic community.",
    keywords: ["iit delhi", "iitd"],
    nationalEligible: true
  },
  {
    name: "IIT Madras",
    slug: "iit-madras",
    description: "Indian Institute of Technology (IIT) Madras matches top-tier academics with comprehensive financial support, including institute fee waivers, MCM awards, and external alumni-sponsored endowments.",
    keywords: ["iit madras", "iitm"],
    nationalEligible: true
  },
  {
    name: "IIT Kharagpur",
    slug: "iit-kharagpur",
    description: "Indian Institute of Technology (IIT) Kharagpur, the oldest of the IITs, runs multiple student aid programs including the Institute MCM scholarship, endowment grants, and special assistance schemes for SC/ST students.",
    keywords: ["iit kharagpur", "iitkgp"],
    nationalEligible: true
  },
  {
    name: "NIT Trichy",
    slug: "nit-trichy",
    description: "National Institute of Technology (NIT) Tiruchirappalli facilitates fee reimbursements and merit-cum-means support under central/state government schemes, along with alumni-sponsored welfare scholarships.",
    keywords: ["nit trichy", "nitt", "tiruchirappalli"],
    nationalEligible: true
  },
  {
    name: "NIT Surathkal",
    slug: "nit-surathkal",
    description: "National Institute of Technology Karnataka (NITK) Surathkal coordinates multiple state and national scholarships, alongside institutional fee concessions for category and low-income students.",
    keywords: ["nit surathkal", "nitk"],
    nationalEligible: true
  },
  {
    name: "Delhi University",
    slug: "delhi-university",
    description: "Official financial support schemes, merit scholarships, and book grants for undergraduate and postgraduate students at the University of Delhi (DU).",
    keywords: ["delhi university", "du ", "dean students welfare", "dsw.du.ac.in", "vice chancellor financial support"],
    nationalEligible: true
  },
  {
    name: "Jawaharlal Nehru University",
    slug: "jawaharlal-nehru-university",
    description: "Jawaharlal Nehru University (JNU), New Delhi, offers Merit-cum-Means (MCM) scholarships, endowment awards, and prestigious research fellowships to support students from all backgrounds.",
    keywords: ["jawaharlal-nehru-university", "jnu"],
    nationalEligible: true
  },
  {
    name: "Banaras Hindu University",
    slug: "banaras-hindu-university",
    description: "Banaras Hindu University (BHU), Varanasi, provides interest-free loan schemes, meal subsidies, student welfare funds, and post-doctoral research fellowships under its Institution of Eminence (IoE) program.",
    keywords: ["banaras-hindu-university", "bhu"],
    nationalEligible: true
  },
  {
    name: "Aligarh Muslim University",
    slug: "aligarh-muslim-university",
    description: "Aligarh Muslim University (AMU), Aligarh, offers Merit Financial Awards, need-based scholarships, and alumni-supported endowments to assist students across all departments.",
    keywords: ["aligarh-muslim-university", "amu"],
    nationalEligible: true
  },
  {
    name: "Jamia Millia Islamia",
    slug: "jamia-millia-islamia",
    description: "Jamia Millia Islamia (JMI), New Delhi, offers the prestigious Dr. APJ Abdul Kalam scholarship, university-level merit awards, and research fellowships to support regular students.",
    keywords: ["jamia-millia-islamia", "jmi"],
    nationalEligible: true
  },
  {
    name: "University of Hyderabad",
    slug: "university-of-hyderabad",
    description: "University of Hyderabad (UoH) provides need-based Student Assistance (UoH-SA), fifth-year PhD funding, and coordinates numerous national and state-level fellowships.",
    keywords: ["university-of-hyderabad", "uoh"],
    nationalEligible: true
  },
  {
    name: "Anna University",
    slug: "anna-university",
    description: "Anna University, Chennai, coordinates central and state government scholarships, first graduate concessions, and hosts various alumni-funded endowment scholarships.",
    keywords: ["anna-university"],
    nationalEligible: true
  },
  {
    name: "Visvesvaraya Technological University",
    slug: "visvesvaraya-technological-university",
    description: "Visvesvaraya Technological University (VTU), Belagavi, offers the Jnana Yaana Doctoral Fellowship (JYDF) and extensive project funding and tuition concessions for SC/ST students.",
    keywords: ["visvesvaraya-technological-university", "vtu"],
    nationalEligible: true
  },
  {
    name: "Savitribai Phule Pune University",
    slug: "savitribai-phule-pune-university",
    description: "Savitribai Phule Pune University (SPPU), Pune, runs the renowned Karmaveer Bhaurao Patil Earn and Learn Scheme, the Savitribai Phule scholarship, and state-backed MahaDBT programs.",
    keywords: ["savitribai-phule-pune-university", "sppu", "pune-university"],
    nationalEligible: true
  },
  {
    name: "Dr. A.P.J. Abdul Kalam Technical University",
    slug: "aktu",
    description: "Dr. A.P.J. Abdul Kalam Technical University (AKTU), Lucknow, facilitates the UP State Post-Matric Scholarship and fee reimbursement schemes, alongside student welfare funds.",
    keywords: ["aktu", "uptu"],
    nationalEligible: true
  },
  {
    name: "Ashoka University",
    slug: "ashoka-university",
    description: "Ashoka University, Sonipat, operates a need-blind admission policy with extensive need-based financial aid waivers up to 100% and merit-based aptitude scholarships.",
    keywords: ["ashoka", "ashoka-university"],
    nationalEligible: true
  },
  {
    name: "Vellore Institute of Technology",
    slug: "vellore-institute-of-technology",
    description: "Vellore Institute of Technology (VIT) runs the STARS scheme for rural students and the GVSDP merit-based tuition fee waiver programme based on VITEEE ranks.",
    keywords: ["vit", "vellore", "vellore-institute-of-technology", "vit-vellore"],
    nationalEligible: true
  },
  {
    name: "Manipal Academy of Higher Education",
    slug: "manipal-academy-of-higher-education",
    description: "Manipal Academy of Higher Education (MAHE), Manipal, offers Kalam-Pai freeships, scholar awards, and interest-subsidy schemes on education loans.",
    keywords: ["manipal-academy-of-higher-education", "mahe", "manipal-university"],
    nationalEligible: true
  }
];

export function getUniversityBySlug(slug: string): University | undefined {
  return UNIVERSITIES.find(u => u.slug === slug);
}
