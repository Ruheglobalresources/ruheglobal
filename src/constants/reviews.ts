// src/constants/reviews.ts

export type CompanyReview = {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
};

export type StudyAbroadReview = {
  id: string;
  name: string;
  date: string;
  rating: number;
  text: string;
  tag: string;
};

export const COMPANY_REVIEWS: CompanyReview[] = [
  { id: "cr-01", name: "Chiamaka Eze", location: "Abuja", rating: 5, text: "From my first consultation to visa approval, the Ruhe team made a process I dreaded feel completely manageable. They followed up on every single document." },
  { id: "cr-02", name: "Ibrahim Sule", location: "Kano", rating: 5, text: "Professional, patient, and always available when I called. I recommend them to anyone confused about where to even start." },
  { id: "cr-03", name: "Ngozi Okafor", location: "Lagos", rating: 4, text: "Good service overall, though my file took a little longer than expected. The team communicated clearly throughout." },
  { id: "cr-04", name: "Tunde Bakare", location: "Ibadan", rating: 5, text: "They didn't just process my papers, they sat with me and explained every option before I chose a school." },
  { id: "cr-05", name: "Fatima Bello", location: "Abuja", rating: 5, text: "I walked in not knowing IELTS from TOEFL. I walked out with a plan, a school, and a visa. Incredible team." },
  { id: "cr-06", name: "Emeka Nwosu", location: "Enugu", rating: 5, text: "Transparent about costs from day one. No hidden surprises, which I really appreciated." },
  { id: "cr-07", name: "Aisha Mohammed", location: "Kaduna", rating: 5, text: "Ruhe helped my daughter secure admission and accommodation before we even landed. Total peace of mind." },
  { id: "cr-08", name: "Blessing Udo", location: "Uyo", rating: 4, text: "Great communication over WhatsApp and email. A few delays on the accommodation side but they sorted it out." },
  { id: "cr-09", name: "Chukwuemeka Obi", location: "Onitsha", rating: 5, text: "One of the most organized agencies I've dealt with. Every step had a checklist." },
  { id: "cr-10", name: "Halima Yusuf", location: "Abuja", rating: 5, text: "They handled my money transfer and tuition payment without a single hiccup. Saved me so much stress." },
  { id: "cr-11", name: "Segun Adeyemi", location: "Lagos", rating: 5, text: "I've been recommending Ruhe to everyone in my church group planning to study abroad." },
  { id: "cr-12", name: "Grace Effiong", location: "Calabar", rating: 5, text: "The consultants actually listen. They didn't push me toward the most expensive school, they pushed me toward the right one." },
  { id: "cr-13", name: "Yusuf Abdullahi", location: "Abuja", rating: 5, text: "My PR application felt impossible until Ruhe broke it into simple steps." },
  { id: "cr-14", name: "Amaka Chukwu", location: "Owerri", rating: 4, text: "Solid experience overall. Would have loved faster replies on weekends." },
  { id: "cr-15", name: "Kunle Ogundipe", location: "Ibadan", rating: 5, text: "From tutorials to visa lodgement, everything was under one roof. Saved me so much running around." },
  { id: "cr-16", name: "Zainab Aliyu", location: "Kano", rating: 5, text: "I passed my IELTS on the first attempt thanks to their tutors. Forever grateful." },
  { id: "cr-17", name: "Peace Etim", location: "Port Harcourt", rating: 5, text: "They found me accommodation close to campus before I'd even bought my ticket." },
  { id: "cr-18", name: "Obinna Chukwuma", location: "Aba", rating: 5, text: "Real people, real answers. No robotic responses, just genuine guidance." },
  { id: "cr-19", name: "Maryam Garba", location: "Abuja", rating: 4, text: "Good agency, professional staff. My only feedback is to speed up document reviews." },
  { id: "cr-20", name: "Damilola Fashola", location: "Lagos", rating: 5, text: "Two of my kids have gone through Ruhe now. Consistent quality both times." },
  { id: "cr-21", name: "Uche Nnamdi", location: "Enugu", rating: 5, text: "They were honest when a program wasn't a good fit for me, which built a lot of trust." },
  { id: "cr-22", name: "Rita Okonkwo", location: "Benin City", rating: 5, text: "Visa processing was quick and stress-free. Highly recommend for Canada applicants." },
  { id: "cr-23", name: "Abdulrahman Musa", location: "Abuja", rating: 5, text: "Excellent support from application to arrival. Their airport pickup partner even met me." },
  { id: "cr-24", name: "Funmilayo Adekunle", location: "Abeokuta", rating: 5, text: "Patient with all my questions, even the silly ones. Made me feel confident about my decision." },
  { id: "cr-25", name: "Chidinma Anyanwu", location: "Lagos", rating: 5, text: "Everything they promised, they delivered. On time, every time." },
  { id: "cr-26", name: "Sadiq Aliyu", location: "Sokoto", rating: 5, text: "Ruhe Global Resources turned a confusing process into a clear, guided journey." },
];

