-- Heritage Quizzes Seed Data for WRO 2026
-- Run this in the Supabase SQL Editor

-- Create table if not exists
CREATE TABLE IF NOT EXISTS heritage_quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id TEXT NOT NULL UNIQUE,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_index INTEGER NOT NULL,
    explanation TEXT,
    points INTEGER DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clear existing data (for idempotent seeding)
DELETE FROM heritage_quizzes WHERE station_id IN ('trang_an', 'cot_co', 'vinh_ha_long', 'pho_co_hoi_an');

-- Tràng An Quiz
INSERT INTO heritage_quizzes (station_id, question, options, correct_index, explanation, points) VALUES
('trang_an', 
 'Tràng An được UNESCO công nhận là loại di sản thế giới nào?',
 '["Di sản Văn hóa", "Di sản Thiên nhiên", "Di sản Kép (Văn hóa & Thiên nhiên)", "Di sản Phi vật thể"]'::jsonb,
 2,
 'Tràng An là Di sản Thế giới Kép đầu tiên của Việt Nam, được công nhận cả về giá trị văn hóa (dấu tích người tiền sử) và thiên nhiên (cảnh quan Karst).',
 10
);

-- Cột cờ Hà Nội Quiz
INSERT INTO heritage_quizzes (station_id, question, options, correct_index, explanation, points) VALUES
('cot_co', 
 'Cột cờ Hà Nội được xây dựng vào năm nào?',
 '["1802", "1805", "1812", "1820"]'::jsonb,
 1,
 'Cột cờ Hà Nội được khởi công xây dựng năm 1805 dưới triều vua Gia Long, nhà Nguyễn và hoàn thành năm 1812.',
 10
);

-- Vịnh Hạ Long Quiz
INSERT INTO heritage_quizzes (station_id, question, options, correct_index, explanation, points) VALUES
('vinh_ha_long', 
 'Theo truyền thuyết, tên "Hạ Long" có nghĩa là gì?',
 '["Vịnh của Rồng", "Rồng hạ xuống", "Biển xanh", "Núi thiêng"]'::jsonb,
 1,
 'Theo truyền thuyết, tên "Hạ Long" có nghĩa là "Rồng hạ xuống". Câu chuyện kể rằng Rồng Mẹ và Rồng Con giúp người Việt đánh giặc, và những hòn đảo là ngọc Rồng phun ra.',
 10
);

-- Phố cổ Hội An Quiz
INSERT INTO heritage_quizzes (station_id, question, options, correct_index, explanation, points) VALUES
('pho_co_hoi_an', 
 'Hội An từng là thương cảng quốc tế sầm uất nhất vào thế kỷ nào?',
 '["Thế kỷ 13-14", "Thế kỷ 15-16", "Thế kỷ 16-17", "Thế kỷ 18-19"]'::jsonb,
 2,
 'Vào thế kỷ 16-17, Hội An là một trong những thương cảng quốc tế sầm uất nhất Đông Nam Á, nơi giao thương của thương nhân Nhật Bản, Trung Quốc và Phương Tây.',
 10
);

-- Verify
SELECT station_id, question FROM heritage_quizzes;
