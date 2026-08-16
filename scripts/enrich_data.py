import json, re, urllib.parse
from dateutil import parser as dparser

SRC = "src/data/bulletins.json"

COUNTRY_KEYWORDS = [
    ("UK", "United Kingdom"), ("UCAS", "United Kingdom"),
    ("Singapore", "Singapore"), ("NTU", "Singapore"), ("NUS", "Singapore"),
    ("Italy", "Italy"), ("Bocconi", "Italy"),
    ("Oxford", "United Kingdom (Oxford)"),
    ("Harvard", "USA (Harvard University)"),
    ("Penn", "USA (University of Pennsylvania)"),
    ("Johns Hopkins", "USA (Johns Hopkins University)"),
    ("RIT", "USA (Rochester Institute of Technology)"),
    ("Australia", "Australia"),
    ("Ashoka", "India (Ashoka University, Sonipat)"),
    ("ISRO", "India (Remote/Online)"),
]

ORG_MAP = {
    "ucas-workshop-jun": "UCAS (Universities and Colleges Admissions Service, UK)",
    "college-unfiltered-jun": "The Shri Ram School CCC (Alumni Podcast)",
    "logic-olympiad": "International Logic Olympiad",
    "vexors-puzzles": "Vexors",
    "offers-to-visas-jun": "Cialfo",
    "huso-2026": "Harvard Undergraduate Science Olympiad (HUSO)",
    "careers-in-sports": "The Shri Ram School CCC",
    "aranyaarth-sustainability": "Aranyaarth Foundation",
    "indian-debating-league": "Indian Debating League",
    "tribesforgood-jun": "TribesforGOOD",
    "ntu-genai-bootcamp": "Nanyang Technological University (NTU), Singapore",
    "science-without-borders": "Science Without Borders®",
    "bocconi-summer-jun": "Bocconi University, Milan",
    "ai-internship-aiya": "Nanyang Technological University (NTU), Singapore",
    "gaip-business": "Global Academic Internship Programme (GAIP)",
    "supros-career-exploration": "SUPROS",
    "aerospace-isro-internship": "Ex-ISRO Mentor Program",
    "public-policy-girls": "Public Policy Case Competition for High School Girls",
    "atlas-summer-school": "ATLAS Summer School",
    "tiger-stripes-rit": "Rochester Institute of Technology (RIT)",
    "music-production-summer": "Music Production & Creation Summer Program",
    "buildup-internships": "Build-up Internships",
    "geniushub-summer": "GeniusHub",
    "buildup-summer-june": "BuildUp Summer",
    "climate-change-challenge": "Climate Change Challenge / University of Oxford",
    "oxford-summer-schools": "Saïd Business School, University of Oxford",
    "one-young-india": "One Young India",
    "gaip-nus-business": "National University of Singapore (NUS)",
    "aviation-internship": "International Aviation Internship",
    "ashoka-horizons": "Ashoka University",
    "futurowise-courses": "Futurowise",
    "masters-union-workshops": "Masters' Union",
    "masters-union-bootcamp": "Masters' Union",
    "iit-coaching-cuet-jee-neet": "IIT & Ministry of Education (SATHEE Platform)",
    "penn-step": "University of Pennsylvania (Penn STEP)",
    "australia-connect": "Australia Connect Program",
    "johns-hopkins-workshops": "Johns Hopkins University",
}


def guess_org(p):
    if p["id"] in ORG_MAP:
        return ORG_MAP[p["id"]]
    for tag in p.get("tags", []):
        if tag in ("UCAS", "Harvard", "Oxford", "Bocconi", "NTU", "NUS", "RIT", "Penn", "Ashoka"):
            return tag
    return "The Shri Ram School, Career Counselling Centre"


def guess_location(p):
    venue = (p.get("venue") or "").strip()
    if venue:
        if "school" in venue.lower() or "campus" in venue.lower():
            return "Gurugram, India (School Campus)"
        return venue
    mode = p.get("mode", "")
    text = " ".join([p.get("title", ""), " ".join(p.get("tags", []))])
    if "In-Person" in mode or "Offline" in mode:
        for kw, loc in COUNTRY_KEYWORDS:
            if kw.lower() in text.lower():
                return loc
        return "Gurugram, India (School Campus)"
    return "Online / Global"


def guess_eligibility(p):
    return p.get("audience") or f"Students of Grades {p.get('grades','')}"


def parse_date_safe(text):
    if not text:
        return None
    # take the first date-looking fragment
    text = re.split(r";|\bto\b|\u2013|-{1}\s", text)[0]
    text = re.sub(r"(Deadline:|Registration:|Payment:|Qualifiers:|Finals:|Round \d:)", "", text, flags=re.I).strip()
    try:
        dt = dparser.parse(text, fuzzy=True, default=None)
        return dt.date().isoformat()
    except Exception:
        return None


def registration_link(p):
    q = urllib.parse.quote(p["title"])
    return f"https://www.google.com/search?q={q}"


def enrich(p):
    p["organisation"] = guess_org(p)
    p["location"] = guess_location(p)
    p["eligibility"] = guess_eligibility(p)
    p["registrationLink"] = registration_link(p)
    p["registrationLinkVerified"] = False
    p["deadlineDate"] = parse_date_safe(p.get("deadline")) or parse_date_safe(p.get("date"))
    p["dateISO"] = parse_date_safe(p.get("date"))
    return p


def main():
    with open(SRC) as f:
        data = json.load(f)
    for b in data["bulletins"]:
        b["programs"] = [enrich(p) for p in b["programs"]]
    with open(SRC, "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print("Enriched", sum(len(b["programs"]) for b in data["bulletins"]), "programs")


if __name__ == "__main__":
    main()
