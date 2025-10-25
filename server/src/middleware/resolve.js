export function resolveTeacher(req, res, next) {
  // only act when ?mine=true is present
  if (req.query.mine === "true") {
    // must be authenticated and a Teacher (or Admin if you want to allow it)
    if (!req.user) {
      return res.status(401).json({ code: "UNAUTHORIZED", message: "Missing or invalid token" });
    }
    if (req.user.role !== "Teacher" /* && req.user.role !== "Admin" */) {
      return res
        .status(403)
        .json({ code: "FORBIDDEN", message: "Only teachers can use mine=true" });
    }
    // inject teacherId into query for the handler/service/dao to use
    req.query.teacherId = String(req.user.id);
  }
  // clean up param to avoid leaking to downstream logs if you want
  delete req.query.mine;
  next();
}

export function requireRole(...allowed) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ code: "UNAUTHORIZED", message: "Missing or invalid token" });
    }
    // NB: Your DB uses role casing 'Student' / 'Teacher'
    if (!allowed.includes(req.user.role)) {
      return res
        .status(403)
        .json({ code: "FORBIDDEN", message: `Requires role: ${allowed.join(", ")}` });
    }
    next();
  };
}
