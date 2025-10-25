-- seed.sql
-- Matches user's scrypt scheme (saltHex as UTF-8 string). Password = email.
-- Assumes tables already exist per the provided schema.
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

BEGIN TRANSACTION;

-- USERS
INSERT INTO users (id, name, email, passwordHash, role)
VALUES (1, 'Alice Martin', 'alice.martin@example.com',
        '0d7228012e1f166c4d120d221b26938a:dd44312d772513f864decd781f19b3adfbcfb184e5030614a5d97a8a04e3502f12a3a166f25a697e0c0b0acc4809b2804b9926fbede423948655a185771a0f9e',
        'Teacher'),
       (2, 'Bruno Chen', 'bruno.chen@example.com',
        '6a9b22eb6afdd2ab53736c06ac29fc3e:d46123223fdf591affab75dfb759aaf27fe987c1649f0aeb875bc159abd15af6602325c5d21f28ca29fa84ec4ddf3134aa144cf2b2fbb69dee3fc29086973f33',
        'Teacher'),
       (3, 'Carmen Singh', 'carmen.singh@example.com',
        'b686e3158b64b3744fc9baa29657a2ab:ad82c437841f0a17ec06dbf5bed7ce007f71dc03299c3bdb5fb9825d1ef8e1a32e45a118d35d66daa1c16dd7c5ff0e46712075401ced7b74f2e0f7980b54e5ea',
        'Teacher'),
       (10, 'David Lee', 'david.lee@example.com',
        'd36fd508e79de92b553d8d7c44e28ff0:bf9f8f19ca3096e35f15984d255f5d22448f04b6b4c7dc05a4c2f6e2b275a7d9bb50455f02410a241265eac3c2029d94e4558b444bf044165ac7e1e6225cdf70',
        'Student'),
       (11, 'Eva Rodriguez', 'eva.rodriguez@example.com',
        '8b59fe21797dea9372c2286c77377232:212f988dba144c2dad48ba0849220f61bd9d66afa9a06bb6c99e18f5d2b9896879d186a9e7f036eb204420e7abea4523d99479e1ecb0bd6f2a7246c707431900',
        'Student'),
       (12, 'Farah Ben Ali', 'farah.benali@example.com',
        'd37edccae00fe4069317522c6be9f783:5a409b78a3a69c97c6ab081510f3bb3a309e755c007bcab135529958d2332a4be3477e79e8b556174e887c4a022785258b00dbf6e2a64b916a111c46d1e05fc2',
        'Student'),
       (13, 'Gilles Tremblay', 'gilles.tremblay@example.com',
        '559664b65228b4a33ba7f21343c72357:38c019d890b366d5053ceceb6562b59b5b45b5e5f4a52104070f91a1fa91ee05edc0d27924878fdc5ba7cb1849fc973b7d98b8d6139d50e165e849254f212476',
        'Student');

-- COURSES
INSERT INTO courses (id, teacherId, title, description)
VALUES (101, 1, 'Intro to Databases', 'Relational concepts, SQL basics, and normalization.'),
       (102, 2, 'Web Development I', 'Fundamentals of HTML, CSS, and client-server basics.'),
       (103, 3, 'JavaScript Essentials', 'Core JS syntax, async patterns, and modules.');

-- QUIZZES
INSERT INTO quizzes (id, courseId, question, options, correctAnswer)
VALUES (1001, 101, 'Which SQL clause filters rows?', '["SELECT","WHERE","GROUP BY","ORDER BY"]', 1),
       (1002, 101, 'Which normal form removes partial dependency?', '["1NF","2NF","3NF","BCNF"]', 1),
       (1003, 101, 'Primary key must be...',
        '["Unique and NOT NULL","Only unique","Only NOT NULL","Either unique or NOT NULL"]', 0);

INSERT INTO quizzes (id, courseId, question, options, correctAnswer)
VALUES (2001, 102, 'Which tag defines a hyperlink?', '["<div>","<a>","<span>","<p>"]', 1),
       (2002, 102, 'Which HTTP method is typically idempotent?', '["POST","PATCH","PUT","GET"]', 3),
       (2003, 102, 'CSS stands for...',
        '["Cascading Style Sheets","Computer Style Sheets","Creative Style System","Coded Style Sheets"]', 0);

INSERT INTO quizzes (id, courseId, question, options, correctAnswer)
VALUES (3001, 103, 'Which keyword declares a block-scoped variable?', '["var","let","function","class"]', 1),
       (3002, 103, 'Promises handle...', '["Styling","DOM layout","Asynchronous operations","HTML parsing"]', 2),
       (3003, 103, 'typeof null returns...', '["null","object","undefined","number"]', 1);

-- PROGRESS
INSERT INTO progress (studentId, courseId, status, score)
VALUES (10, 101, 'enrolled', NULL),
       (11, 101, 'in_progress', 72.5),
       (12, 101, 'completed', 88.0);

INSERT INTO progress (studentId, courseId, status, score)
VALUES (10, 102, 'in_progress', 64.0),
       (12, 102, 'enrolled', NULL),
       (13, 102, 'completed', 91.0);

INSERT INTO progress (studentId, courseId, status, score)
VALUES (11, 103, 'enrolled', NULL),
       (12, 103, 'in_progress', 70.0),
       (13, 103, 'completed', 95.0);

COMMIT;
