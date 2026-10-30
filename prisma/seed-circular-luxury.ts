import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DIRECT_URL or DATABASE_URL is required");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  console.log("=== Bắt đầu Seed Dữ liệu Sản phẩm Cao cấp REWORE (56 sản phẩm) ===");

  const defaultPassword = await bcrypt.hash("Seller@123456", 10);

  // 1. Tạo / Cập nhật các Boutique Seller uy tín
  const sellersData = [
    {
      email: "milano@rewore.com",
      name: "Milano Archive Vault",
      shopName: "Milano Archive Vault",
      reputation: 94,
      pickupAddress: "Via Monte Napoleone 8, Milano / Kho Q1 TP.HCM",
    },
    {
      email: "atelierv@rewore.com",
      name: "Atelier V Vintage",
      shopName: "Atelier V",
      reputation: 91,
      pickupAddress: "Rue de Turenne, Paris / Kho Ba Đình Hà Nội",
    },
    {
      email: "cotswold@rewore.com",
      name: "Cotswold Vintage Co.",
      shopName: "Cotswold Vintage",
      reputation: 88,
      pickupAddress: "Cheltenham High St, UK / Kho Tân Bình TP.HCM",
    },
    {
      email: "sohorelics@rewore.com",
      name: "SoHo Relics New York",
      shopName: "SoHo Relics",
      reputation: 96,
      pickupAddress: "Spring St, SoHo, NY / Kho Q3 TP.HCM",
    },
    {
      email: "kojima@rewore.com",
      name: "Kojima Goods Co.",
      shopName: "Kojima Goods Co.",
      reputation: 93,
      pickupAddress: "Jeans Street, Kojima, Okayama / Kho Q7 TP.HCM",
    },
    {
      email: "seller@rewore.com",
      name: "Old Soul Studio",
      shopName: "Old Soul Studio",
      reputation: 89,
      pickupAddress: "48 Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM",
    },
  ];

  const sellerMap: Record<string, string> = {};

  for (const s of sellersData) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {
        name: s.name,
        role: "SELLER",
        isVerified: true,
        reputation: s.reputation,
      },
      create: {
        email: s.email,
        password: defaultPassword,
        name: s.name,
        role: "SELLER",
        isVerified: true,
        reputation: s.reputation,
      },
    });

    await prisma.sellerProfile.upsert({
      where: { userId: user.id },
      update: {
        shopName: s.shopName,
        status: "APPROVED",
        subscriptionPlan: "PREMIUM",
        pickupAddress: s.pickupAddress,
      },
      create: {
        userId: user.id,
        shopName: s.shopName,
        idCardFrontUrl: "https://images.unsplash.com/photo-1544441893-675973e31985",
        idCardBackUrl: "https://images.unsplash.com/photo-1544441893-675973e31985",
        bankAccountName: s.name,
        bankAccountNumber: "19038291029381",
        bankName: "Techcombank",
        pickupAddress: s.pickupAddress,
        status: "APPROVED",
        subscriptionPlan: "PREMIUM",
      },
    });

    sellerMap[s.shopName] = user.id;
  }

  // Cập nhật tài khoản người dùng 'ken' nếu có
  const kenUser = await prisma.user.findFirst({
    where: { email: "se183979nguyentuankiet@gmail.com" },
  });
  if (kenUser) {
    await prisma.sellerProfile.upsert({
      where: { userId: kenUser.id },
      update: { shopName: "Milano Archive Vault", status: "APPROVED" },
      create: {
        userId: kenUser.id,
        shopName: "Milano Archive Vault",
        idCardFrontUrl: "https://images.unsplash.com/photo-1544441893-675973e31985",
        idCardBackUrl: "https://images.unsplash.com/photo-1544441893-675973e31985",
        bankAccountName: "Nguyen Tuan Kiet",
        bankAccountNumber: "0912345678",
        bankName: "MBBank",
        pickupAddress: "Quận 1, TP. Hồ Chí Minh",
        status: "APPROVED",
      },
    });
    sellerMap["ken"] = kenUser.id;
  }

  console.log("Đã tạo và đồng bộ xong các Boutique Seller.");

  // 2. Dọn dẹp ràng buộc dữ liệu cũ
  console.log("Đang dọn dẹp sản phẩm cũ...");
  await prisma.order.updateMany({ data: { productId: null } });
  await prisma.cartItem.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.bid.deleteMany();
  await prisma.auction.deleteMany();
  await prisma.product.deleteMany();
  console.log("Đã dọn dẹp sạch sản phẩm cũ.");

  // 3. Danh mục 56 sản phẩm vintage & circular luxury tuyển chọn
  const luxuryProducts = [
    // =========================================================================
    // 1. JACKETS (8 sản phẩm)
    // =========================================================================
    {
      title: "Double-Breasted Camel Wool Trench Coat",
      brand: "Burberry Prorsum",
      price: 1850000,
      category: "Jackets",
      condition: "LIKE_NEW" as const,
      status: "ACTIVE" as const,
      availabilityStatus: "available" as const,
      size: "40 / M",
      color: "Camel Beige",
      sellerShop: "Milano Archive Vault",
      images: [
        "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Áo măng tô dạ len lạc đà 100% nguyên chất thuộc dòng runway cao cấp Burberry Prorsum. Cắt may thủ công tại Ý với hàng cúc sừng tự nhiên nguyên bản, phom dáng chuẩn chỉ, giữ ấm hoàn hảo và giữ nguyên tình trạng xuất sắc.",
      tags: ["burberry", "trench-coat", "wool", "made-in-italy", "vintage"],
    },
    {
      title: "1998 Distressed Moto Leather Biker Jacket",
      brand: "Helmut Lang",
      price: 2450000,
      category: "Jackets",
      condition: "GOOD" as const,
      status: "ACTIVE" as const,
      availabilityStatus: "available" as const,
      size: "L",
      color: "Espresso Brown",
      sellerShop: "Atelier V",
      images: [
        "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Mẫu áo khoác biker da bê Ý của Helmut Lang năm 1998 với lớp patina phong sương tự nhiên tuyệt đẹp. Khóa zip kép đồng thau nguyên bản từ Milan, độ hoàn thiện tinh tế biểu tượng của thời trang tối giản thập niên 90.",
      tags: ["helmut-lang", "leather", "biker", "archival", "1998"],
    },
    {
      title: "Beaufort Waxed Cotton Field Hunting Jacket",
      brand: "Barbour",
      price: 1680000,
      category: "Jackets",
      condition: "LIKE_NEW" as const,
      status: "ACTIVE" as const,
      availabilityStatus: "available" as const,
      size: "40 / L",
      color: "Sage Olive",
      sellerShop: "Cotswold Vintage",
      images: [
        "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Áo khoác dã ngoại sáp gai trứ danh Barbour Beaufort sản xuất tại South Shields, Anh Quốc. Cổ bẻ nhung tăm ấm áp, lót vải kẻ sọc tartan truyền thống chống nước gió tuyệt đối.",
      tags: ["barbour", "waxed-jacket", "heritage", "made-in-england"],
    },
    {
      title: "Deconstructed Virgin Wool Tailored Blazer",
      brand: "Maison Margiela",
      price: 2850000,
      category: "Jackets",
      condition: "LIKE_NEW" as const,
      status: "ACTIVE" as const,
      availabilityStatus: "available" as const,
      size: "48 / M",
      color: "Charcoal Black",
      sellerShop: "Atelier V",
      images: [
        "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Blazer len lông cừu nguyên chất với cấu trúc giải cấu trúc đặc trưng Margiela cùng 4 mũi chỉ trắng nhận diện sau lưng áo. Độ rủ mềm mại tinh tế, vải dệt mịn không tì vết.",
      tags: ["margiela", "blazer", "virgin-wool", "avant-garde"],
    },
    {
      title: "Archival Multi-Pocket Washed Canvas Field Vest",
      brand: "Engineered Garments",
      price: 750000,
      category: "Jackets",
      condition: "LIKE_NEW" as const,
      status: "ACTIVE" as const,
      availabilityStatus: "available" as const,
      size: "M",
      color: "Washed Olive",
      sellerShop: "SoHo Relics",
      images: [
        "https://images.unsplash.com/photo-1548126032-079a0fb0099d?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Gilet phong cách dã ngoại làm từ vải canvas cotton nhuộm rêu wash thô, cúc bấm đồng đúc và 6 túi hộp đa năng. Thiết kế bởi Daiki Suzuki sản xuất tại New York.",
      tags: ["engineered-garments", "workwear", "canvas", "new-york"],
    },
    {
      title: "Heritage Harris Tweed Windowpane Check Overcoat",
      brand: "Ralph Lauren Purple Label",
      price: 3650000,
      category: "Jackets",
      condition: "LIKE_NEW" as const,
      status: "AUCTION" as const,
      availabilityStatus: "available" as const,
      size: "42 / L",
      color: "Forest & Russet Tweed",
      sellerShop: "Milano Archive Vault",
      images: [
        "https://images.unsplash.com/photo-1559551409-dadc959f76b8?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Áo choàng dạ len Harris Tweed dệt thoi thủ công tại đảo Outer Hebrides, Scotland. Dòng Purple Label may đo đỉnh cao với lớp lót lụa nguyên chất và họa tiết ô kẻ windowpane quý phái.",
      tags: ["ralph-lauren", "harris-tweed", "overcoat", "purple-label", "auction"],
    },
    {
      title: "Type II Selvedge Denim Trucker Jacket",
      brand: "The Real McCoy's",
      price: 1950000,
      category: "Jackets",
      condition: "LIKE_NEW" as const,
      status: "ACTIVE" as const,
      availabilityStatus: "available" as const,
      size: "38 / S",
      color: "Pure Indigo",
      sellerShop: "Kojima Goods Co.",
      images: [
        "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Áo khoác denim Trucker Type II tái hiện mẫu áo công nhân thập niên 1950. Vải denim dệt thủ công 14.5oz viền hồng, đường xếp ly đôi ngực và đinh tán đồng đúc đặc.",
      tags: ["trucker-jacket", "type-2", "the-real-mccoys", "selvedge"],
    },
    {
      title: "Garment-Dyed Crinkle Reps NY Windbreaker",
      brand: "Stone Island",
      price: 1580000,
      category: "Jackets",
      condition: "GOOD" as const,
      status: "ACTIVE" as const,
      availabilityStatus: "available" as const,
      size: "L",
      color: "Midnight Navy",
      sellerShop: "Old Soul Studio",
      images: [
        "https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Áo gió công nghệ Crinkle Reps nhuộm màu áp suất cao đặc trưng của Stone Island Italy. Logo huy hiệu la bàn thêu sợi len tay áo trái nguyên bản, cản gió nhẹ và chống thấm nước.",
      tags: ["stone-island", "garment-dyed", "windbreaker", "archival"],
    },

    // =========================================================================
    // 2. HOODIES & KNITWEAR (8 sản phẩm)
    // =========================================================================
    {
      title: "Hand-Spun Mohair Cable Knit Fisherman Sweater",
      brand: "Loro Piana",
      price: 1450000,
      category: "Hoodies",
      condition: "LIKE_NEW" as const,
      status: "AUCTION" as const,
      availabilityStatus: "available" as const,
      size: "M",
      color: "Warm Rust Amber",
      sellerShop: "Cotswold Vintage",
      images: [
        "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Áo len vặn thừng dệt tay sợi mohair và cashmere hảo hạng của Loro Piana xứ Piedmont, Ý. Sợi len xù mềm như mây, tone màu đất ấm áp cổ điển không xù nhão.",
      tags: ["loro-piana", "mohair", "cable-knit", "luxury", "auction"],
    },
    {
      title: "Alpaca Blend Ribbed Cardigan Knit",
      brand: "Our Legacy",
      price: 1250000,
      category: "Hoodies",
      condition: "NEW" as const,
      status: "ACTIVE" as const,
      availabilityStatus: "available" as const,
      size: "48 / M",
      color: "Ecru & Oatmeal",
      sellerShop: "Milano Archive Vault",
      images: [
        "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Cardigan đan gân sợi pha lông lạc đà Alpaca và len mềm của thương hiệu Stockholm Our Legacy. Hàng khuy xà cừ tự nhiên dày dặn, phom boxy hiện đại và ấm cúng.",
      tags: ["our-legacy", "alpaca", "cardigan", "minimalist"],
    },
    {
      title: "Heavyweight Loopwheel French Terry Hoodie",
      brand: "The Real McCoy's",
      price: 890000,
      category: "Hoodies",
      condition: "LIKE_NEW" as const,
      status: "ACTIVE" as const,
      availabilityStatus: "available" as const,
      size: "L",
      color: "Heather Gray",
      sellerShop: "Kojima Goods Co.",
      images: [
        "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Áo hoodie dệt kim cổ ống vòng tròn Loopwheel từ vùng Wakayama Nhật Bản. Chất nỉ bông Pháp siêu bền nặng 14oz không đường may hông, mềm xốp tự nhiên.",
      tags: ["loopwheel", "hoodie", "vintage-cotton", "made-in-japan"],
    },
    {
      title: "Brushed Mohair Checked Argyle Cardigan",
      brand: "Needles",
      price: 1550000,
      category: "Hoodies",
      condition: "LIKE_NEW" as const,
      status: "ACTIVE" as const,
      availabilityStatus: "available" as const,
      size: "M",
      color: "Olive & Mustard",
      sellerShop: "SoHo Relics",
      images: [
        "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Mẫu cardigan len mohair chải lông họa tiết quả trám biểu tượng của Needles Tokyo. Lớp lông mềm mịn ánh màu độc đáo, giữ ấm tốt và đậm chất vintage grunge.",
      tags: ["needles", "mohair", "argyle", "japan"],
    },
    {
      title: "Ribbed Merino Wool Turtleneck Sweater",
      brand: "Inverallan of Scotland",
      price: 980000,
      category: "Hoodies",
      condition: "LIKE_NEW" as const,
      status: "ACTIVE" as const,
      availabilityStatus: "available" as const,
      size: "40 / M",
      color: "Winter Cream",
      sellerShop: "Cotswold Vintage",
      images: [
        "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Áo len cổ lọ dệt tay từ 100% sợi len cừu Merino nguyên chất vùng cao nguyên Scotland. Cấu trúc gân co giãn tự nhiên, dày dặn giữ nhiệt tuyệt hảo.",
      tags: ["inverallan", "merino-wool", "turtleneck", "heritage"],
    },
    {
      title: "Distressed Raw Hem Thermal Waffle Pullover",
      brand: "Rick Owens DRKSHDW",
      price: 1120000,
      category: "Hoodies",
      condition: "GOOD" as const,
      status: "ACTIVE" as const,
      availabilityStatus: "available" as const,
      size: "M",
      color: "Dust Drab",
      sellerShop: "Atelier V",
      images: [
        "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Áo pullover nỉ tổ ong thermal wash đá màu Dust đặc trưng của Rick Owens. Vạt áo cắt raw hem cuốn mép tự nhiên, tay áo suông dài lãng tử.",
      tags: ["rick-owens", "drkshdw", "thermal", "darkwear"],
    },
    {
      title: "Vintage Archival Cashmere V-Neck Sweater",
      brand: "Ballantyne",
      price: 820000,
      category: "Hoodies",
      condition: "LIKE_NEW" as const,
      status: "ACTIVE" as const,
      availabilityStatus: "available" as const,
      size: "L",
      color: "Sage Green Heather",
      sellerShop: "Old Soul Studio",
      images: [
        "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Áo len cổ tim dệt 100% cashmere sợi 2-ply của xưởng Ballantyne Scotland danh tiếng. Chất len mềm mượt như lụa, độ bền qua hàng chục năm không bai dão.",
      tags: ["cashmere", "ballantyne", "scotland", "v-neck"],
    },
    {
      title: "Oversized Wool Bouclé Zip-Up Cardigan",
      brand: "Acne Studios",
      price: 1380000,
      category: "Hoodies",
      condition: "NEW" as const,
      status: "ACTIVE" as const,
      availabilityStatus: "available" as const,
      size: "S",
      color: "Toffee Brown",
      sellerShop: "SoHo Relics",
      images: [
        "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Cardigan khóa zip len bông xù bouclé phom rộng oversized từ Acne Studios Stockholm. Tone màu nâu kẹo bơ ấm cúng, cổ cao chắn gió và túi ấm tay tiện dụng.",
      tags: ["acne-studios", "boucle", "knitwear", "scandinavian"],
    },

    // =========================================================================
    // 3. SHIRTS (8 sản phẩm)
    // =========================================================================
    {
      title: "Poplin Tailored Crisp Oxford Shirt",
      brand: "Margaret Howell",
      price: 620000,
      category: "Shirts",
      condition: "LIKE_NEW" as const,
      status: "ACTIVE" as const,
      availabilityStatus: "available" as const,
      size: "M",
      color: "Chalk White",
      sellerShop: "Cotswold Vintage",
      images: [
        "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Áo sơ mi poplin dệt từ sợi cotton Ai Cập thượng hạng của NTK Anh Margaret Howell. Đường may giấu chỉ sắc sảo, cổ áo cổ điển tinh khôi và thanh lịch.",
      tags: ["margaret-howell", "oxford-shirt", "poplin", "minimal"],
    },
    {
      title: "Camp-Collar Silk Twill Printed Shirt",
      brand: "Dries Van Noten",
      price: 1150000,
      category: "Shirts",
      condition: "NEW" as const,
      status: "ACTIVE" as const,
      availabilityStatus: "available" as const,
      size: "48 / M",
      color: "Botanical Olive & Ochre",
      sellerShop: "Atelier V",
      images: [
        "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Sơ mi lụa tơ tằm dệt chéo họa tiết thực vật độc bản của Dries Van Noten. Cổ pijama phóng khoáng, bề mặt lụa rủ bóng mờ kiêu sa và thoáng mát.",
      tags: ["dries-van-noten", "silk-shirt", "botanical", "runway"],
    },
    {
      title: "Archival Relaxed Band-Collar Linen Shirt",
      brand: "Jil Sander",
      price: 780000,
      category: "Shirts",
      condition: "LIKE_NEW" as const,
      status: "ACTIVE" as const,
      availabilityStatus: "available" as const,
      size: "S",
      color: "Natural Flax Ecru",
      sellerShop: "Milano Archive Vault",
      images: [
        "https://images.unsplash.com/photo-1589310243389-96a5483213a8?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Sơ mi cổ tàu đũi lanh Pháp nguyên chất từ Jil Sander thời kỳ tối giản. Vải lanh mộc mạc thoáng khí mát lạnh, khuy xà cừ tự nhiên tinh xảo.",
      tags: ["jil-sander", "linen", "band-collar", "summer-luxury"],
    },
    {
      title: "Vintage Chambray Workshirt with Triple Stitching",
      brand: "Sugar Cane Co.",
      price: 690000,
      category: "Shirts",
      condition: "LIKE_NEW" as const,
      status: "ACTIVE" as const,
      availabilityStatus: "available" as const,
      size: "M",
      color: "Washed Indigo",
      sellerShop: "Kojima Goods Co.",
      images: [
        "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Sơ mi chambray cổ điển dệt thoi pha sợi bã mía đặc trưng của Sugar Cane Tokyo. Đường chỉ ba mũi triple-stitch siêu chắc, tai áo selvedge run-off kinh điển.",
      tags: ["sugar-cane", "chambray", "workshirt", "selvedge"],
    },
    {
      title: "Silk Bowling Shirt with Contrast Piping",
      brand: "Casablanca Paris",
      price: 1350000,
      category: "Shirts",
      condition: "NEW" as const,
      status: "AUCTION" as const,
      availabilityStatus: "available" as const,
      size: "L",
      color: "Pastel Sorbet",
      sellerShop: "Milano Archive Vault",
      images: [
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Sơ mi lụa tơ tằm dệt jacquard phong cách quần vợt cổ điển của Casablanca. Viền piping nổi bật, khuy mạ vàng tráng men họa tiết trái cam Địa Trung Hải.",
      tags: ["casablanca", "silk-shirt", "bowling-shirt", "luxury", "auction"],
    },
    {
      title: "Heavy Flannel Buffalo Plaid Workshirt",
      brand: "Iron Heart",
      price: 940000,
      category: "Shirts",
      condition: "GOOD" as const,
      status: "ACTIVE" as const,
      availabilityStatus: "available" as const,
      size: "L",
      color: "Red & Black Plaid",
      sellerShop: "Old Soul Studio",
      images: [
        "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Áo sơ mi dạ flannel siêu dày 12oz dệt thoi trên máy Aspero cotton Peru của Iron Heart Nhật Bản. Chải lông mặt trong cực ấm, cúc bấm xà cừ ngọc trai nguyên khối.",
      tags: ["iron-heart", "flannel", "heavyweight", "workwear"],
    },
    {
      title: "Boxy Vacation Rayon Camp Shirt",
      brand: "Wacko Maria",
      price: 880000,
      category: "Shirts",
      condition: "LIKE_NEW" as const,
      status: "ACTIVE" as const,
      availabilityStatus: "available" as const,
      size: "M",
      color: "Monochrome Leopard",
      sellerShop: "SoHo Relics",
      images: [
        "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Sơ mi lụa nhân tạo tơ tằm Rayon mềm mát rượi họa tiết da báo xám đen từ Tokyo Wacko Maria. Phom áo rộng rãi thoải mái cho những đêm mùa hè.",
      tags: ["wacko-maria", "rayon-shirt", "hawaiian", "tokyo"],
    },
    {
      title: "Washed Cotton Poplin Utility Overshirt",
      brand: "Universal Works",
      price: 720000,
      category: "Shirts",
      condition: "LIKE_NEW" as const,
      status: "ACTIVE" as const,
      availabilityStatus: "available" as const,
      size: "M",
      color: "Khaki Bark",
      sellerShop: "Cotswold Vintage",
      images: [
        "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Sơ mi khoác ngoài vải poplin cotton dệt đanh từ xưởng Nottingham Universal Works. Ba túi vuông mặt trước tiện lợi, dáng áo suông hiện đại phối nhiều phong cách.",
      tags: ["universal-works", "overshirt", "utility", "british"],
    },

    // =========================================================================
    // 4. DRESSES (8 sản phẩm)
    // =========================================================================
    {
      title: "90s Bias-Cut Silk Crepe Slip Dress",
      brand: "Jil Sander",
      price: 1320000,
      category: "Dresses",
      condition: "LIKE_NEW" as const,
      status: "ACTIVE" as const,
      availabilityStatus: "available" as const,
      size: "S",
      color: "Sage Khaki",
      sellerShop: "SoHo Relics",
      images: [
        "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Đầm hai dây cắt xéo (bias-cut) bằng lụa crepe dâu tằm cao cấp ôm lượn theo dáng cơ thể một cách tự nhiên. Dấu ấn thẩm mỹ thập niên 90 tối giản và quyến rũ.",
      tags: ["jil-sander", "slip-dress", "silk", "90s-vintage"],
    },
    {
      title: "Archival Asymmetric Wrap Column Dress",
      brand: "Yohji Yamamoto",
      price: 1750000,
      category: "Dresses",
      condition: "LIKE_NEW" as const,
      status: "ACTIVE" as const,
      availabilityStatus: "available" as const,
      size: "M",
      color: "Pitch Black",
      sellerShop: "Atelier V",
      images: [
        "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Đầm suông vải len gabardine đen sâu thẳm vạt chéo bất đối xứng của Yohji Yamamoto. Thiết kế giải phóng hình thể mang đậm triết lý thiền định Nhật Bản.",
      tags: ["yohji-yamamoto", "black-dress", "japan-avantgarde"],
    },
    {
      title: "Vintage Plaid Wool Bustier Corset Dress",
      brand: "Vivienne Westwood",
      price: 2650000,
      category: "Dresses",
      condition: "GOOD" as const,
      status: "AUCTION" as const,
      availabilityStatus: "available" as const,
      size: "S",
      color: "Scottish Tartan",
      sellerShop: "Old Soul Studio",
      images: [
        "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Kiệt tác đầm corset vải dạ len tartan Scotland của Vivienne Westwood London. Phom nịt eo corset trứ danh tôn đường cong với nẹp gọng kim loại nguyên bản.",
      tags: ["vivienne-westwood", "corset", "tartan", "london", "auction"],
    },
    {
      title: "Pleated Geometric Column Midi Dress",
      brand: "Pleats Please Issey Miyake",
      price: 1890000,
      category: "Dresses",
      condition: "LIKE_NEW" as const,
      status: "ACTIVE" as const,
      availabilityStatus: "available" as const,
      size: "One Size",
      color: "Terracotta Ochre",
      sellerShop: "Milano Archive Vault",
      images: [
        "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Đầm xếp ly nhiệt vĩnh cửu công nghệ dập nếp độc quyền của bậc thầy Issey Miyake. Trọng lượng siêu nhẹ không nhăn nhàu, co giãn thoải mái theo chuyển động người mặc.",
      tags: ["issey-miyake", "pleats-please", "pleated-dress", "japan"],
    },
    {
      title: "Lace-Trimmed Vintage Silk Chiffon Maxi Dress",
      brand: "Chloé Archival",
      price: 1950000,
      category: "Dresses",
      condition: "LIKE_NEW" as const,
      status: "ACTIVE" as const,
      availabilityStatus: "available" as const,
      size: "38 / M",
      color: "Blush Champagne",
      sellerShop: "Atelier V",
      images: [
        "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Đầm maxi lụa voan chiffon xếp tầng phối ren vỏ sò thủ công từ thời kỳ Phoebe Philo tại Chloé Paris. Bay bổng lãng mạn, lót lụa tơ tằm hai lớp kín đáo.",
      tags: ["chloe", "silk-chiffon", "boho-chic", "paris"],
    },
    {
      title: "Button-Front Tailored Linen Shirtdress",
      brand: "Lemaire",
      price: 1250000,
      category: "Dresses",
      condition: "NEW" as const,
      status: "ACTIVE" as const,
      availabilityStatus: "available" as const,
      size: "36 / S",
      color: "Dune Sand",
      sellerShop: "Cotswold Vintage",
      images: [
        "https://images.unsplash.com/photo-1495385794356-15371f348c31?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Đầm sơ mi thắt đai eo vải lanh pha tơ lụa của NTK Christophe Lemaire. Đường cắt may thanh tịnh, túi ốp ngực sắc sảo toát lên vẻ trang nhã thuần khiết.",
      tags: ["lemaire", "shirtdress", "linen", "paris-minimalism"],
    },
    {
      title: "Cut-Out Velvet Slip Evening Dress",
      brand: "Tom Ford for Gucci",
      price: 3100000,
      category: "Dresses",
      condition: "GOOD" as const,
      status: "AUCTION" as const,
      availabilityStatus: "available" as const,
      size: "S",
      color: "Burgundy Wine",
      sellerShop: "Milano Archive Vault",
      images: [
        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Bộ đầm nhung tơ tằm nhung tuyết quyến rũ thuộc kỷ nguyên Tom Ford tại Gucci năm 1996. Phần hở lưng gợi cảm sắc sảo, đính chi tiết kim loại mạ vàng kinh điển.",
      tags: ["tom-ford", "gucci", "velvet-dress", "90s-archive", "auction"],
    },
    {
      title: "Floral Printed Wrap Tea Dress",
      brand: "DVF Diane von Furstenberg",
      price: 850000,
      category: "Dresses",
      condition: "LIKE_NEW" as const,
      status: "ACTIVE" as const,
      availabilityStatus: "available" as const,
      size: "M",
      color: "Vintage Floral Multi",
      sellerShop: "SoHo Relics",
      images: [
        "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Đầm vạt đắp quấn eo lụa dệt kim Jersey đặc trưng DVF tôn dáng hoàn mỹ. Chất vải lụa mềm mượt co giãn tự nhiên, in hoa vintage trang nhã.",
      tags: ["dvf", "wrap-dress", "silk-jersey", "classic"],
    },

    // =========================================================================
    // 5. DENIM & TROUSERS (8 sản phẩm)
    // =========================================================================
    {
      title: "Raw 16oz Japanese Selvedge Denim Jeans",
      brand: "Studio D'Artisan",
      price: 1250000,
      category: "Denim",
      condition: "NEW" as const,
      status: "ACTIVE" as const,
      availabilityStatus: "available" as const,
      size: "32x32",
      color: "Deep Indigo",
      sellerShop: "Kojima Goods Co.",
      images: [
        "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1582552938357-32b906df40cb?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Quần jean biên hồng selvedge 16oz dệt trên máy con thoi Toyoda G3 cổ tại Kojima, Okayama. Vải nhuộm chàm tự nhiên cực dày, đinh tán đồng đúc và tag da hươu cao cấp.",
      tags: ["selvedge", "raw-denim", "made-in-japan", "kojima"],
    },
    {
      title: "Archival Double-Pleated Virgin Wool Trousers",
      brand: "Yohji Yamamoto",
      price: 1150000,
      category: "Denim",
      condition: "GOOD" as const,
      status: "AUCTION" as const,
      availabilityStatus: "available" as const,
      size: "3 / L",
      color: "Dark Charcoal",
      sellerShop: "Milano Archive Vault",
      images: [
        "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Quần âu len lông cừu nguyên chất xếp 2 ly sâu với ống rộng suông bay bổng kinh điển của Yohji Yamamoto. Vải dệt chéo êm mượt, đai eo điều chỉnh khóa cài đồng.",
      tags: ["yohji-yamamoto", "wool-trousers", "pleated", "auction"],
    },
    {
      title: "1947 501XX Cone Mills Selvedge Denim",
      brand: "Levi's Vintage Clothing",
      price: 1650000,
      category: "Denim",
      condition: "LIKE_NEW" as const,
      status: "ACTIVE" as const,
      availabilityStatus: "available" as const,
      size: "31x32",
      color: "Vintage Wash Indigo",
      sellerShop: "Old Soul Studio",
      images: [
        "https://images.unsplash.com/photo-1582552938357-32b906df40cb?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Bản tái hiện mẫu 501 năm 1947 huyền thoại may từ denim Cone Mills White Oak nhà máy Mỹ. Tab đỏ Big E, đinh tán ẩn túi sau, phom ống đứng thời kỳ hậu thế chiến.",
      tags: ["lvc", "501xx", "cone-mills", "big-e", "americana"],
    },
    {
      title: "Wide-Leg Painter Dungaree Pants",
      brand: "OrSlow",
      price: 890000,
      category: "Denim",
      condition: "LIKE_NEW" as const,
      status: "ACTIVE" as const,
      availabilityStatus: "available" as const,
      size: "2 / M",
      color: "Ecru One-Wash",
      sellerShop: "Kojima Goods Co.",
      images: [
        "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Quần họa sĩ vải canvas sợi thô cotton tự nhiên từ xưởng OrSlow Hyogo. Có quai treo búa và túi thước thợ mộc, wash mềm 1 nước giữ nguyên hạt bông tự nhiên.",
      tags: ["orslow", "workpants", "painter-pants", "made-in-japan"],
    },
    {
      title: "High-Rise Rigid Sailor Denim Trousers",
      brand: "Khaite New York",
      price: 1450000,
      category: "Denim",
      condition: "NEW" as const,
      status: "ACTIVE" as const,
      availabilityStatus: "available" as const,
      size: "27 / S",
      color: "Dark Rinse",
      sellerShop: "SoHo Relics",
      images: [
        "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Quần jean cạp cao ống loe nhẹ phong cách thủy thủ từ thương hiệu New York Khaite. Denim dày dặn định hình vóc dáng với hàng khuy sừng sang trọng.",
      tags: ["khaite", "high-rise", "denim", "new-york"],
    },
    {
      title: "Garment-Dyed Cotton Chino Trousers",
      brand: "Margaret Howell MHL",
      price: 680000,
      category: "Denim",
      condition: "GOOD" as const,
      status: "ACTIVE" as const,
      availabilityStatus: "available" as const,
      size: "30x30",
      color: "British Khaki Tan",
      sellerShop: "Cotswold Vintage",
      images: [
        "https://images.unsplash.com/photo-1475178626620-a4d074967452?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Quần chino vải chéo cotton twill dày của dòng MHL Margaret Howell. Nhuộm thành phẩm phong hóa tự nhiên, phom đứng rộng rãi bền bỉ theo thời gian.",
      tags: ["margaret-howell", "mhl", "chino", "british-style"],
    },
    {
      title: "1960s 505 Talon 42 Zip Selvedge Denim",
      brand: "Levi's Vintage Clothing",
      price: 1550000,
      category: "Denim",
      condition: "GOOD" as const,
      status: "ACTIVE" as const,
      availabilityStatus: "available" as const,
      size: "33x32",
      color: "Medium Light Cast",
      sellerShop: "Old Soul Studio",
      images: [
        "https://images.unsplash.com/photo-1555689502-c4b22d76c56f?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Mẫu quần 505 năm 1967 cạp vừa ống suông ôm khóa kéo Talon 42 đồng thau nguyên bản. Hiệu ứng bạc râu mèo whiskers tự nhiên tuyệt mỹ qua năm tháng.",
      tags: ["levis", "505", "talon-42", "vintage-denim"],
    },
    {
      title: "Relaxed Drawstring Linen Trousers",
      brand: "Bode New York",
      price: 1350000,
      category: "Denim",
      condition: "NEW" as const,
      status: "ACTIVE" as const,
      availabilityStatus: "available" as const,
      size: "M",
      color: "Flax Sand Stripe",
      sellerShop: "Atelier V",
      images: [
        "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Quần dài vải lanh dệt thủ công sọc vintage của NTK Emily Bode New York. Dây rút cạp luồn ren thủ công, mang đậm tinh thần hoài cổ duy mỹ và thoáng mát.",
      tags: ["bode", "linen-trousers", "handcrafted", "artisanal"],
    },

    // =========================================================================
    // 6. BAGS (8 sản phẩm)
    // =========================================================================
    {
      title: "Archive Triomphe Box Calfskin Shoulder Bag",
      brand: "Céline",
      price: 3450000,
      category: "Bags",
      condition: "LIKE_NEW" as const,
      status: "ACTIVE" as const,
      availabilityStatus: "available" as const,
      size: "Medium",
      color: "Black Noir",
      sellerShop: "Milano Archive Vault",
      images: [
        "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Túi hộp da bê Box Calfskin mướt mịn với khóa kim loại vàng Triomphe cổ điển của Céline Paris. Lót da cừu nappa mềm tuyệt đối, cạnh túi sơn keo thủ công nguyên bản.",
      tags: ["celine", "triomphe", "box-bag", "paris-luxury"],
    },
    {
      title: "Vintage Horsebit Saddle Bridle Leather Satchel",
      brand: "Gucci Archival",
      price: 2950000,
      category: "Bags",
      condition: "GOOD" as const,
      status: "ACTIVE" as const,
      availabilityStatus: "available" as const,
      size: "One Size",
      color: "Rich Chestnut Tan",
      sellerShop: "Atelier V",
      images: [
        "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Túi yên ngựa da bò sáp yên cương Bridle thuộc bộ sưu tập lưu trữ Gucci Florence. Khóa hàm thiếc ngựa đồng đúc sáng bóng, chất da đanh dày bền bỉ theo năm tháng.",
      tags: ["gucci", "horsebit", "leather-satchel", "italian-craft"],
    },
    {
      title: "1990s Re-Nylon Tessuto Triangle Plate Bag",
      brand: "Prada",
      price: 2250000,
      category: "Bags",
      condition: "LIKE_NEW" as const,
      status: "ACTIVE" as const,
      availabilityStatus: "available" as const,
      size: "One Size",
      color: "Nero Black",
      sellerShop: "SoHo Relics",
      images: [
        "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Túi kẹp nách vải dù Tessuto chống thấm kinh điển của Prada Milan thập niên 90. Logo tam giác tráng men chuẩn font, tay xách da Saffiano nguyên bản.",
      tags: ["prada", "re-nylon", "tessuto", "milan"],
    },
    {
      title: "Hand-Stitched Heavy Saddle Leather Messenger",
      brand: "Filson 1897",
      price: 1850000,
      category: "Bags",
      condition: "LIKE_NEW" as const,
      status: "ACTIVE" as const,
      availabilityStatus: "available" as const,
      size: "One Size",
      color: "Otter Green & Saddle Tan",
      sellerShop: "Old Soul Studio",
      images: [
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Túi đưa thư vải bạt Rugged Twill chống thấm nước và da thuộc yên cương Bridle Mỹ từ Filson Seattle. Khóa kéo đồng thau chống kẹt số 10 cực kỳ đầm tay.",
      tags: ["filson", "rugged-twill", "messenger-bag", "americana"],
    },
    {
      title: "Grained Calfskin Leather Envelope Clutch",
      brand: "Saint Laurent",
      price: 2650000,
      category: "Bags",
      condition: "LIKE_NEW" as const,
      status: "AUCTION" as const,
      availabilityStatus: "available" as const,
      size: "Small",
      color: "Rouge Deep Berry",
      sellerShop: "Milano Archive Vault",
      images: [
        "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Clutch cầm tay phong bì da bê vân hạt Grain de Poudre sắc nét với logo kim loại YSL đan lồng mạ vàng. Dây đeo vai xích kim loại tháo rời tiện dụng.",
      tags: ["saint-laurent", "ysl", "clutch", "luxury", "auction"],
    },
    {
      title: "Woven Raffia & Calfskin Market Basket Tote",
      brand: "Loewe",
      price: 1980000,
      category: "Bags",
      condition: "NEW" as const,
      status: "ACTIVE" as const,
      availabilityStatus: "available" as const,
      size: "Medium",
      color: "Natural Palm & Tan Leather",
      sellerShop: "Atelier V",
      images: [
        "https://images.unsplash.com/photo-1575032617751-6ddec2089882?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Túi làn đan tay từ lá cọ cọ dừa tự nhiên với miếng đắp logo Anagram da bê dập chìm của Loewe Tây Ban Nha. Quai xách điều chỉnh độ dài tiện dụng ngày nắng.",
      tags: ["loewe", "basket-bag", "raffia", "craftsmanship"],
    },
    {
      title: "Intrecciato Nappa Leather Crossbody Bag",
      brand: "Bottega Veneta",
      price: 3850000,
      category: "Bags",
      condition: "LIKE_NEW" as const,
      status: "ACTIVE" as const,
      availabilityStatus: "available" as const,
      size: "One Size",
      color: "Fondant Espresso",
      sellerShop: "Milano Archive Vault",
      images: [
        "https://images.unsplash.com/photo-1527385352018-3c26dd6c3916?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Túi đeo chéo kỹ thuật đan da Intrecciato trứ danh của các nghệ nhân vùng Veneto, Ý. Da cừu nappa mềm mịn tựa lụa, khóa bấm nam châm giấu kín hoàn hảo.",
      tags: ["bottega-veneta", "intrecciato", "leather-bag", "italian-luxury"],
    },
    {
      title: "Archive Saddle Bag in Oblique Jacquard",
      brand: "Christian Dior",
      price: 4200000,
      category: "Bags",
      condition: "GOOD" as const,
      status: "AUCTION" as const,
      availabilityStatus: "available" as const,
      size: "Medium",
      color: "Blue Oblique Monogram",
      sellerShop: "Atelier V",
      images: [
        "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Túi yên ngựa Saddle huyền thoại do John Galliano thiết kế năm 1999 vải dệt Oblique Dior. Khóa chữ CD vàng đồng và móc treo chữ D phía trước kinh điển.",
      tags: ["dior", "saddle-bag", "oblique", "john-galliano", "auction"],
    },

    // =========================================================================
    // 7. ACCESSORIES & FOOTWEAR (8 sản phẩm)
    // =========================================================================
    {
      title: "Tobacco Suede Goodyear-Welted Chelsea Boots",
      brand: "Church's",
      price: 1750000,
      category: "Accessories",
      condition: "LIKE_NEW" as const,
      status: "ACTIVE" as const,
      availabilityStatus: "available" as const,
      size: "42 EU",
      color: "Snuff Tobacco Suede",
      sellerShop: "Old Soul Studio",
      images: [
        "https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Đôi bốt Chelsea da lộn cao cấp đóng khung gù Goodyear-welt tại Northamptonshire, Anh. Lót da thuộc thảo mộc thoáng khí, đế da đầm chắc đi cả ngày êm ái.",
      tags: ["churchs", "chelsea-boots", "suede", "northampton"],
    },
    {
      title: "Split-Toe Tabi Low Ankle Leather Boots",
      brand: "Maison Margiela",
      price: 3200000,
      category: "Accessories",
      condition: "LIKE_NEW" as const,
      status: "AUCTION" as const,
      availabilityStatus: "available" as const,
      size: "41 EU",
      color: "Matte Black",
      sellerShop: "Atelier V",
      images: [
        "https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Đôi bốt Tabi mũi xẻ huyền thoại của Maison Margiela da bê nappa mềm như bơ. Gót trụ gỗ bọc da cao 6cm, móc gài khóa cơ bản truyền thống Nhật Bản.",
      tags: ["margiela", "tabi-boots", "avant-garde", "auction"],
    },
    {
      title: "Plaited Fringe 100% Cashmere Tartan Scarf",
      brand: "Johnstons of Elgin",
      price: 480000,
      category: "Accessories",
      condition: "NEW" as const,
      status: "ACTIVE" as const,
      availabilityStatus: "available" as const,
      size: "One Size",
      color: "Forest Green Tartan",
      sellerShop: "Cotswold Vintage",
      images: [
        "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Khăn quàng cổ len cashmere 100% dệt tại Elgin bên bờ sông Lossie, Scotland từ năm 1797. Lông chải mềm mịn ấm áp vượt trội, viền tua rua thắt nút thủ công.",
      tags: ["johnstons-of-elgin", "cashmere", "scotland", "scarf"],
    },
    {
      title: "Hand-Burnished Bridle Leather Solid Brass Belt",
      brand: "Tanner Goods",
      price: 520000,
      category: "Accessories",
      condition: "LIKE_NEW" as const,
      status: "ACTIVE" as const,
      availabilityStatus: "available" as const,
      size: "32 Inch",
      color: "Saddle Tan",
      sellerShop: "Kojima Goods Co.",
      images: [
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Thắt lưng da mộc Bridle dày 4mm thuộc thảo mộc từ xưởng Tanner Goods Portland. Khóa đồng thau đúc cát đánh bóng tay, gờ cạnh bo sáp ong tỉ mỉ.",
      tags: ["tanner-goods", "bridle-leather", "brass", "heritage"],
    },
    {
      title: "Archive Acetate Tinted Aviator Sunglasses",
      brand: "Gucci 1980s",
      price: 890000,
      category: "Accessories",
      condition: "LIKE_NEW" as const,
      status: "ACTIVE" as const,
      availabilityStatus: "available" as const,
      size: "One Size",
      color: "Tortoiseshell & Amber",
      sellerShop: "Milano Archive Vault",
      images: [
        "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Kính mát dáng giọt nước phi công gọng nhựa đồi mồi acetate tự nhiên sản xuất tại Ý thập niên 80. Tròng kính màu hổ phách ấm cúng chống tia UV tuyệt đối.",
      tags: ["gucci", "sunglasses", "aviator", "80s-vintage"],
    },
    {
      title: "Hand-Rolled 90cm Silk Twill Heritage Carré Scarf",
      brand: "Hermès Paris",
      price: 2150000,
      category: "Accessories",
      condition: "LIKE_NEW" as const,
      status: "AUCTION" as const,
      availabilityStatus: "available" as const,
      size: "90x90 cm",
      color: "Navy & Gold Grand Apparat",
      sellerShop: "Atelier V",
      images: [
        "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Khăn lụa vuông Carré 90 tơ tằm dệt chéo in lụa thủ công 24 màu kinh điển của Hermès Paris. Viền khăn cuộn tròn khâu tay tỉ mỉ, bề mặt sáng mượt óng ả.",
      tags: ["hermes", "carre-scarf", "silk-twill", "paris-luxury", "auction"],
    },
    {
      title: "Cordovan Leather Oxford Derby Shoes",
      brand: "Alden of New England",
      price: 3450000,
      category: "Accessories",
      condition: "LIKE_NEW" as const,
      status: "ACTIVE" as const,
      availabilityStatus: "available" as const,
      size: "42.5 EU",
      color: "Color 8 Deep Burgundy",
      sellerShop: "Old Soul Studio",
      images: [
        "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Đôi giày Derby da mông ngựa Horween Shell Cordovan màu số 8 trứ danh của Alden Massachusetts. Da bóng sâu bền bỉ hàng chục năm, đế da đôi đóng chỉ gù chắc nịch.",
      tags: ["alden", "shell-cordovan", "derby-shoes", "made-in-usa"],
    },
    {
      title: "Hand-Knitted Cable Wool Fisherman Beanie",
      brand: "Studio Nicholson",
      price: 420000,
      category: "Accessories",
      condition: "NEW" as const,
      status: "ACTIVE" as const,
      availabilityStatus: "available" as const,
      size: "One Size",
      color: "Oatmeal Melange",
      sellerShop: "Cotswold Vintage",
      images: [
        "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=900&q=80",
      ],
      description:
        "Mũ len dệt kim sợi dày 100% len cừu Lambswool từ Studio Nicholson London. Vành gập ấm áp, co giãn êm nhẹ ôm sát vòm đầu không gây ngứa.",
      tags: ["studio-nicholson", "beanie", "lambswool", "london-minimal"],
    },
  ];

  console.log(`Đang nạp ${luxuryProducts.length} sản phẩm cao cấp vào database...`);

  const createdProducts: any[] = [];

  for (const item of luxuryProducts) {
    const sellerId = sellerMap[item.sellerShop] || Object.values(sellerMap)[0];
    const created = await prisma.product.create({
      data: {
        title: item.title,
        brand: item.brand,
        price: item.price,
        category: item.category,
        condition: item.condition,
        status: item.status,
        availabilityStatus: item.availabilityStatus,
        size: item.size,
        color: item.color,
        description: item.description,
        images: item.images,
        tags: item.tags,
        viewCount: Math.floor(Math.random() * 80) + 12,
        sellerId,
      },
    });
    createdProducts.push(created);
  }

  console.log(`Đã nạp thành công ${createdProducts.length} sản phẩm.`);

  // 4. Tạo các phiên đấu giá trực tiếp (Live Auctions) kết nối với sản phẩm AUCTION
  const auctionProducts = createdProducts.filter((p) => p.status === "AUCTION");
  console.log(`Tìm thấy ${auctionProducts.length} sản phẩm đấu giá, tiến hành tạo phiên đấu giá...`);

  const now = new Date();

  for (let i = 0; i < auctionProducts.length; i++) {
    const p = auctionProducts[i];
    const isLive = i < 4; // 4 phiên đang diễn ra trực tiếp, còn lại là sắp mở (upcoming)
    const startTime = isLive
      ? new Date(now.getTime() - 2 * 3600 * 1000)
      : new Date(now.getTime() + 6 * 3600 * 1000);
    const endTime = isLive
      ? new Date(now.getTime() + (i + 2) * 3600 * 1000)
      : new Date(now.getTime() + (24 + i * 4) * 3600 * 1000);

    const startPrice = Math.round(p.price * 0.7);
    const currentBid = isLive ? p.price : startPrice;

    await prisma.auction.create({
      data: {
        productId: p.id,
        sellerId: p.sellerId,
        startPrice,
        currentBid,
        minIncrement: 50000,
        startTime,
        endTime,
        status: isLive ? "LIVE" : "UPCOMING",
      },
    });
  }

  console.log("Đã tạo xong các phiên đấu giá trực tiếp trong database.");
  console.log("=== HOÀN TẤT SEED DỮ LIỆU THÀNH CÔNG ===");
}

main()
  .catch((err) => {
    console.error("Lỗi khi seed dữ liệu:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
