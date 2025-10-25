import jwt from "jsonwebtoken";

export function authRequired(req, res, next) {
  try {
    const hdr = req.headers.authorization || "";
    const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Missing token" });

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      // Fail loudly in dev so it's obvious
      return res.status(500).json({ error: "Server misconfigured: JWT_SECRET missing" });
    }

    const payload = jwt.verify(token, secret);
    // Your login sets: { sub: user.id, role, email }
    req.user = { id: payload.sub, role: payload.role, email: payload.email };
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

//
// export async function requireCourseOwner(req, _res, next) {
//   try {
//     const courseId = Number(req.params.id);
//     const course = getCourseById(courseId);
//     if (!course) throw new NotFoundError("Course not found");
//     // Allow if teacher owns OR user is Admin (if you have such a role)
//     const isOwner = req.user?.role === "Teacher" && course.teacherId === req.user.id;
//     const isAdmin = req.user?.role === "Admin" || req.user?.role === "SuperAdmin";
//     if (!isOwner && !isAdmin) throw new ForbiddenError("Not allowed");
//     req.course = course;
//     next();
//   } catch (e) {
//     next(e);
//   }
// }
