// 1) Base URL from Vite env
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";

/** ***************** users ****************** */
export async function signup(data) {
    const res = await fetch(`${API_BASE}/api/auth/signup`, {
        // <-- add /api
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data),
    });

    const body = await res.json().catch(() => ({})); // <-- parse once

    if (!res.ok) {
        const msg = body?.error || body?.message || `HTTP ${res.status}`;
        throw new Error(msg); // <-- use parsed error
    }

    return body; // <-- return parsed JSON
}

export async function login(data) {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
        // <-- add /api
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data),
    });

    const body = await res.json().catch(() => ({})); // <-- parse once

    if (!res.ok) {
        throw new Error(body?.error || body?.message || `HTTP ${res.status}`);
    }

    return body;
}

/** ***************** end users ****************** */

/** ***************** courses ****************** */

export async function listCourses(opts = {}) {
    const {
        signal,
        mine = false,
        token,
        // pagination
        limit,
        offset, // preferred
        page, // legacy: will be converted to offset
    } = opts;

    // derive offset from page if provided (0-based pages)
    const effLimit = Number.isFinite(limit) ? Number(limit) : undefined;
    let effOffset = Number.isFinite(offset) ? Number(offset) : undefined;

    if (!Number.isFinite(effOffset) && Number.isFinite(page)) {
        const p = Math.max(0, Number(page));
        effOffset = Number.isFinite(effLimit) ? p * effLimit : p * 10; // default 10 if limit missing
    }

    const qs = new URLSearchParams();
    if (mine) qs.set("mine", "true"); // filter by logged-in teacher
    if (Number.isFinite(effLimit)) qs.set("limit", String(effLimit));
    if (Number.isFinite(effOffset)) qs.set("offset", String(effOffset));

    const url = `${API_BASE}/api/courses${qs.toString() ? `?${qs}` : ""}`;

    const res = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...(token ? {Authorization: `Bearer ${token}`} : {}),
        },
        signal,
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const msg = body?.message || `Failed to load courses (${res.status})`;
        throw new Error(msg);
    }

    return res.json(); // expect: { items, total, limit, offset } OR []
}

export async function viewCourse({id, token, signal}) {
    const res = await fetch(`${API_BASE}/api/courses/${id}`, {
        method: "GET",
        headers: {"Content-Type": "application/json", Authorization: `Bearer ${token}`},
        signal,
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const msg = body?.message || `Failed to load course (${res.status})`;
        throw new Error(msg);
    }
    return res.json(); // expect: {id, title, description, teacherId, ...}
}

export async function createCourse(data, token) {
    const res = await fetch(`${API_BASE}/api/courses`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? {Authorization: `Bearer ${token}`} : {}),
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Create failed: ${res.status}`);
    return res.json();
}

export async function updateCourse(id, data, token) {
    const res = await fetch(`${API_BASE}/api/courses/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...(token ? {Authorization: `Bearer ${token}`} : {}),
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Update failed: ${res.status}`);
    return res.json();
}

export async function getCourseById(id, token) {
    const res = await fetch(`${API_BASE}/api/courses/${id}`, {
        headers: {
            ...(token ? {Authorization: `Bearer ${token}`} : {}),
        },
    });
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    return res.json();
}

export async function deleteCourse(id, token) {
    const res = await fetch(`${API_BASE}/api/courses/${id}`, {
        method: "DELETE",
        headers: {
            ...(token ? {Authorization: `Bearer ${token}`} : {}),
        },
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(`Delete failed: ${res.status} ${err.error ?? ""}`.trim());
    }
    return res.json();
}

export async function getCoursesCount({token, signal, teacherId, mine} = {}) {
    const qs = new URLSearchParams();
    if (teacherId != null) qs.set("teacherId", String(teacherId));
    if (mine) qs.set("mine", "true");

    const res = await fetch(`${API_BASE}/api/courses/count${qs.toString() ? `?${qs}` : ""}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        signal,
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || `Failed to load course count (${res.status})`);
    }
    return res.json(); // { total }
}

/** ***************** end courses ****************** */

/** ***************** quizzes ****************** */

