export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">About CCC Bulletin</h2>
      <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 space-y-4">
        <p className="text-gray-700 leading-relaxed">
          The <strong>Career Counselling Centre (CCC)</strong> at The Shri Ram School publishes a
          weekly bulletin featuring curated opportunities for students in Grades 6 to 12. These
          include university visits, summer programs, workshops, internships, competitions, and more.
        </p>
        <p className="text-gray-700 leading-relaxed">
          This website makes the bulletin easier to browse, search, and filter. Every opportunity is its
          own card with eligibility, location, dates, and a direct <strong>Register</strong> link, plus
          options to <strong>Star</strong>, <strong>Add to Calendar</strong>, and <strong>Share</strong> it.
        </p>
        <p className="text-gray-700 leading-relaxed">
          Head to <strong>My Page</strong> for your personal <strong>Inbox</strong> (new arrivals from the
          latest bulletin), <strong>Starred</strong> (opportunities you've saved), and{" "}
          <strong>Archive</strong> (things you've reviewed or aren't interested in — kept, not deleted).
        </p>
        <div className="bg-yellow-50 rounded-lg p-4 mt-4">
          <h3 className="text-sm font-semibold text-yellow-800 mb-2">Campuses</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <p className="font-medium">Moulsari Campus</p>
              <p>V-37, Moulsari Avenue, DLF City Phase 3</p>
              <p>Gurugram &ndash; 122002</p>
              <p>Tel: 0124-4784400</p>
            </div>
            <div>
              <p className="font-medium">Aravali Campus</p>
              <p>Hamilton Court Complex, DLF City Phase 4</p>
              <p>Gurugram &ndash; 122002</p>
              <p>Tel: 0124-4784300</p>
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-500 pt-2">
          For queries about the bulletin, please contact{" "}
          <a href="mailto:aarti.bhatia@tsrs.org" className="text-yellow-700 hover:underline">
            aarti.bhatia@tsrs.org
          </a>
        </p>
      </div>
    </div>
  );
}
