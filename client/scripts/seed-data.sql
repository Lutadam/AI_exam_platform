-- Seed data for exam management system

-- Insert subjects
INSERT INTO subjects (name, code, description) VALUES
('Computer Science', 'CS101', 'Introduction to Computer Science fundamentals'),
('Data Structures', 'CS201', 'Advanced data structures and algorithms'),
('Database Systems', 'CS301', 'Database design and management'),
('Web Development', 'CS401', 'Modern web development technologies');

-- Insert users (lecturers and students)
INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES
('sarah.johnson@university.edu', '$2b$10$example_hash_1', 'Sarah', 'Johnson', 'lecturer'),
('john.smith@student.edu', '$2b$10$example_hash_2', 'John', 'Smith', 'student'),
('emily.davis@student.edu', '$2b$10$example_hash_3', 'Emily', 'Davis', 'student'),
('michael.brown@student.edu', '$2b$10$example_hash_4', 'Michael', 'Brown', 'student'),
('lisa.wilson@student.edu', '$2b$10$example_hash_5', 'Lisa', 'Wilson', 'student');

-- Insert enrollments
INSERT INTO enrollments (student_id, subject_id) VALUES
(2, 1), (2, 2), (2, 3), (2, 4),  -- John Smith enrolled in all subjects
(3, 1), (3, 2), (3, 4),          -- Emily Davis enrolled in CS, DS, Web Dev
(4, 1), (4, 3),                  -- Michael Brown enrolled in CS, Database
(5, 2), (5, 3), (5, 4);          -- Lisa Wilson enrolled in DS, Database, Web Dev

-- Insert sample exams
INSERT INTO exams (title, description, subject_id, lecturer_id, duration_minutes, status, max_attempts) VALUES
('Data Structures Midterm', 'Midterm examination covering arrays, linked lists, stacks, and queues', 2, 1, 90, 'active', 1),
('Database Systems Final', 'Comprehensive final exam on database design and SQL', 3, 1, 120, 'draft', 1),
('Web Development Quiz', 'Quick assessment on HTML, CSS, and JavaScript basics', 4, 1, 45, 'completed', 2);

-- Insert sample questions for Data Structures Midterm (exam_id = 1)
INSERT INTO questions (exam_id, question_text, question_type, points, question_order) VALUES
(1, 'What is the time complexity of searching in a balanced binary search tree?', 'multiple-choice', 2, 1),
(1, 'Which data structure uses LIFO (Last In, First Out) principle?', 'multiple-choice', 2, 2),
(1, 'A hash table can have O(1) average case time complexity for insertion and search operations.', 'true-false', 1, 3),
(1, 'Explain the difference between a stack and a queue data structure.', 'short-answer', 5, 4),
(1, 'What is the main advantage of using a linked list over an array?', 'multiple-choice', 2, 5);

-- Insert options for multiple choice questions
-- Question 1 options
INSERT INTO question_options (question_id, option_text, is_correct, option_order) VALUES
(1, 'O(1)', FALSE, 1),
(1, 'O(log n)', TRUE, 2),
(1, 'O(n)', FALSE, 3),
(1, 'O(n log n)', FALSE, 4);

-- Question 2 options
INSERT INTO question_options (question_id, option_text, is_correct, option_order) VALUES
(2, 'Queue', FALSE, 1),
(2, 'Stack', TRUE, 2),
(2, 'Array', FALSE, 3),
(2, 'Linked List', FALSE, 4);

-- Question 5 options
INSERT INTO question_options (question_id, option_text, is_correct, option_order) VALUES
(5, 'Faster access time', FALSE, 1),
(5, 'Dynamic size allocation', TRUE, 2),
(5, 'Better memory locality', FALSE, 3),
(5, 'Simpler implementation', FALSE, 4);

-- Insert sample questions for Web Development Quiz (exam_id = 3)
INSERT INTO questions (exam_id, question_text, question_type, points, question_order) VALUES
(3, 'HTML stands for HyperText Markup Language.', 'true-false', 1, 1),
(3, 'Which CSS property is used to change the text color?', 'multiple-choice', 1, 2),
(3, 'JavaScript is a compiled programming language.', 'true-false', 1, 3);

-- Insert options for Web Development Quiz
INSERT INTO question_options (question_id, option_text, is_correct, option_order) VALUES
(7, 'font-color', FALSE, 1),
(7, 'text-color', FALSE, 2),
(7, 'color', TRUE, 3),
(7, 'foreground-color', FALSE, 4);

-- Update total points for exams
UPDATE exams SET total_points = (
    SELECT SUM(points) FROM questions WHERE exam_id = exams.id
) WHERE id IN (1, 3);

-- Insert sample exam attempt (completed exam)
INSERT INTO exam_attempts (exam_id, student_id, attempt_number, start_time, end_time, total_score, status) VALUES
(3, 2, 1, '2024-01-15 10:00:00', '2024-01-15 10:30:00', 2.5, 'completed');

-- Insert sample answers for the completed attempt
INSERT INTO student_answers (attempt_id, question_id, answer_text, selected_option_id, points_earned) VALUES
(1, 6, 'true', NULL, 1.0),  -- True/False question
(1, 7, NULL, 9, 1.0),       -- Multiple choice question (correct answer)
(1, 8, 'false', NULL, 0.5); -- True/False question (partial credit for demonstration)