export async function updateQuiz(id, payload, token, signal) {
    const res = await fetch(`${API_BASE}/api/quizzes/${id}`, {
        method: "PATCH", // or "PUT"
        headers: {"Content-Type": "application/json", Authorization: `Bearer ${token}`},
        body: JSON.stringify(payload),
        signal,
    });

    const text = await res.text();
    if (!res.ok) throw new Error(text ? JSON.parse(text).message : `Update failed (${res.status})`);
    return text ? JSON.parse(text) : null;
}

export async function createQuiz(payload, token, signal) {
    const res = await fetch(`${API_BASE}/api/quizzes`, {
        method: "POST",
        headers: {"Content-Type": "application/json", Authorization: `Bearer ${token}`},
        body: JSON.stringify(payload),
        signal,
    });
    const text = await res.text();
    if (!res.ok) throw new Error(text ? JSON.parse(text).message : `Create failed (${res.status})`);
    return text ? JSON.parse(text) : null;
}

// READ
export async function getQuiz(id, token) {
    const res = await fetch(`${API_BASE}/api/quizzes/${id}`, {
        method: "GET",
        headers: {
            ...(token ? {Authorization: `Bearer ${token}`} : {}),
        },
    });
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    return res.json();
}

export async function getQuizDetails({quizId, token, signal}) {
    const res = await fetch(`${API_BASE}/api/quizzes/${quizId}`, {
        headers: {Authorization: `Bearer ${token}`},
        signal,
    });
    if (!res.ok) throw new Error(`Failed to load quiz ${quizId} (${res.status})`);
    return await res.json();
}

// DELETE
export async function deleteQuiz(id, token) {
    const res = await fetch(`${API_BASE}/api/quizzes/${id}`, {
        method: "DELETE",
        headers: {
            ...(token ? {Authorization: `Bearer ${token}`} : {}),
        },
    });
    if (res.status === 204) return {ok: true}; // your server may return no body
    if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
    return res.json(); // in case server returns { ok: true } or similar
}

/** ***************** end quizzes ****************** */

