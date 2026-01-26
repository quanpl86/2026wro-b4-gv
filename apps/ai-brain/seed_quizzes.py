"""
Heritage Quiz Seeder for WRO 2026
Run this script to populate the Supabase `heritage_quizzes` table.
"""
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

if not url or not key:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_KEY in .env")

db = create_client(url, key)

quizzes = [
    {
        "station_id": "trang_an",
        "question": "Tràng An được UNESCO công nhận là loại di sản thế giới nào?",
        "options": ["Di sản Văn hóa", "Di sản Thiên nhiên", "Di sản Kép (Văn hóa & Thiên nhiên)", "Di sản Phi vật thể"],
        "correct_index": 2,
        "explanation": "Tràng An là Di sản Thế giới Kép đầu tiên của Việt Nam, được công nhận cả về giá trị văn hóa (dấu tích người tiền sử) và thiên nhiên (cảnh quan Karst)."
    },
    {
        "station_id": "cot_co",
        "question": "Cột cờ Hà Nội được xây dựng vào năm nào?",
        "options": ["1802", "1805", "1812", "1820"],
        "correct_index": 1,
        "explanation": "Cột cờ Hà Nội được khởi công xây dựng năm 1805 dưới triều vua Gia Long, nhà Nguyễn và hoàn thành năm 1812."
    },
    {
        "station_id": "vinh_ha_long",
        "question": "Theo truyền thuyết, tên \"Hạ Long\" có nghĩa là gì?",
        "options": ["Vịnh của Rồng", "Rồng hạ xuống", "Biển xanh", "Núi thiêng"],
        "correct_index": 1,
        "explanation": "Theo truyền thuyết, tên \"Hạ Long\" có nghĩa là \"Rồng hạ xuống\". Câu chuyện kể rằng Rồng Mẹ và Rồng Con giúp người Việt đánh giặc."
    },
    {
        "station_id": "pho_co_hoi_an",
        "question": "Hội An từng là thương cảng quốc tế sầm uất nhất vào thế kỷ nào?",
        "options": ["Thế kỷ 13-14", "Thế kỷ 15-16", "Thế kỷ 16-17", "Thế kỷ 18-19"],
        "correct_index": 2,
        "explanation": "Vào thế kỷ 16-17, Hội An là một trong những thương cảng quốc tế sầm uất nhất Đông Nam Á."
    }
]

def seed():
    print("🌱 Seeding Heritage Quizzes...")
    for q in quizzes:
        # Upsert (insert or update)
        try:
            existing = db.table("heritage_quizzes").select("id").eq("station_id", q["station_id"]).execute()
            if existing.data:
                db.table("heritage_quizzes").update(q).eq("station_id", q["station_id"]).execute()
                print(f"  ✏️ Updated: {q['station_id']}")
            else:
                db.table("heritage_quizzes").insert(q).execute()
                print(f"  ✅ Inserted: {q['station_id']}")
        except Exception as e:
            print(f"  ❌ Error for {q['station_id']}: {e}")
    print("🎉 Seeding Complete!")

if __name__ == "__main__":
    seed()
