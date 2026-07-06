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
  }
];

export function getUniversityBySlug(slug: string): University | undefined {
  return UNIVERSITIES.find(u => u.slug === slug);
}
