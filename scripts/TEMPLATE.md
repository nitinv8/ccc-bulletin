# Bulletin Structuring Template

Use this template when manually structuring a bulletin. Copy the raw text and this prompt into Claude.

---

## Prompt for Claude

I have raw text extracted from a school Career Counselling Centre (CCC) Weekly Bulletin from The Shri Ram School. Please extract ALL programs/events and return a JSON object with this structure:

```json
{
  "id": "<month-year, e.g. jun-2026>",
  "title": "Career Counselling Centre Weekly Bulletin",
  "month": "<MONTH YEAR, e.g. JUNE 2026>",
  "source": "<heyzine URL>",
  "contact": "<contact email from the bulletin>",
  "school": "The Shri Ram School, Aravali & Moulsari",
  "programs": [
    {
      "id": "<kebab-case-short-id>",
      "title": "<program title>",
      "type": "<one of: Summer Program, Competition, Workshop, Internship, In-Person Session, Virtual Session, Podcast, Information>",
      "category": "<university-visits OR future-ready>",
      "campus": "SAR & ML",
      "grades": "<e.g. 9-12, 8-10, 11-12>",
      "audience": "<e.g. Students of Grades 9 to 12>",
      "overview": "<1-2 sentence summary>",
      "date": "<if mentioned, otherwise omit>",
      "deadline": "<if mentioned, otherwise omit>",
      "venue": "<if mentioned, otherwise omit>",
      "time": "<if mentioned, otherwise omit>",
      "mode": "<Online, In-Person, or Online/In-Person>",
      "tags": ["<3-4 relevant tags>"]
    }
  ]
}
```

Rules:
- "category" = "university-visits" for university visits, admissions sessions, and CCC initiatives. Everything else = "future-ready".
- Omit optional fields (date, deadline, venue, time) if not mentioned.
- Each program ID should be a short, descriptive kebab-case string.
- Return ONLY valid JSON.

Here is the raw text:

[PASTE RAW TEXT HERE]
