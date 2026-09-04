export type ProductColor = {
  name: string;
  hex: string;
  frame_color?: string;
  lens_color?: string;
  image_url?: string;
  images?: string[];
  sold_out?: boolean;
};

export type ProductDownload = {
  name: string;
  url: string;
  type?: string;
};

export type ProductInstallments = {
  enabled: boolean;
  count: number;
  amount: number;
};

export type ProductGender = "masculino" | "feminino" | "unissex";

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand?: string;
  model?: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  installments?: ProductInstallments | null;
  category: string;
  gender?: ProductGender;
  images: string[];
  colors: ProductColor[];
  downloads?: ProductDownload[];
  stock: number;
  sold_out?: boolean;
  featured: boolean;
  more_sold?: boolean;
  collection_slugs?: string[];
  created_at?: string;
};

// Uma "vitrine" administrável: marca (Ray-Ban, Voogue...) ou recorte livre
// (Ciclista, HB...). Um produto pode ter vários slugs de coleção ao mesmo
// tempo — a listagem "coleção completa" busca direto na tabela products, então
// nunca duplica o mesmo produto mesmo que ele esteja em duas coleções.
export type Collection = {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
  sort_order?: number;
  created_at?: string;
};

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  colorName: string;
  quantity: number;
};
