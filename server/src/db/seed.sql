BEGIN TRANSACTION;

INSERT INTO feedback (name, email, message) VALUES
    ('Test User', 'test@example.com', 'Just testing the form.'),
    ('Ava Martin', 'ava.martin@example.com', 'Loving the clean layout—could you add search?'),
    ('Marc-Andre Côté', 'marcandre.cote@email.ca', 'Le site est super ! Merci 😊'),
    ('Jane Admin', 'jane@company.com', 'Bug: the submit button looks disabled on mobile.'),
    ('Sam O''Neil', 'sam.oneil@foo.io', 'Dark mode please! Also, export to CSV.'),
    ('Priya K', 'priya.k@domain.com', 'Accessibility note: form labels need the "for" attribute matching input ids.'),
    ('Liam Chen', 'liam.chen@mail.com', 'Great! But I did not receive a confirmation email.'),
    ('Fatima Noor', 'fatima.noor@sample.org', 'Feature request: allow editing or deleting my feedback.'),
    ('Diego Alvarez', 'diego@alvarez.mx', 'When message length > 500 chars, the API returns 400.'),
    ('Zoë Dupont', 'zoe.dupont@example.fr', 'Accent characters render fine? éàù — looks good.'),
    ('Omar Haddad', 'omar.haddad@company.com', 'Multi-line test:\\nLine 1\\nLine 2\\nLine 3'),
    ('Élodie Tremblay', 'elodie.tremblay@qc.ca', 'Ça marche sur Safari iOS 16.6 ?'),
    ('Arun Sharma', 'arun.sharma@work.net', 'UI feedback: the textarea resizes oddly on Windows.'),
    ('Kaitlyn Yu', 'kaitlyn.yu@school.edu', 'Performance feels slow on first load; maybe lazy-load the admin table?'),
    ('Nora Smith', 'nora.smith@demo.com', 'Security: please add basic rate limiting on the POST endpoint.'),
    ('Roberto D''Angelo', 'roberto.dangelo@it.it', 'Italian user here—works fine 👍'),
    ('Emoji Tester', 'emoji@test.com', 'Emoji test 🌿🌱💚'),
    ('Edge Case', 'edge@case.io', 'DROP TABLE feedback; -- should be treated as text, not SQL'),
    ('Long Message', 'long@msg.com','This is a longer message to simulate real feedback. I tried submitting a note from my phone and the page refreshed without a toast. Also, it would be helpful to keep the name/email values in the form after an error so I don''t have to retype them.' );

COMMIT;
