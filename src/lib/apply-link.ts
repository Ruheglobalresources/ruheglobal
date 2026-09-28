export function applyHref(schoolSlug: string, courseId?: string) {
  const params = new URLSearchParams({ school: schoolSlug });
  if (courseId) params.set("course", courseId);
  return `/dashboard/applications/new?${params.toString()}`;
}