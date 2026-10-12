// src/constants/profile-options.ts
// Every list the profile page and the onboarding modal choose from, in one place.
// The server validates against these same lists (src/schemas/profile.ts), so a value
// that is not here can never be saved.

export const COUNTRY_NAMES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia",
  "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium",
  "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria",
  "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad",
  "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Côte d'Ivoire", "Croatia", "Cuba", "Cyprus",
  "Czech Republic", "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic",
  "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji",
  "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea",
  "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq",
  "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kosovo", "Kuwait",
  "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania",
  "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania",
  "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique",
  "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria",
  "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama",
  "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia",
  "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino",
  "São Tomé and Príncipe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore",
  "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain",
  "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania",
  "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Türkiye", "Turkmenistan",
  "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay",
  "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe",
] as const;

// Where Ruhe places students, most requested first. "Other" keeps the list honest for
// people who are still undecided or want somewhere else.
export const STUDY_DESTINATIONS = [
  "United Kingdom", "Canada", "United States", "Germany", "Australia", "Ireland",
  "New Zealand", "France", "Netherlands", "Other",
] as const;

export const STUDY_LEVELS = [
  "Foundation / Pathway",
  "Undergraduate",
  "Postgraduate (Master's)",
  "PhD / Doctorate",
  "Diploma / Certificate",
  "Short course / Summer school",
] as const;

export const MONTHS = [
  { value: "1", label: "January" }, { value: "2", label: "February" }, { value: "3", label: "March" },
  { value: "4", label: "April" }, { value: "5", label: "May" }, { value: "6", label: "June" },
  { value: "7", label: "July" }, { value: "8", label: "August" }, { value: "9", label: "September" },
  { value: "10", label: "October" }, { value: "11", label: "November" }, { value: "12", label: "December" },
] as const;

export const ACADEMIC_LEVELS = [
  "Secondary school",
  "A-levels / IB",
  "Diploma / HND / ND",
  "Bachelor's degree",
  "Postgraduate diploma",
  "Master's degree",
  "PhD / Doctorate",
  "Other",
] as const;

export const ENGLISH_TESTS = [
  "IELTS Academic", "IELTS UKVI", "TOEFL iBT", "PTE Academic", "Duolingo English Test",
  "Cambridge English", "Other",
] as const;

export const STANDARDIZED_TESTS = ["GRE", "GMAT", "SAT", "ACT", "LSAT", "Other"] as const;

export const SUBJECT_SUGGESTIONS = [
  "Computer Science", "Data Science", "Artificial Intelligence", "Cyber Security", "Software Engineering",
  "Business Administration", "Finance", "Accounting", "Economics", "Marketing", "Project Management",
  "Supply Chain Management", "International Relations", "Law", "Medicine", "Nursing", "Public Health",
  "Pharmacy", "Biotechnology", "Psychology", "Social Work", "Education", "Architecture",
  "Civil Engineering", "Mechanical Engineering", "Electrical Engineering", "Environmental Science",
  "Media and Communications", "Hospitality and Tourism", "Design",
] as const;

export const MAX_SUBJECTS = 10;

// Years offered in the "start year" and qualification year dropdowns.
export function startYearOptions(count = 5): string[] {
  const now = new Date().getFullYear();
  return Array.from({ length: count }, (_, i) => String(now + i));
}

export function pastYearOptions(back = 50, forward = 6): string[] {
  const now = new Date().getFullYear();
  return Array.from({ length: back + forward + 1 }, (_, i) => String(now + forward - i));
}