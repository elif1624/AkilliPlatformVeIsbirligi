-- Kullanıcılar tablosu
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- 'student', 'mentor', 'admin'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mentorlar tablosu
CREATE TABLE mentors (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(100) NOT NULL, -- 'Prof. Dr.', 'Doç. Dr.', 'Dr.' vb.
    department VARCHAR(255) NOT NULL,
    university VARCHAR(255) NOT NULL,
    office_location VARCHAR(100),
    expertise_area TEXT,
    projects_count INTEGER DEFAULT 0,
    students_count INTEGER DEFAULT 0,
    completed_projects_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projeler tablosu
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    mentor_id INTEGER REFERENCES mentors(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    requirements TEXT,
    max_students INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'completed', 'cancelled'
    tags TEXT,
    location TEXT,
    progress INT DEFAULT 0,
    views INT DEFAULT 0,
    favorites INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Başvurular tablosu
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id),
    student_id INTEGER REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
    motivation_le TEXT,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, student_id) -- Bir öğrenci bir projeye sadece bir kez başvurabilir
);

-- Örnek veriler
INSERT INTO users (email, password_hash, name, role) VALUES
('ayse.yilmaz@example.com', 'hash1', 'Ayşe Yılmaz', 'mentor'),
('mehmet.demir@example.com', 'hash2', 'Mehmet Demir', 'mentor'),
('zeynep.kaya@example.com', 'hash3', 'Zeynep Kaya', 'mentor'),
('ahmet.yilmaz@example.com', 'hash4', 'Ahmet Yılmaz', 'mentor'),
('fatma.demir@example.com', 'hash5', 'Fatma Demir', 'mentor'),
('can.kaya@example.com', 'hash6', 'Can Kaya', 'mentor'),
('deniz.arslan@example.com', 'hash7', 'Deniz Arslan', 'mentor'),
('elif.celik@example.com', 'hash8', 'Elif Çelik', 'mentor'),
('burak.ozturk@example.com', 'hash9', 'Burak Öztürk', 'mentor'),
('selin.yildiz@example.com', 'hash10', 'Selin Yıldız', 'student'),
('mert.aydin@example.com', 'hash11', 'Mert Aydın', 'student'),
('zehra.koc@example.com', 'hash12', 'Zehra Koç', 'student');

INSERT INTO mentors (user_id, title, department, university, office_location, expertise_area, projects_count, students_count, completed_projects_count) VALUES
(1, 'Prof. Dr.', 'Bilgisayar Mühendisliği', 'Fırat Üniversitesi', 'A-101', 'Yapay Zeka, Veri Bilimi, Makine Öğrenmesi', 5, 8, 12),
(2, 'Doç. Dr.', 'Yazılım Mühendisliği', 'Fırat Üniversitesi', 'B-203', 'Web Geliştirme, Mobil Uygulama, Veritabanı Sistemleri', 3, 5, 7),
(3, 'Dr.', 'Bilgisayar Mühendisliği', 'Fırat Üniversitesi', 'C-305', 'Siber Güvenlik, Ağ Sistemleri, Blockchain', 4, 6, 8),
(4, 'Prof. Dr.', 'Elektrik-Elektronik Mühendisliği', 'Fırat Üniversitesi', 'D-101', 'Gömülü Sistemler, IoT, Robotik', 5, 8, 12),
(5, 'Doç. Dr.', 'Bilgisayar Mühendisliği', 'Fırat Üniversitesi', 'E-202', 'Yapay Zeka, Derin Öğrenme, Görüntü İşleme', 3, 5, 7),
(6, 'Dr. Öğr. Üyesi', 'Yazılım Mühendisliği', 'Fırat Üniversitesi', 'F-303', 'Mobil Uygulama, React Native, Flutter', 4, 6, 8),
(7, 'Prof. Dr.', 'Bilgisayar Mühendisliği', 'Fırat Üniversitesi', 'G-404', 'Veri Madenciliği, Büyük Veri, NoSQL', 6, 10, 15),
(8, 'Dr. Öğr. Üyesi', 'Elektrik-Elektronik Mühendisliği', 'Fırat Üniversitesi', 'H-505', 'FPGA, VHDL, Mikroişlemciler', 2, 4, 6),
(9, 'Doç. Dr.', 'Yazılım Mühendisliği', 'Fırat Üniversitesi', 'I-606', 'DevOps, Cloud Computing, Kubernetes', 4, 7, 9);

