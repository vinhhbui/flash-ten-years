export type SpatialObject = "ten" | "ring" | "disc" | "frame" | "star";

export type SpatialSceneTheme = "paper" | "acid" | "pink" | "blue" | "orange" | "lilac";

export interface SpatialNodeConfig {
  id: string;
  type: "label" | "title" | "caption" | "content" | "object" | "accent" | "artwork";
  worldX: number;
  worldY: number;
  localZ: number;
  compactWorldX?: number;
  compactWorldY?: number;
  rotation?: number;
  passDepth?: number;
  object?: SpatialObject;
  mediaSrc?: string;
  mediaAlt?: string;
  slotLabel?: string;
  aspectRatio?: string;
}

export interface SpatialSceneConfig {
  id: string;
  title: string;
  label: string;
  caption?: string;
  hashtags?: string;
  brief?: string;
  body?: string;
  theme: SpatialSceneTheme;
  worldZ: number;
  nodes: SpatialNodeConfig[];
}

interface ContentSceneSeed {
  year: string;
  title: string;
  hashtags: string;
  body: string;
  brief?: string;
  theme: SpatialSceneTheme;
  layout: "left" | "right";
  primaryArtwork?: ArtworkSeed;
  supportingArtwork?: ArtworkSeed;
}

interface ArtworkSeed {
  src: string;
  alt: string;
  aspectRatio?: string;
}

const contentSceneSeeds: ContentSceneSeed[] = [
  {
    year: "2016",
    title: "TẠO NÉT",
    hashtags: "#2016  #nhóm_kín  #1st_meeting  #thành_lập  #thử_nghiệm",
    body: "TẠO (thành) NÉT, hết mình thử lửa, tiên phong làm nên những lần đầu tiên, dám thử-dám làm.",
    theme: "acid",
    layout: "left",
  },
  {
    year: "2017",
    title: "NỐI NÉT",
    hashtags: "#2017  #đốt_pháo_bông  #ụp_bánh_kem  #thẻ_giấy",
    body: "NỐI từng NÉT có sẵn, làm hết sức quậy hết mình.",
    theme: "pink",
    layout: "right",
  },
  {
    year: "2018",
    title: "LẤY NÉT",
    hashtags: "#2018  #CTV  #quy_chế  #thẻ_và_lanyard  #độc_tài  #Điên",
    body: "LẤY liền NÉT này, làm thử cái này đi. Tôi muốn làm NÉT này liền. 1 2 3 TÁCH TÁCH TÁCH",
    brief: "Thổi vào Flash làn gió mới bằng những dự án mang đậm nét cá nhân.",
    theme: "paper",
    layout: "left",
  },
  {
    year: "2019",
    title: "NÉT CĂNG",
    hashtags: "#2019  #Chuyện_Của_Ảnh  #Covid_lần_thứ_I  #picnic  #trà_đá_tạp_hóa  #Nghe_em_nói",
    body: "Ngồi xem ảnh NÉT CĂNG, uống trà đá và nghe em nói. NÉT CĂNG là từ không có trong từ điển của FLASH vì Flash luôn có hình out nét.",
    brief: "Giữ NÉT CĂNG, Gen 4 kể lại câu chuyện của mình bằng hình ảnh qua nhiều góc nhìn phong phú và đầy cảm xúc.",
    theme: "blue",
    layout: "right",
  },
  {
    year: "2020",
    title: "NÉT ĐỨT",
    hashtags: "#CCA2  #2020  #Covid_lần_thứ_II  #Sinh_Nhật_Online  #QKĐT  #Lóe  #con_vịt_mặc_áo_Flash",
    body: "Tưởng chừng là NÉT ĐỨT làm ĐỨT NÉT, nhưng tôi tìm được cách tạo vòng tròn ảo giữ vòng tròn thật. <3",
    brief: "Mùa mất kết nối, nhưng Flash vẫn vượt qua và giữ được nhịp.",
    theme: "orange",
    layout: "left",
  },
  {
    year: "2021",
    title: "NÉT CẬN",
    hashtags: "#f.leak  #1st_meeting_sở_thú  #logo_theo_mùa  #MV_Đừng_bỏ_em  #2021",
    body: "Bắt NÉT CẬN, 5 ngã 6 nâng, kéo gần khoảng cách.",
    brief: "Sau mùa Covid, Gen 6 dù ít thành viên nhưng mọi người thân thiết gắn bó, nhịp của CLB trở lại.",
    theme: "lilac",
    layout: "right",
  },
  {
    year: "2023",
    title: "BẬT NÉT",
    hashtags: "#bánh_kem_màu_hường  #hiệu_ảnh_Phờ-lát  #cà_phê_sữa  #2023  #đông  #CCA3",
    body: "BẬT flash lên, sẵn sàng và chụp toàn NÉT Flash. Cảnh báo, mật độ FLASH đang tăng…",
    theme: "acid",
    layout: "left",
  },
  {
    year: "2024",
    title: "GIỮ NÉT",
    hashtags: "#ban_model  #polaroid  #2024  #gen_8  #cho_tụi_mình",
    body: "Flash ơi GIỮ lấy mình dùm, tuy rằng khác NÉT nhưng chung một nhà.",
    brief: "GIỮ NÉT truyền lửa, Gen 8 nhẹ nhàng giữ nhịp, duy trì đam mê.",
    theme: "pink",
    layout: "right",
  },
  {
    year: "2025",
    title: "BẺ NÉT",
    hashtags: "#2_tháng_1_project  #kpi  #nhà_trọ_bí_ẩn  #2025  #metro",
    body: "BẺ NÉT theo thời, phá thời theo nét.",
    brief: "Quyết tâm BẺ NÉT, với cá tính riêng, Gen 9 đã mang đến cho Flash một màu sắc tươi mới của tuổi trẻ.",
    theme: "paper",
    layout: "left",
  },
  {
    year: "2026",
    title: "CHUNG MỘT NÉT",
    hashtags: "#nhà_vẫn_là_nhà  #x_leader  #project_góc_nhìn  #2026  #FlashConNet",
    body: "Mỗi gen một vẻ, mười gen vẹn mười, nhưng mãi CHUNG MỘT NÉT. MỘT NÉT FLASH.",
    theme: "orange",
    layout: "right",
  },
];