export const STUDY_ABROAD_REVIEWS: StudyAbroadReview[] = [
  { id: "sa-01", name: "Blessing Nwachukwu", date: "2025-02-11", rating: 5, tag: "Study Abroad · Canada", text: "Got admitted into University of Toronto with Ruhe's guidance. My application was flawless because they checked every document twice." },
  { id: "sa-02", name: "Temitope Ajayi", date: "2025-01-28", rating: 5, tag: "IELTS Prep", text: "Scored 7.5 overall after six weeks of tutorials with them. The mock tests were almost identical to the real exam." },
  { id: "sa-03", name: "Musa Ibrahim", date: "2024-11-03", rating: 5, tag: "Visa Processing · UK", text: "My UK study visa was approved in under three weeks. Ruhe's checklist meant zero refusals." },
  { id: "sa-04", name: "Ifeoma Okoro", date: "2024-10-19", rating: 4, tag: "Accommodation · Ireland", text: "They found me a room near Trinity College before I even landed in Dublin. Rent was a bit higher than I hoped, but the location was worth it." },
  { id: "sa-05", name: "Chinedu Okpara", date: "2025-03-02", rating: 5, tag: "Study Abroad · Germany", text: "TU Munich felt out of reach until Ruhe matched my grades to the right program. Now I'm actually here." },
  { id: "sa-06", name: "Amina Suleiman", date: "2024-09-14", rating: 5, tag: "Permanent Residency · Canada", text: "My PR file was messy from a previous agent. Ruhe fixed it and got me approved within months." },
  { id: "sa-07", name: "Victor Eze", date: "2025-04-07", rating: 5, tag: "Study Abroad · Australia", text: "Monash University, here I come. Ruhe handled the entire application while I focused on my final year exams." },
  { id: "sa-08", name: "Hauwa Abdullahi", date: "2024-08-22", rating: 5, tag: "Money Transfer", text: "Sent my first tuition payment through them and it landed in record time, no bank drama." },
  { id: "sa-09", name: "Chibuzor Ogbonna", date: "2025-01-09", rating: 5, tag: "Visa Processing · USA", text: "My US study visa interview prep session with their consultant is the reason I passed on the first try." },
  { id: "sa-10", name: "Rasheedat Alao", date: "2024-12-05", rating: 4, tag: "IELTS Prep", text: "Tutors were knowledgeable, classes sometimes started a few minutes late but content was always solid." },
  { id: "sa-11", name: "Emmanuel Danjuma", date: "2025-02-27", rating: 5, tag: "Study Abroad · UK", text: "Coventry University offer letter in hand within five weeks of applying. Ruhe made it look easy." },
  { id: "sa-12", name: "Nkechi Umeh", date: "2024-07-30", rating: 5, tag: "Accommodation · Canada", text: "Landed in Alberta and my apartment was already move-in ready thanks to their housing partners." },
  { id: "sa-13", name: "Suleiman Yakubu", date: "2025-03-18", rating: 5, tag: "Study Abroad · Ireland", text: "UCD accepted me into their business program. The Ruhe team's essay review made all the difference." },
  { id: "sa-14", name: "Patience Iwu", date: "2024-11-25", rating: 5, tag: "Visa Processing · Germany", text: "Germany's visa process has a reputation for being tough. My consultant walked me through every requirement personally." },
  { id: "sa-15", name: "Adaeze Nwokolo", date: "2025-01-15", rating: 5, tag: "Study Abroad · USA", text: "Purdue was my dream school and Ruhe made the dream real, from SOP editing to final admission." },
  { id: "sa-16", name: "Bala Muhammed", date: "2024-06-11", rating: 4, tag: "Permanent Residency · Australia", text: "Long process but they kept me updated every step, which made the wait bearable." },
  { id: "sa-17", name: "Chioma Iheanacho", date: "2025-02-04", rating: 5, tag: "IELTS Prep", text: "Best decision I made was enrolling in their weekend IELTS class. Scored a band 8 in reading." },
  { id: "sa-18", name: "Yakubu Sani", date: "2024-10-08", rating: 5, tag: "Study Abroad · Canada", text: "University of Alberta admission plus a scholarship recommendation, all from one consultation." },
  { id: "sa-19", name: "Ogochukwu Eneh", date: "2025-03-29", rating: 5, tag: "Accommodation · UK", text: "Ulster University housing sorted before resumption. No last-minute panic like my friends had." },
  { id: "sa-20", name: "Aliyu Garba", date: "2024-09-02", rating: 5, tag: "Visa Processing · Ireland", text: "Visa approved in record time. Their document checklist is honestly gold." },
  { id: "sa-21", name: "Comfort Adeleke", date: "2025-01-21", rating: 5, tag: "Study Abroad · Germany", text: "Never thought I'd study in Munich without speaking German fluently. Ruhe found me the right English-taught program." },
  { id: "sa-22", name: "Ibrahim Lawal", date: "2024-08-06", rating: 5, tag: "Money Transfer", text: "Transferred funds for my accommodation deposit without the usual exchange rate wahala." },
  { id: "sa-23", name: "Gloria Okonji", date: "2024-12-30", rating: 4, tag: "Study Abroad · Australia", text: "Monash program matched my career goals perfectly. Communication could be a bit faster during peak season." },
  { id: "sa-24", name: "Sani Abubakar", date: "2025-02-16", rating: 5, tag: "Permanent Residency · Canada", text: "PR approval letter came six months after starting with Ruhe. Still can't believe it." },
  { id: "sa-25", name: "Chinyere Mba", date: "2024-11-11", rating: 5, tag: "IELTS Prep", text: "The tutors focus on your specific weak areas, not a generic class for everyone." },
  { id: "sa-26", name: "Tijani Abdulkareem", date: "2025-03-07", rating: 5, tag: "Study Abroad · UK", text: "Coventry offer, visa approval, and accommodation, all coordinated by one team. Zero stress." },
  { id: "sa-27", name: "Nneka Obiora", date: "2024-10-24", rating: 5, tag: "Visa Processing · USA", text: "They prepped me for questions I didn't even think to ask. Passed my visa interview confidently." },
  { id: "sa-28", name: "Habib Yusuf", date: "2025-04-01", rating: 5, tag: "Study Abroad · Ireland", text: "Trinity College Dublin admission secured, and my consultant even reviewed my accommodation contract for red flags." },
  { id: "sa-29", name: "Titilayo Bankole", date: "2024-09-19", rating: 5, tag: "Accommodation · Germany", text: "Found a shared apartment close to campus in Munich before my flight was even booked." },
  { id: "sa-30", name: "Ismail Danladi", date: "2025-02-20", rating: 5, tag: "Study Abroad · Canada", text: "From zero clue about Canadian universities to an admission letter from Toronto in three months." },
];