INSERT INTO projects (mentor_id, title, description, requirements, max_students, start_date, end_date, status, tags, location) VALUES
(1, 'Makine Öğrenmesi Projesi', 'Görüntü işleme ve nesne tanıma üzerine bir proje.', 'Python, TensorFlow, OpenCV', 3, '2024-04-01', '2024-09-30', 'active', 'AI,Healthcare,ComputerVision', 'Lab-A101'),
(2, 'Veri Analizi Araştırması', 'Büyük veri setleri üzerinde analiz ve görselleştirme.', 'R, Python, SQL', 2, '2024-05-01', '2024-08-31', 'active', 'DataAnalysis,Python,SQL', 'Lab-B203'),
(3, 'Blockchain Uygulaması', 'Akıllı kontratlar ile güvenli işlem sistemi.', 'Solidity, JavaScript, Web3.js', 4, '2024-06-01', '2024-12-31', 'active', 'Blockchain,Solidity,JavaScript', 'Lab-C305'),
(4, 'IoT Tabanlı Akıllı Ev Sistemi', 'Ev otomasyonu için IoT cihazları ve mobil uygulama geliştirme.', 'Arduino, React Native, MQTT', 3, '2024-05-01', '2024-10-31', 'active', 'IoT,ReactNative,MQTT', 'Lab-D101'),
(5, 'Derin Öğrenme ile Hastalık Teşhisi', 'Medikal görüntülerden hastalık tespiti yapan AI modeli.', 'Python, TensorFlow, OpenCV', 2, '2024-06-01', '2024-11-30', 'active', 'AI,Healthcare,ComputerVision', 'Lab-E202'),
(6, 'Cross-Platform Mobil Uygulama', 'Flutter ile çapraz platform e-ticaret uygulaması.', 'Flutter, Dart, Firebase', 4, '2024-07-01', '2024-12-31', 'active', 'Flutter,Dart,Firebase', 'Lab-F303'),
(7, 'NoSQL Veritabanı Yönetim Sistemi', 'Dağıtık NoSQL veritabanı tasarımı ve implementasyonu.', 'MongoDB, Node.js, Docker', 3, '2024-08-01', '2025-01-31', 'active', 'NoSQL,MongoDB,Node.js', 'Lab-G404'),
(8, 'FPGA Tabanlı Görüntü İşleme', 'Gerçek zamanlı görüntü işleme için FPGA implementasyonu.', 'VHDL, Verilog, MATLAB', 2, '2024-09-01', '2025-02-28', 'active', 'FPGA,VHDL,MATLAB', 'Lab-H505'),
(9, 'Mikroservis Mimarisi', 'Kubernetes üzerinde mikroservis tabanlı uygulama geliştirme.', 'Docker, Kubernetes, Go', 4, '2024-10-01', '2025-03-31', 'active', 'Docker,Kubernetes,Go', 'Lab-I606');

INSERT INTO applications (project_id, student_id, status, motivation_le, message) VALUES
(1, 10, 'pending', 'Bu projede makine öğrenmesi ve görüntü işleme konularında deneyim kazanmak istiyorum.', 'Projenizde yer almak için çok heyecanlıyım.'),
(2, 11, 'accepted', 'Veri analizi konusunda uzmanlaşmak istiyorum ve bu proje tam olarak aradığım fırsat.', 'Mikroservis mimarisi konusunda çalışmak istiyorum.'),
(3, 12, 'pending', 'Blockchain teknolojilerine olan ilgim nedeniyle bu projede yer almak istiyorum.', 'Projenizde yer almak için çok heyecanlıyım.'),
(4, 10, 'accepted', 'IoT sistemleri konusunda pratik deneyim kazanmak istiyorum.', 'Projenizde yer almak için çok heyecanlıyım.'),
(5, 11, 'pending', 'Yapay zeka ve sağlık teknolojileri alanında kariyer hedefliyorum.', 'Projenizde yer almak için çok heyecanlıyım.'),
(6, 12, 'pending', 'Mobil uygulama geliştirme konusunda kendimi geliştirmek istiyorum.', 'Projenizde yer almak için çok heyecanlıyım.');

-- Örnek Users verileri (auth.users'dan gelen UUID'leri kullanmalısınız)
INSERT INTO public.users (id, email, name, surname, role, department, avatar_url) VALUES
('d7bed82f-7159-4da5-9d81-15050c0b7d3a', 'ayse.yilmaz@example.com', 'Ayşe', 'Yılmaz', 'mentor', 'Bilgisayar Mühendisliği', 'https://avatars.example.com/ayse.jpg'),
('b5f2d8c1-3e5a-4b1d-9c2f-8b9d6e4f3a2b', 'mehmet.demir@example.com', 'Mehmet', 'Demir', 'mentor', 'Yazılım Mühendisliği', 'https://avatars.example.com/mehmet.jpg'),
('a1b2c3d4-e5f6-4a5b-9c8d-7e6f5a4b3c2d', 'ali.yildiz@example.com', 'Ali', 'Yıldız', 'student', 'Bilgisayar Mühendisliği', 'https://avatars.example.com/ali.jpg'),
('f9e8d7c6-b5a4-3c2b-1d9e-8f7g6h5j4k3l', 'zeynep.kaya@example.com', 'Zeynep', 'Kaya', 'student', 'Yazılım Mühendisliği', 'https://avatars.example.com/zeynep.jpg');