const sharedHeroNodes = {
  label: {
    id: "label",
    type: "label",
    worldX: 0,
    worldY: -120,
    compactWorldX: 0,
    compactWorldY: -145,
    localZ: -160,
    passDepth: 1000,
  },
  title: {
    id: "title",
    type: "title",
    worldX: 0,
    worldY: -10,
    compactWorldX: 0,
    compactWorldY: -35,
    localZ: 0,
    passDepth: 1000,
  },
} as const;

function createContentScene(seed: ContentSceneSeed, index: number): SpatialSceneConfig {
  const sectionNumber = String(index + 1).padStart(2, "0");
  const direction = seed.layout === "left" ? 1 : -1;
  const contentX = -65 * direction;
  const primaryArtworkX = 340 * direction;
  const supportingArtworkX = -540 * direction;
  const compactPrimaryArtworkX = 120 * direction;
  const compactSupportingArtworkX = -230 * direction;
  const worldZ = 5700 + index * 2200;
  const nodes: SpatialNodeConfig[] = [
    {
      id: "label",
      type: "label",
      worldX: contentX,
      worldY: -180,
      compactWorldX: 0,
      compactWorldY: -260,
      localZ: -180,
      passDepth: 960,
    },
    {
      id: "content",
      type: "content",
      worldX: contentX,
      worldY: -65,
      compactWorldX: 0,
      compactWorldY: -150,
      localZ: 0,
      passDepth: 900,
    },
    {
      id: "artwork-primary",
      type: "artwork",
      worldX: primaryArtworkX,
      worldY: 190,
      compactWorldX: compactPrimaryArtworkX,
      compactWorldY: 105,
      localZ: 60,
      rotation: 6 * direction,
      passDepth: 780,
      mediaSrc: seed.primaryArtwork?.src,
      mediaAlt: seed.primaryArtwork?.alt,
      slotLabel: `${sectionNumber}.A`,
      aspectRatio: seed.primaryArtwork?.aspectRatio ?? (index % 3 === 0 ? "4 / 5" : "4 / 3"),
    },
  ];

  if (index !== contentSceneSeeds.length - 1) {
    nodes.push({
      id: "artwork-supporting",
      type: "artwork",
      worldX: supportingArtworkX,
      worldY: 350,
      compactWorldX: compactSupportingArtworkX,
      compactWorldY: 340,
      localZ: -700,
      rotation: -10 * direction,
      passDepth: 1100,
      mediaSrc: seed.supportingArtwork?.src,
      mediaAlt: seed.supportingArtwork?.alt,
      slotLabel: `${sectionNumber}.B`,
      aspectRatio: seed.supportingArtwork?.aspectRatio ?? (index % 2 === 0 ? "1 / 1" : "3 / 4"),
    });
  }

  return {
    id: `content-${sectionNumber}`,
    title: seed.title,
    label: `GEN ${sectionNumber} / ${seed.year}`,
    hashtags: seed.hashtags,
    brief: seed.brief,
    body: seed.body,
    theme: seed.theme,
    worldZ,
    nodes,
  };
}

export const spatialScenes: SpatialSceneConfig[] = [
  {
    id: "flash10",
    title: "FLASH 10",
    label: "FLASH - 10 năm CÒN - NÉT",
    caption: "Mỗi thế hệ mang 1 NÉT riêng biệt, NỐI lại thành một FLASH.",
    theme: "paper",
    worldZ: 3500,
    nodes: [
      sharedHeroNodes.label,
      sharedHeroNodes.title,
      {
        id: "caption",
        type: "caption",
        worldX: 0,
        worldY: 125,
        compactWorldX: 0,
        compactWorldY: 118,
        localZ: 0,
        passDepth: 920,
      },
      {
        id: "object",
        type: "object",
        object: "ten",
        worldX: 300,
        worldY: 150,
        compactWorldX: 100,
        compactWorldY: 125,
        localZ: 160,
        rotation: -10,
        passDepth: 760,
      },
      {
        id: "accent",
        type: "accent",
        object: "disc",
        worldX: -420,
        worldY: 320,
        compactWorldX: -210,
        compactWorldY: 320,
        localZ: -680,
        rotation: 12,
        passDepth: 1080,
      },
    ],
  },
  ...contentSceneSeeds.map(createContentScene),
];
