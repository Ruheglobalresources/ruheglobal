// The "Proceed to apply" link. It always opens /portal/applications/new, which checks the
// login first (sending signed out visitors to login and back here), then finds the school
// application and opens it for this school or institution and course.
//
// type: "institution" for pages under /institutions, "school" for pages under /schools.
// They are different tables with different ids, so the link has to say which one it means.
export function applyHref(slug: string, courseId?: string, type: "institution" | "school" = "institution") {
  const params = new URLSearchParams({ type, target: slug });
  if (courseId) params.set("course", courseId);
  return `/portal/applications/new?${params.toString()}`;
}