-- Örnek Mentors verileri
INSERT INTO public.mentors (id, title, department, expertise_area, office_location) VALUES
('d7bed82f-7159-4da5-9d81-15050c0b7d3a', 'Prof. Dr.', 'Bilgisayar Mühendisliği', 'Yapay Zeka, Veri Bilimi, Makine Öğrenmesi', 'A-101'),
('b5f2d8c1-3e5a-4b1d-9c2f-8b9d6e4f3a2b', 'Doç. Dr.', 'Yazılım Mühendisliği', 'Web Geliştirme, Mobil Uygulama, Veritabanı Sistemleri', 'B-203');

-- Örnek Projects verileri
INSERT INTO public.projects (id, title, description, mentor_id, requirements, max_students, start_date, end_date, status, tags, location) VALUES
('660e8400-e29b-41d4-a716-446655440000', 'Yapay Zeka ile Görüntü İşleme', 'Derin öğrenme teknikleri kullanarak tıbbi görüntülerde hastalık tespiti yapan sistem geliştirilmesi.', 
'd7bed82f-7159-4da5-9d81-15050c0b7d3a', 'Python, TensorFlow, OpenCV', 3, '2024-04-01', '2024-09-30', 'active', 'AI,Healthcare,ComputerVision', 'Lab-A101'),
('660e8400-e29b-41d4-a716-446655440001', 'Mikroservis Tabanlı E-Ticaret', 'Modern web teknolojileri kullanarak ölçeklenebilir e-ticaret sistemi geliştirme.', 
'b5f2d8c1-3e5a-4b1d-9c2f-8b9d6e4f3a2b', 'Node.js, React, Docker', 2, '2024-05-01', '2024-10-31', 'active', 'Web,Microservices,Docker', 'Lab-B203');

-- Örnek Applications verileri
INSERT INTO public.applications (id, project_id, student_id, status, motivation_le, message) VALUES
('770e8400-e29b-41d4-a716-446655440000',
 '660e8400-e29b-41d4-a716-446655440000',
 'a1b2c3d4-e5f6-4a5b-9c8d-7e6f5a4b3c2d',
 'pending',
 'Yapay zeka ve görüntü işleme alanında deneyim kazanmak istiyorum.', 
 'Projenizde yer almak için çok heyecanlıyım.'),
('770e8400-e29b-41d4-a716-446655440001',
 '660e8400-e29b-41d4-a716-446655440001',
 'f9e8d7c6-b5a4-3c2b-1d9e-8f7g6h5j4k3l',
 'accepted',
 'Web teknolojileri konusunda uzmanlaşmak istiyorum.', 
 'Mikroservis mimarisi konusunda çalışmak istiyorum.');

-- Örnek Project Members verileri
INSERT INTO public.project_members (id, project_id, user_id, role) VALUES
('880e8400-e29b-41d4-a716-446655440000',
 '660e8400-e29b-41d4-a716-446655440000',
 'd7bed82f-7159-4da5-9d81-15050c0b7d3a',
 'mentor'),
('880e8400-e29b-41d4-a716-446655440001',
 '660e8400-e29b-41d4-a716-446655440001',
 'b5f2d8c1-3e5a-4b1d-9c2f-8b9d6e4f3a2b',
 'mentor'),
('880e8400-e29b-41d4-a716-446655440002',
 '660e8400-e29b-41d4-a716-446655440001',
 'f9e8d7c6-b5a4-3c2b-1d9e-8f7g6h5j4k3l',
 'student');

-- Örnek Milestones verileri
INSERT INTO public.milestones (id, project_id, title, date, completed) VALUES
('990e8400-e29b-41d4-a716-446655440000',
 '660e8400-e29b-41d4-a716-446655440000',
 'Veri Seti Hazırlama',
 '2024-05-01',
 false),
('990e8400-e29b-41d4-a716-446655440001',
 '660e8400-e29b-41d4-a716-446655440000',
 'Model Eğitimi',
 '2024-06-01',
 false),
('990e8400-e29b-41d4-a716-446655440002',
 '660e8400-e29b-41d4-a716-446655440001',
 'Backend API Geliştirme',
 '2024-05-15',
 true);

-- Messages tablosuna veri ekleme
INSERT INTO public.messages (sender_id, receiver_id, project_id, content) VALUES
('d7bed82f-7159-4da5-9d81-15050c0b7d3a', 'a1b2c3d4-e5f6-4a5b-9c8d-7e6f5a4b3c2d',
(SELECT id FROM public.projects WHERE title = 'Yapay Zeka ile Görüntü İşleme'),
'Başvurunuzu inceliyorum, yakında geri dönüş yapacağım.'),
('b5f2d8c1-3e5a-4b1d-9c2f-8b9d6e4f3a2b', 'f9e8d7c6-b5a4-3c2b-1d9e-8f7g6h5j4k3l',
(SELECT id FROM public.projects WHERE title = 'Mikroservis Tabanlı E-Ticaret'),
'Projeye hoş geldiniz, ilk toplantımızı planlayalım.'); 