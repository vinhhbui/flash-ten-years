export type FlashbackGeneration = {
  generation: number;
  title: string;
  hashtags: readonly string[];
  description: string;
  brief?: string;
  alternativeDescription?: string;
};

export const FLASHBACK_HERO_TITLE = "FLASH";
export const FLASHBACK_HERO_SUBTITLE = "10 năm CÒN - NÉT";
export const FLASHBACK_HERO_CAPTION =
  "Mỗi thế hệ mang 1 NÉT riêng biệt, NỐI lại thành một FLASH.";

export const FLASHBACK_CONTENT: readonly FlashbackGeneration[] = [
  {
    generation: 1,
    title: "TẠO NÉT",
    hashtags: ["#2016", "#nhóm_kín", "#1st_meeting", "#thành_lập", "#thử_nghiệm"],
    description:
      "TẠO (thành) NÉT, hết mình thử lửa, tiên phong làm nên những lần đầu tiên, dám thử-dám làm.",
  },
  {
    generation: 2,
    title: "NỐI NÉT",
    hashtags: ["#2017", "#đốt_pháo_bông", "#ụp_bánh_kem", "#thẻ_giấy"],
    description: "NỐI từng NÉT có sẵn, làm hết sức quậy hết mình.",
  },
  {
    generation: 3,
    title: "LẤY NÉT",
    hashtags: ["#2018", "#CTV", "#quy_chế", "#thẻ_và_lanyard", "#độc_tài", "#Điên"],
    description:
      "LẤY liền NÉT này, làm thử cái này đi. Tôi muốn làm NÉT này liền. 1 2 3 TÁCH TÁCH TÁCH",
    brief: "Thổi vào Flash làn gió mới bằng những dự án mang đậm nét cá nhân",
  },
  {
    generation: 4,
    title: "NÉT CĂNG",
    hashtags: ["#2019", "#Chuyện_Của_Ảnh", "#Covid_lần_thứ_I", "#picnic", "#trà_đá_tạp_hóa", "#Nghe_em_nói"],
    description:
      "Ngồi xem ảnh NÉT CĂNG, uống trà đá và nghe em nói. (NÉT CĂNG là từ không có trong từ điển của FLASH vì Flash luôn có hình out nét)",
    brief:
      "Giữ NÉT CĂNG, Gen 4 kể lại câu chuyện của mình bằng hình ảnh qua nhiều góc nhìn phong phú và đầy cảm xúc.",
  },
  {
    generation: 5,
    title: "NÉT ĐỨT",
    hashtags: ["#CCA2", "#2020", "#Covid_lần_thứ_II", "#Sinh_Nhật_Online", "#QKĐT", "#Lóe", "#con_vịt_mặc_áo_Flash"],
    description:
      "Tưởng chừng là NÉT ĐỨT làm ĐỨT NÉT, nhưng tôi tìm được cách tạo vòng tròn ảo giữ vòng tròn thật. <3",
    brief: "Mùa mất kết nối, nhưng Flash vẫn vượt qua và giữ được nhịp.",
  },
  {
    generation: 6,
    title: "NÉT CẬN",
    hashtags: ["#f.leak", "#1st_meeting_sở_thú", "#logo_theo_mùa", "#MV_Đừng_bỏ_em", "#2021"],
    description: "Bắt NÉT CẬN, 5 ngã 6 nâng, kéo gần khoảng cách",
    brief:
      "Sau mùa covid, gen 6 dù ít thành viên nhưng mọi người thân thiết gắn b, nhịp của clb trở lại.",
    alternativeDescription:
      "Bắt NÉT CẬN, Bốn xích vô đây, Năm gần gần lại, Sáu vô giữa luôn nè.",
  },
  {
    generation: 7,
    title: "BẬT NÉT",
    hashtags: ["#bánh_kem_màu_hường", "#hiệu_ảnh_Phờ-lát", "#cà_phê_sữa", "#2023", "#đông", "#CCA3"],
    description:
      "BẬT flash lên, sẵn sàng và chụp toàn NÉT Flash. Cảnh báo, mật độ FLASH đang tăng…",
  },
  {
    generation: 8,
    title: "GIỮ NÉT",
    hashtags: ["#ban_model", "#polaroid", "#2024", "#gen_8", "#cho_tụi_mình"],
    description: "Flash ơi GIỮ lấy mình dùm, tuy rằng khác NÉT nhưng chung một nhà",
    brief: "GIỮ NÉT truyền lửa, gen 8 nhẹ nhàng giữ nhịp, duy trì đam mê",
  },
  {
    generation: 9,
    title: "BẺ NÉT",
    hashtags: ["#2_tháng_1_project", "#kpi", "#nhà_trọ_bí_ẩn", "#2025", "#metro"],
    description: "BẺ NÉT theo thời, phá thời theo nét.",
    brief:
      "Quyết tâm BẺ NÉT, với cá tính riêng, gen 9 đã mang đến cho Flash một màu sắc tươi mới của tuổi trẻ",
  },
  {
    generation: 10,
    title: "CHUNG MỘT NÉT",
    hashtags: ["#nhà_vẫn_là_nhà", "#x_leader", "#project_góc_nhìn", "#2026", "#FlashConNet"],
    description:
      "Mỗi gen một vẻ, mười gen vẹn mười, nhưng mãi CHUNG MỘT NÉT. MỘT NÉT FLASH.",
  },
] as const;

export function getFlashbackGeneration(contentNumber: number) {
  return FLASHBACK_CONTENT[contentNumber - 1] ?? null;
}