/** ***************** student area ******************** */
export async function enrollInCourse({courseId, token, signal}) {
    const res = await fetch(`${API_BASE}/api/progress/enroll`, {
        method: "POST",
        headers: {"Content-Type": "application/json", Authorization: `Bearer ${token}`},
        body: JSON.stringify({courseId}),
        signal,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw data || {message: "Enroll failed"};
    return data;
}

export async function getEnrollment({courseId, token, signal}) {
    const res = await fetch(`${API_BASE}/api/progress/enrollment/${courseId}`, {
        headers: {"Content-Type": "application/json", Authorization: `Bearer ${token}`},
        signal,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw data || {message: "Not enrolled"};
    return data?.data ?? data;
}

export async function updateEnrollment({courseId, token, body, signal}) {
    const res = await fetch(`${API_BASE}/api/progress/enrollment/${courseId}`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json", Authorization: `Bearer ${token}`},
        body: JSON.stringify(body),
        signal,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw data || {message: "Update failed"};
    return data?.data ?? data;
}

export async function listMyCourses({token, signal, limit = 50, offset = 0}) {
    const res = await fetch(`${API_BASE}/api/progress/my-courses?limit=${limit}&offset=${offset}`, {
        headers: {"Content-Type": "application/json", Authorization: `Bearer ${token}`},
        signal,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw data || {message: "Failed to list enrollments"};
    return data?.items ?? data ?? [];
}

export async function listAllCourses({token, signal, limit = 50, offset = 0}) {
    const res = await fetch(`${API_BASE}/api/progress/courses?limit=${limit}&offset=${offset}`, {
        headers: {"Content-Type": "application/json", Authorization: `Bearer ${token}`},
        signal,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw data || {message: "Failed to list enrollments"};
    return data?.items ?? data ?? [];
}

// Quizzes per course
export async function listQuizzesForCourse({courseId, token, signal}) {
    const res = await fetch(`${API_BASE}/api/courses/${courseId}/quizzes?limit=20&offset=0`, {
        headers: {"Content-Type": "application/json", Authorization: `Bearer ${token}`},
        signal,
    });
    const raw = await res.json().catch(() => null);
    if (!res.ok) throw raw || {message: "Failed to list quizzes"};
    const items = (raw?.items ?? raw ?? []).map((q) => ({
        ...q,
        options: Array.isArray(q.options) ? q.options : safeParseArray(q.options),
    }));
    return items;
}

// never throws
function safeParseArray(x) {
    try {
        const v = typeof x === "string" ? JSON.parse(x) : x;
        return Array.isArray(v) ? v : [];
    } catch {
        return [];
    }
}

export async function listCourseQuizzes({id, token, signal}) {
    const res = await fetch(`${API_BASE}/api/courses/${id}/quizzes`, {
        headers: {"Content-Type": "application/json", Authorization: `Bearer ${token}`},
        signal,
    });
    if (!res.ok) throw new Error(`Failed to load quizzes`);
    return res.json();
}

export async function submitCourseQuiz({courseId, token, body}) {
    const res = await fetch(`${API_BASE}/api/courses/${courseId}/quizzes/submit`, {
        method: "POST",
        headers: {"Content-Type": "application/json", Authorization: `Bearer ${token}`},
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Failed to submit quiz`);
    }
    return res.json();
}

export async function startCourse({id, token, signal}) {
    const res = await fetch(`${API_BASE}/api/courses/${id}/start`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        signal,
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const msg = body?.message || `Failed to start course (${res.status})`;
        throw new Error(msg);
    }

    return res.json(); // returns progress object
}

/** *******************  end student area  ********************** */

/** *********************** Profile **************************/
const j = async (res) => {
    if (!res.ok) throw new Error(await res.text());
    return res.json();
};

export const getMe = ({token, signal}) =>
    fetch(`${API_BASE}/api/me`, {headers: {Authorization: `Bearer ${token}`}, signal}).then(j);

export const updateMyName = ({token, name, signal}) =>
    fetch(`${API_BASE}/api/me`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json", Authorization: `Bearer ${token}`},
        body: JSON.stringify({name}),
        signal,
    }).then(j);

export const changeMyPassword = ({token, currentPassword, newPassword, signal}) =>
    fetch(`${API_BASE}/api/me/password`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json", Authorization: `Bearer ${token}`},
        body: JSON.stringify({currentPassword, newPassword}),
        signal,
    }).then(j);

export const mySummary = ({token, signal}) =>
    fetch(`${API_BASE}/api/me/summary`, {
        headers: {Authorization: `Bearer ${token}`},
        signal,
    }).then(j);

export const myCourses = ({token, limit = 12, offset = 0, signal}) => {
    const url = new URL(`${API_BASE}/api/me/courses`);
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("offset", String(offset));
    return fetch(url, {headers: {Authorization: `Bearer ${token}`}, signal}).then(j);
};
/** *********************** End Profile **************************/

/* ******************* Teacher and Students **************************/
export async function listTeacherStudents({token, signal, limit = 20, offset = 0}) {
    const url = new URL(`${API_BASE}/api/teacher/students`);
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("offset", String(offset));

    const res = await fetch(url, {headers: {Authorization: `Bearer ${token}`}, signal});
    if (!res.ok) throw new Error(`Failed to list students (${res.status})`);
    return res.json();
}

export async function viewTeacherStudent({studentId, token, signal}) {
    const res = await fetch(`${API_BASE}/api/teacher/students/${studentId}`, {
        headers: {Authorization: `Bearer ${token}`},
        signal,
    });
    if (!res.ok) throw new Error(`Failed to fetch student (${res.status})`);
    return res.json();
}

/* ******************* End Teacher and Students **************************/
//
// export async function startCourse({ courseId, token, signal }) {
//   const res = await fetch(`${API_BASE}/api/courses/${courseId}/start`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
//     signal,
//   });
//   if (!res.ok) {
//     const body = await res.json().catch(() => ({}));
//     throw new Error(body?.message || "Failed to start course");
//   }
//   return res.json(); // {status:'in_progress', ...}
// }
