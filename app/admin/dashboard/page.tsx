"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Collection, HeroSlide, Product, ProductColor, ProductDownload, Testimonial } from "@/types/product";
import { isProductSoldOut } from "@/lib/productStatus";
import { FILTER_DESTINATIONS, FORMAT_OPTIONS } from "@/lib/filters";
import { calculateDiscountPercent } from "@/lib/pricing";
import { compressImageFile, compressImageFiles } from "@/lib/imageCompression";
import {
  ArrowDown,
  ArrowUp,
  Check,
  FileText,
  Film,
  ImageIcon,
  LogOut,
  Mail,
  MessageCircle,
  PackageCheck,
  PackageX,
  Pencil,
  Plus,
  Trash2,
  UploadCloud,
  Video,
  X,
} from "lucide-react";

type AbandonedCart = { id: string; whatsapp: string; items: { name: string; quantity: number }[]; total: number; created_at: string };
type ProductClick = { product_id: string; product_name: string; product_slug: string };

type Lead = {
  id: string;
  name: string | null;
  email: string;
  gender: string | null;
  created_at: string;
};

type ShippingSettings = {
  width: string;
  height: string;
  length: string;
  weight: string;
};

type PromoBannerSettings = {
  image_url: string;
  alt_text: string;
  href: string;
  active: boolean;
  destination_type: "none" | "collection" | "product";
  destination_id: string;
};

type TestimonialFormState = { id?: string; author_name: string; content: string; image_url: string; rating: string };
const EMPTY_TESTIMONIAL_FORM: TestimonialFormState = { author_name: "", content: "", image_url: "", rating: "5" };

type HeroSlideFormState = {
  id?: string;
  media_type: "image" | "video";
  image_url: string;
  image_url_desktop: string;
  video_url: string;
  alt_text: string;
  eyebrow: string;
  title: string;
  focus: string;
  destination_type: "none" | "collection" | "product" | "filter";
  destination_id: string;
  href: string;
  active: boolean;
};
const EMPTY_HERO_SLIDE_FORM: HeroSlideFormState = {
  media_type: "image",
  image_url: "",
  image_url_desktop: "",
  video_url: "",
  alt_text: "",
  eyebrow: "",
  title: "",
  focus: "center 30%",
  destination_type: "none",
  destination_id: "",
  href: "",
  active: true,
};

type FormState = {
  id?: string;
  slug: string;
  name: string;
  brand: string;
  model: string;
  description: string;
  price: string;
  compare_at_price: string;
  installmentsEnabled: boolean;
  installmentCount: string;
  installmentAmount: string;
  category: string;
  gender: string;
  specMaterial: string;
  specFormat: string;
  specWarranty: string;
  specLensType: string;
  specPackageContents: string;
  stock: string;
  sold_out: boolean;
  made_to_order: boolean;
  made_to_order_note: string;
  featured: boolean;
  more_sold: boolean;
  ai_tryon: boolean;
  sportivo: boolean;
  imagesText: string;
  colors: ProductColor[];
  downloads: ProductDownload[];
  collection_slugs: string[];
};

const EMPTY_FORM: FormState = {
  slug: "",
  name: "",
  brand: "",
  model: "",
  description: "",
  price: "",
  compare_at_price: "",
  installmentsEnabled: false,
  installmentCount: "10",
  installmentAmount: "",
  category: "Óculos de Sol",
  gender: "unissex",
  specMaterial: "",
  specFormat: "",
  specWarranty: "6 meses",
  specLensType: "",
  specPackageContents: "Óculos, Flanela, Estojo",
  stock: "1",
  sold_out: false,
  made_to_order: false,
  made_to_order_note: "",
  featured: false,
  more_sold: false,
  ai_tryon: false,
  sportivo: false,
  imagesText: "",
  colors: [],
  downloads: [],
  collection_slugs: [],
};

type CollectionFormState = {
  id?: string;
  name: string;
  slug: string;
  image_url: string;
};

const EMPTY_COLLECTION_FORM: CollectionFormState = { name: "", slug: "", image_url: "" };

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseNumber(value: string) {
  return Number.parseFloat(value.replace(",", ".") || "0");
}

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatWhatsAppDigits(digits: string) {
  const clean = digits.replace(/\D/g, "");
  if (clean.length <= 2) return clean;
  if (clean.length <= 7) return `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
  return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`;
}

function formatLeadDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [dragTarget, setDragTarget] = useState<"images" | "downloads" | "color" | "collection" | null>(null);

  const [collections, setCollections] = useState<Collection[]>([]);
  const [showCollectionForm, setShowCollectionForm] = useState(false);
  const [collectionForm, setCollectionForm] = useState<CollectionFormState>(EMPTY_COLLECTION_FORM);
  const [collectionSaving, setCollectionSaving] = useState(false);
  const [collectionUploading, setCollectionUploading] = useState(false);
  const [collectionError, setCollectionError] = useState("");

  const [leads, setLeads] = useState<Lead[]>([]);
  const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCart[]>([]);
  const [sentCartIds, setSentCartIds] = useState<string[]>([]);
  const [productClicks, setProductClicks] = useState<ProductClick[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [testimonialForm, setTestimonialForm] = useState<TestimonialFormState>(EMPTY_TESTIMONIAL_FORM);
  const [showTestimonialForm, setShowTestimonialForm] = useState(false);
  const [testimonialSaving, setTestimonialSaving] = useState(false);
  const [testimonialUploading, setTestimonialUploading] = useState(false);
  const [testimonialMessage, setTestimonialMessage] = useState("");
  const [shippingSettings, setShippingSettings] = useState<ShippingSettings>({ width: "15", height: "10", length: "20", weight: "0.5" });
  const [shippingSaving, setShippingSaving] = useState(false);
  const [shippingMessage, setShippingMessage] = useState("");
  const [promoBanner, setPromoBanner] = useState<PromoBannerSettings>({ image_url: "", alt_text: "Novidade da Ótica Líder Brasil", href: "", active: false, destination_type: "none", destination_id: "" });
  const [promoSaving, setPromoSaving] = useState(false);
  const [promoMessage, setPromoMessage] = useState("");
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [heroSlideForm, setHeroSlideForm] = useState<HeroSlideFormState>(EMPTY_HERO_SLIDE_FORM);
  const [showHeroSlideForm, setShowHeroSlideForm] = useState(false);
  const [heroSlideSaving, setHeroSlideSaving] = useState(false);
  const [heroSlideUploading, setHeroSlideUploading] = useState(false);
  const [heroSlideError, setHeroSlideError] = useState("");
  const [heroSlideDragActive, setHeroSlideDragActive] = useState(false);
  const [activeTab, setActiveTab] = useState<"produtos" | "colecoes" | "emails" | "carrinhos" | "metricas" | "frete" | "destaque" | "avaliacoes" | "slides">("produtos");
  const [shippingConnection, setShippingConnection] = useState<"checking" | "ok" | "down" | "unknown">("unknown");

  async function checkShippingConnection() {
    setShippingConnection("checking");
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) { setShippingConnection("unknown"); return; }
      const response = await fetch("/api/admin/shipping-status", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await response.json().catch(() => ({}));
      setShippingConnection(response.ok && data.connected ? "ok" : "down");
    } catch {
      setShippingConnection("unknown");
    }
  }

  useEffect(() => {
    try { setSentCartIds(JSON.parse(localStorage.getItem("otica-sent-cart-ids") || "[]")); } catch { setSentCartIds([]); }
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.push("/admin");
        return;
      }
      // Estar logado não basta — precisa estar na tabela admins. Um cliente
      // comum que criou conta pelo site NUNCA deve cair aqui.
      const { data: adminCheck } = await supabase.rpc("is_admin");
      if (!adminCheck) {
        await supabase.auth.signOut();
        router.push("/admin");
        return;
      }
      {
        setChecking(false);
        void loadProducts();
        void loadCollections();
        void loadLeads();
        void loadAbandonedCarts();
        void loadProductClicks();
        void loadTestimonials();
        void loadShippingSettings();
        void loadPromoBanner();
        void loadHeroSlides();
      }
    });
  }, [router]);

  function toggleSentCart(id: string) {
    setSentCartIds((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      localStorage.setItem("otica-sent-cart-ids", JSON.stringify(next));
      return next;
    });
  }

  async function loadProducts() {
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    setProducts((data as Product[]) ?? []);
  }

  async function loadCollections() {
    const { data } = await supabase.from("collections").select("*").order("sort_order", { ascending: true });
    setCollections((data as Collection[]) ?? []);
  }

  async function loadAbandonedCarts() {
    const { data } = await supabase.from("abandoned_carts").select("*").order("created_at", { ascending: false });
    setAbandonedCarts((data as AbandonedCart[]) ?? []);
  }

  async function loadProductClicks() {
    const { data } = await supabase.from("product_clicks").select("product_id, product_name, product_slug");
    setProductClicks((data as ProductClick[]) ?? []);
  }

  async function loadLeads() {
    const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    setLeads((data as Lead[]) ?? []);
  }

  async function loadTestimonials() {
    const { data } = await supabase.from("testimonials").select("*").order("created_at", { ascending: false });
    setTestimonials((data as Testimonial[]) ?? []);
  }

  function openNewTestimonialForm() {
    setTestimonialForm(EMPTY_TESTIMONIAL_FORM);
    setTestimonialMessage("");
    setShowTestimonialForm(true);
  }

  function openEditTestimonialForm(testimonial: Testimonial) {
    setTestimonialForm({ id: testimonial.id, author_name: testimonial.author_name, content: testimonial.content, image_url: testimonial.image_url || "", rating: String(testimonial.rating || 5) });
    setTestimonialMessage("");
    setShowTestimonialForm(true);
  }

  async function uploadTestimonialImage(file: File) {
    if (!file.type.startsWith("image/")) { setTestimonialMessage("Envie uma imagem JPG, PNG ou WebP."); return; }
    setTestimonialUploading(true);
    setTestimonialMessage("");
    const compressed = await compressImageFile(file);
    const extension = compressed.name.split(".").pop() || "jpg";
    const path = `testimonials/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from("product-media").upload(path, compressed, { upsert: true, contentType: compressed.type });
    if (error) setTestimonialMessage(error.message);
    else {
      const { data } = supabase.storage.from("product-media").getPublicUrl(path);
      setTestimonialForm((current) => ({ ...current, image_url: data.publicUrl }));
      setTestimonialMessage("Foto carregada. Salve a avaliação para publicar.");
    }
    setTestimonialUploading(false);
  }

  async function saveTestimonial(event: React.FormEvent) {
    event.preventDefault();
    if (!testimonialForm.author_name.trim()) { setTestimonialMessage("Preencha o nome da avaliação."); return; }
    setTestimonialSaving(true);
    const payload = { author_name: testimonialForm.author_name.trim(), content: testimonialForm.content.trim(), image_url: testimonialForm.image_url.trim(), rating: Math.min(5, Math.max(1, Number(testimonialForm.rating) || 5)) };
    const query = testimonialForm.id ? supabase.from("testimonials").update(payload).eq("id", testimonialForm.id) : supabase.from("testimonials").insert(payload);
    const { error } = await query;
    setTestimonialMessage(error ? "Não foi possível salvar. Rode a atualização da tabela testimonials no Supabase." : "Avaliação salva e publicada na home.");
    if (!error) { setShowTestimonialForm(false); await loadTestimonials(); }
    setTestimonialSaving(false);
  }

  async function deleteTestimonial(id: string) {
    if (!window.confirm("Remover esta avaliação da home?")) return;
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    if (error) setTestimonialMessage("Não foi possível remover a avaliação."); else await loadTestimonials();
  }

  async function loadShippingSettings() {
    const { data } = await supabase.from("shipping_settings").select("width, height, length, weight").eq("id", 1).maybeSingle();
    if (data) setShippingSettings({ width: String(data.width), height: String(data.height), length: String(data.length), weight: String(data.weight) });
  }

  async function saveShippingSettings(event: React.FormEvent) {
    event.preventDefault();
    setShippingSaving(true);
    setShippingMessage("");
    const values = {
      width: Number(shippingSettings.width.replace(",", ".")),
      height: Number(shippingSettings.height.replace(",", ".")),
      length: Number(shippingSettings.length.replace(",", ".")),
      weight: Number(shippingSettings.weight.replace(",", ".")),
    };
    if (Object.values(values).some((value) => !Number.isFinite(value) || value <= 0)) {
      setShippingMessage("Informe valores maiores que zero.");
      setShippingSaving(false);
      return;
    }
    const { error } = await supabase.from("shipping_settings").upsert({ id: 1, ...values, updated_at: new Date().toISOString() });
    setShippingMessage(error ? "Não foi possível salvar. Crie a tabela shipping_settings no Supabase primeiro." : "Medidas salvas. Os próximos cálculos usarão esta embalagem.");
    setShippingSaving(false);
  }

  async function loadPromoBanner() {
    const { data } = await supabase.from("promo_banner").select("image_url, alt_text, href, active, destination_type, destination_id").eq("id", 1).maybeSingle();
    if (data) setPromoBanner({ image_url: data.image_url || "", alt_text: data.alt_text || "Novidade da Ótica Líder Brasil", href: data.href || "", active: Boolean(data.active), destination_type: data.destination_type || "none", destination_id: data.destination_id || "" });
  }

  async function uploadPromoBanner(file: File) {
    if (!file.type.startsWith("image/")) { setPromoMessage("Envie uma imagem JPG, PNG ou WebP."); return; }
    setPromoSaving(true);
    setPromoMessage("");
    const compressed = await compressImageFile(file);
    const extension = compressed.name.split(".").pop() || "jpg";
    const path = `promo-banner/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from("product-media").upload(path, compressed, { upsert: true, contentType: compressed.type });
    if (error) setPromoMessage(error.message);
    else {
      const { data } = supabase.storage.from("product-media").getPublicUrl(path);
      setPromoBanner((current) => ({ ...current, image_url: data.publicUrl }));
      setPromoMessage("Imagem carregada. Clique em Salvar destaque.");
    }
    setPromoSaving(false);
  }

  async function savePromoBanner(event: React.FormEvent) {
    event.preventDefault();
    setPromoSaving(true);
    const { error } = await supabase.from("promo_banner").upsert({ id: 1, ...promoBanner, updated_at: new Date().toISOString() });
    setPromoMessage(error ? "Não foi possível salvar. Crie a tabela promo_banner no Supabase primeiro." : promoBanner.active ? "Destaque ativado na home." : "Destaque salvo e desativado.");
    setPromoSaving(false);
  }

  async function loadHeroSlides() {
    const { data } = await supabase.from("hero_slides").select("*").order("sort_order", { ascending: true });
    setHeroSlides((data as HeroSlide[]) ?? []);
  }

  function openNewHeroSlideForm() {
    setHeroSlideForm(EMPTY_HERO_SLIDE_FORM);
    setHeroSlideError("");
    setShowHeroSlideForm(true);
  }

  function openEditHeroSlideForm(slide: HeroSlide) {
    setHeroSlideForm({
      id: slide.id,
      media_type: slide.media_type === "video" ? "video" : "image",
      image_url: slide.image_url || "",
      image_url_desktop: slide.image_url_desktop || "",
      video_url: slide.video_url || "",
      alt_text: slide.alt_text || "",
      eyebrow: slide.eyebrow || "",
      title: slide.title || "",
      focus: slide.focus || "center 30%",
      destination_type: slide.destination_type || "none",
      destination_id: slide.destination_id || "",
      href: slide.href || "",
      active: slide.active !== false,
    });
    setHeroSlideError("");
    setShowHeroSlideForm(true);
  }

  // Foto: comprime como as demais imagens do site. Vídeo: envia direto (não dá pra
  // comprimir vídeo no navegador aqui), só valida um limite de tamanho razoável.
  async function uploadHeroSlideFile(file: File, field: "image_url" | "image_url_desktop" | "video_url") {
    const isVideo = field === "video_url";
    if (isVideo && !file.type.startsWith("video/")) { setHeroSlideError("Envie um arquivo de vídeo (MP4 ou WebM)."); return; }
    if (!isVideo && !file.type.startsWith("image/")) { setHeroSlideError("Envie uma imagem JPG, PNG ou WebP."); return; }
    if (isVideo && file.size > 30 * 1024 * 1024) { setHeroSlideError("Vídeo muito grande (máx. 30 MB). Comprima antes de enviar."); return; }

    setHeroSlideUploading(true);
    setHeroSlideError("");
    const toUpload = isVideo ? file : await compressImageFile(file);
    const extension = toUpload.name.split(".").pop() || (isVideo ? "mp4" : "jpg");
    const path = `hero-slides/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from("product-media").upload(path, toUpload, { upsert: true, contentType: toUpload.type });
    if (error) {
      setHeroSlideError(error.message);
    } else {
      const { data } = supabase.storage.from("product-media").getPublicUrl(path);
      setHeroSlideForm((current) => ({ ...current, [field]: data.publicUrl, media_type: isVideo ? "video" : current.media_type }));
    }
    setHeroSlideUploading(false);
  }

  function handleHeroSlideDrop(event: React.DragEvent<HTMLDivElement>, field: "image_url" | "image_url_desktop" | "video_url") {
    event.preventDefault();
    setHeroSlideDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void uploadHeroSlideFile(file, field);
  }

  async function handleSaveHeroSlide(event: React.FormEvent) {
    event.preventDefault();
    if (heroSlideForm.media_type === "image" && !heroSlideForm.image_url.trim()) {
      setHeroSlideError("Envie ao menos a foto (versão mobile).");
      return;
    }
    if (heroSlideForm.media_type === "video" && !heroSlideForm.video_url.trim()) {
      setHeroSlideError("Envie o arquivo de vídeo.");
      return;
    }
    setHeroSlideSaving(true);
    setHeroSlideError("");

    const payload = {
      media_type: heroSlideForm.media_type,
      image_url: heroSlideForm.image_url.trim(),
      image_url_desktop: heroSlideForm.image_url_desktop.trim(),
      video_url: heroSlideForm.video_url.trim(),
      alt_text: heroSlideForm.alt_text.trim(),
      eyebrow: heroSlideForm.eyebrow.trim(),
      title: heroSlideForm.title.trim(),
      focus: heroSlideForm.focus.trim() || "center 30%",
      destination_type: heroSlideForm.destination_type,
      destination_id: heroSlideForm.destination_id,
      href: heroSlideForm.href.trim(),
      active: heroSlideForm.active,
      updated_at: new Date().toISOString(),
      sort_order: heroSlideForm.id ? undefined : heroSlides.length,
    };

    const result = heroSlideForm.id
      ? await supabase.from("hero_slides").update(payload).eq("id", heroSlideForm.id)
      : await supabase.from("hero_slides").insert(payload);

    if (result.error) {
      setHeroSlideError(result.error.message.includes("does not exist") ? "Crie a tabela hero_slides no Supabase primeiro (veja supabase/migrations/add_hero_slides.sql)." : result.error.message);
      setHeroSlideSaving(false);
      return;
    }

    setHeroSlideSaving(false);
    setShowHeroSlideForm(false);
    await loadHeroSlides();
  }

  async function handleDeleteHeroSlide(slide: HeroSlide) {
    if (!confirm(`Apagar este slide${slide.title ? ` ("${slide.title}")` : ""}?`)) return;
    await supabase.from("hero_slides").delete().eq("id", slide.id);
    await loadHeroSlides();
  }

  async function toggleHeroSlideActive(slide: HeroSlide) {
    await supabase.from("hero_slides").update({ active: !slide.active }).eq("id", slide.id);
    await loadHeroSlides();
  }

  async function moveHeroSlide(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= heroSlides.length) return;
    const reordered = [...heroSlides];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setHeroSlides(reordered);
    await Promise.all(
      reordered.map((slide, sortIndex) => supabase.from("hero_slides").update({ sort_order: sortIndex }).eq("id", slide.id))
    );
  }

  function openNewCollectionForm() {
    setCollectionForm(EMPTY_COLLECTION_FORM);
    setCollectionError("");
    setShowCollectionForm(true);
  }

  function openEditCollectionForm(collection: Collection) {
    setCollectionForm({ id: collection.id, name: collection.name, slug: collection.slug, image_url: collection.image_url ?? "" });
    setCollectionError("");
    setShowCollectionForm(true);
  }

  async function uploadCollectionImage(fileList: FileList | File[]) {
    const files = Array.from(fileList).filter((file) => file.type.startsWith("image/"));
    if (files.length === 0) {
      setCollectionError("Solte um arquivo de imagem (JPG, PNG ou WebP).");
      return;
    }
    setCollectionUploading(true);
    setCollectionError("");
    try {
      const file = await compressImageFile(files[0]);
      const extension = file.name.split(".").pop() || "jpg";
      const path = `collections/${crypto.randomUUID()}.${extension}`;
      const { error } = await supabase.storage.from("product-media").upload(path, file, { upsert: true, contentType: file.type || undefined });
      if (error) throw error;
      const { data } = supabase.storage.from("product-media").getPublicUrl(path);
      setCollectionForm((current) => ({ ...current, image_url: data.publicUrl }));
    } catch (error) {
      setCollectionError(error instanceof Error ? error.message : "Não foi possível enviar a imagem.");
    } finally {
      setCollectionUploading(false);
    }
  }

  function handleCollectionImageDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragTarget(null);
    void uploadCollectionImage(event.dataTransfer.files);
  }

  async function handleSaveCollection(event: React.FormEvent) {
    event.preventDefault();
    if (!collectionForm.name.trim()) return;
    setCollectionSaving(true);
    setCollectionError("");

    const payload = {
      name: collectionForm.name.trim(),
      slug: collectionForm.slug.trim() || slugify(collectionForm.name),
      image_url: collectionForm.image_url.trim(),
      sort_order: collectionForm.id ? undefined : collections.length,
    };

    const result = collectionForm.id
      ? await supabase.from("collections").update(payload).eq("id", collectionForm.id)
      : await supabase.from("collections").insert(payload);

    if (result.error) {
      setCollectionError(result.error.message);
      setCollectionSaving(false);
      return;
    }

    setCollectionSaving(false);
    setShowCollectionForm(false);
    await loadCollections();
  }

  async function handleDeleteCollection(collection: Collection) {
    if (!confirm(`Apagar a coleção "${collection.name}"? Os produtos continuam salvos, só saem dessa vitrine.`)) return;
    await supabase.from("collections").delete().eq("id", collection.id);
    await loadCollections();
  }

  async function moveCollection(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= collections.length) return;
    const reordered = [...collections];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setCollections(reordered);
    await Promise.all(
      reordered.map((collection, sortIndex) => supabase.from("collections").update({ sort_order: sortIndex }).eq("id", collection.id))
    );
  }

  function toggleFormCollection(slug: string) {
    setForm((current) => {
      const has = current.collection_slugs.includes(slug);
      return { ...current, collection_slugs: has ? current.collection_slugs.filter((item) => item !== slug) : [...current.collection_slugs, slug] };
    });
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin");
  }

  function openNewForm() {
    setForm({ ...EMPTY_FORM, colors: [], downloads: [], collection_slugs: [] });
    setSelectedColorIndex(0);
    setUploadError("");
    setSaveError("");
    setShowForm(true);
  }

  function openEditForm(product: Product) {
    setForm({
      id: product.id,
      slug: product.slug,
      name: product.name,
      brand: product.brand ?? "",
      model: product.model ?? product.name ?? "",
      description: product.description ?? "",
      price: String(product.price ?? ""),
      compare_at_price: product.compare_at_price ? String(product.compare_at_price) : "",
      installmentsEnabled: Boolean(product.installments?.enabled),
      installmentCount: product.installments?.count ? String(product.installments.count) : "10",
      installmentAmount: product.installments?.amount ? String(product.installments.amount) : "",
      category: product.category ?? "Óculos de Sol",
      gender: product.gender ?? "unissex",
      specMaterial: product.specifications?.material ?? "",
      specFormat: product.specifications?.format ?? "",
      specWarranty: product.specifications?.warranty ?? "6 meses",
      specLensType: product.specifications?.lens_type ?? "",
      specPackageContents: product.specifications?.package_contents ?? "Óculos, Flanela, Estojo",
      stock: String(product.stock ?? 0),
      sold_out: Boolean(product.sold_out),
      made_to_order: Boolean(product.made_to_order),
      made_to_order_note: product.made_to_order_note ?? "",
      featured: product.featured ?? false,
      more_sold: product.more_sold ?? false,
      ai_tryon: product.ai_tryon ?? false,
      sportivo: product.sportivo ?? false,
      imagesText: (product.images ?? []).join("\n"),
      colors: (product.colors ?? []).map((color) => ({ ...color, images: color.images?.length ? color.images : color.image_url ? [color.image_url] : [] })),
      downloads: product.downloads ?? [],
      collection_slugs: product.collection_slugs ?? [],
    });
    setSelectedColorIndex(0);
    setUploadError("");
    setSaveError("");
    setShowForm(true);
  }

  function addColorField() {
    setForm((current) => ({
      ...current,
      colors: [...current.colors, { name: "Nova cor", hex: "#B88A45", frame_color: "", lens_color: "", image_url: "", images: [] }],
    }));
    setSelectedColorIndex(form.colors.length);
  }

  function updateColorField(index: number, field: keyof ProductColor, value: string) {
    setForm((current) => {
      const colors = [...current.colors];
      colors[index] = { ...colors[index], [field]: value };
      return { ...current, colors };
    });
  }

  function updateColorImagesText(index: number, value: string) {
    const images = value.split("\n");
    setForm((current) => {
      const colors = [...current.colors];
      const firstNonEmpty = images.find((item) => item.trim()) || "";
      colors[index] = { ...colors[index], images, image_url: colors[index].image_url || firstNonEmpty };
      return { ...current, colors };
    });
  }

  async function uploadColorImages(fileList: FileList | File[], index: number) {
    const files = Array.from(fileList).filter((file) => file.type.startsWith("image/"));
    if (files.length === 0) {
      setUploadError("Solte arquivos de imagem (JPG, PNG ou WebP) para esta cor.");
      return;
    }

    setUploading(true);
    setUploadError("");
    try {
      const uploadedUrls: string[] = [];
      const compressedFiles = await compressImageFiles(files);
      for (const file of compressedFiles) {
        const extension = file.name.split(".").pop() || "jpg";
        const folder = form.id || `draft-${Date.now()}`;
        const path = `products/${folder}/colors/${index}-${crypto.randomUUID()}.${extension}`;
        const { error } = await supabase.storage.from("product-media").upload(path, file, { upsert: true, contentType: file.type || undefined });
        if (error) throw error;
        const { data } = supabase.storage.from("product-media").getPublicUrl(path);
        uploadedUrls.push(data.publicUrl);
      }
      setForm((current) => {
        const colors = [...current.colors];
        const existingImages = colors[index]?.images ?? [];
        colors[index] = { ...colors[index], images: [...existingImages, ...uploadedUrls], image_url: colors[index].image_url || uploadedUrls[0] || "" };
        return { ...current, colors };
      });
    } catch (error) {
      setUploadError(error instanceof Error ? `${error.message} Verifique se o bucket público “product-media” existe no Storage.` : "Não foi possível enviar as imagens desta cor.");
    } finally {
      setUploading(false);
    }
  }

  function handleColorDrop(event: React.DragEvent<HTMLDivElement>, index: number) {
    event.preventDefault();
    setDragTarget(null);
    void uploadColorImages(event.dataTransfer.files, index);
  }

  function removeColorImage(colorIndex: number, imageIndex: number) {
    setForm((current) => {
      const colors = [...current.colors];
      const images = (colors[colorIndex].images ?? []).filter((_, index) => index !== imageIndex);
      colors[colorIndex] = { ...colors[colorIndex], images, image_url: images[0] || "" };
      return { ...current, colors };
    });
  }

  function toggleColorSoldOut(index: number) {
    setForm((current) => {
      const colors = [...current.colors];
      colors[index] = { ...colors[index], sold_out: !colors[index].sold_out };
      return { ...current, colors };
    });
  }

  function removeColorField(index: number) {
    setForm((current) => ({ ...current, colors: current.colors.filter((_, colorIndex) => colorIndex !== index) }));
    setSelectedColorIndex(Math.max(0, Math.min(index - 1, form.colors.length - 2)));
  }

  function removeDownload(index: number) {
    setForm((current) => ({ ...current, downloads: current.downloads.filter((_, itemIndex) => itemIndex !== index) }));
  }

  async function uploadFiles(fileList: FileList | File[], target: "images" | "downloads") {
    const files = Array.from(fileList);
    const acceptedFiles = files.filter((file) => target === "images" ? file.type.startsWith("image/") : file.type === "application/pdf" || file.type.includes("word") || file.type.includes("zip") || file.type.startsWith("text/"));

    if (acceptedFiles.length === 0) {
      setUploadError(target === "images" ? "Solte arquivos de imagem (JPG, PNG ou WebP)." : "Solte PDF, DOC, DOCX, ZIP ou TXT.");
      return;
    }

    setUploading(true);
    setUploadError("");
    try {
      const uploadedUrls: string[] = [];
      const uploadedDownloads: ProductDownload[] = [];
      const filesToUpload = target === "images" ? await compressImageFiles(acceptedFiles) : acceptedFiles;
      for (const file of filesToUpload) {
        const extension = file.name.split(".").pop() || "file";
        const folder = form.id || `draft-${Date.now()}`;
        const path = `products/${folder}/${crypto.randomUUID()}.${extension}`;
        const { error } = await supabase.storage.from("product-media").upload(path, file, { upsert: true, contentType: file.type || undefined });
        if (error) throw error;
        const { data } = supabase.storage.from("product-media").getPublicUrl(path);
        if (target === "images") uploadedUrls.push(data.publicUrl);
        else uploadedDownloads.push({ name: file.name, url: data.publicUrl, type: file.type });
      }
      if (uploadedUrls.length > 0) {
        setForm((current) => ({ ...current, imagesText: [...current.imagesText.split("\n").map((value) => value.trim()).filter(Boolean), ...uploadedUrls].join("\n") }));
      }
      if (uploadedDownloads.length > 0) {
        setForm((current) => ({ ...current, downloads: [...current.downloads, ...uploadedDownloads] }));
      }
    } catch (error) {
      setUploadError(error instanceof Error ? `${error.message} Verifique se o bucket público “product-media” existe no Storage.` : "Não foi possível enviar o arquivo.");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>, target: "images" | "downloads") {
    event.preventDefault();
    setDragTarget(null);
    void uploadFiles(event.dataTransfer.files, target);
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setSaveError("");

    const price = parseNumber(form.price);
    const compareAtPrice = form.compare_at_price ? parseNumber(form.compare_at_price) : null;
    const payload = {
      slug: form.slug || slugify(form.name),
      name: form.model.trim() || form.name.trim() || form.brand.trim(),
      description: form.description,
      price,
      compare_at_price: compareAtPrice,
      installments: form.installmentsEnabled && parseNumber(form.installmentAmount) > 0 ? { enabled: true, count: Number.parseInt(form.installmentCount || "1", 10), amount: parseNumber(form.installmentAmount) } : null,
      brand: form.brand.trim(),
      model: form.model.trim(),
      category: form.category,
      gender: form.gender,
      specifications: {
        material: form.specMaterial.trim(),
        format: form.specFormat.trim(),
        warranty: form.specWarranty.trim(),
        lens_type: form.specLensType.trim(),
        package_contents: form.specPackageContents.trim(),
      },
      stock: Number.parseInt(form.stock || "0", 10),
      sold_out: form.sold_out,
      made_to_order: form.made_to_order,
      made_to_order_note: form.made_to_order_note.trim(),
      featured: form.featured,
      more_sold: form.more_sold,
      ai_tryon: form.ai_tryon,
      sportivo: form.sportivo,
      images: form.imagesText.split("\n").map((value) => value.trim()).filter(Boolean),
      colors: form.colors.filter((color) => color.name.trim()).map((color) => { const images = (color.images?.length ? color.images : color.image_url ? [color.image_url] : []).map((image) => image.trim()).filter(Boolean); return { ...color, images, image_url: images[0] || undefined }; }),
      downloads: form.downloads.filter((download) => download.name.trim() && download.url.trim()),
      collection_slugs: form.collection_slugs,
    };

    const result = form.id
      ? await supabase.from("products").update(payload).eq("id", form.id)
      : await supabase.from("products").insert(payload);

    if (result.error) {
      setSaveError(result.error.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    setShowForm(false);
    await loadProducts();
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que quer apagar este produto?")) return;
    await supabase.from("products").delete().eq("id", id);
    await loadProducts();
  }

  async function toggleProductSoldOut(product: Product) {
    const next = !product.sold_out;
    setProducts((current) => current.map((item) => (item.id === product.id ? { ...item, sold_out: next } : item)));
    const { error } = await supabase.from("products").update({ sold_out: next }).eq("id", product.id);
    if (error) {
      alert(`Não foi possível atualizar: ${error.message}`);
      await loadProducts();
    }
  }

  const discountPreview = useMemo(
    () => calculateDiscountPercent(parseNumber(form.price), parseNumber(form.compare_at_price)),
    [form.price, form.compare_at_price]
  );

  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => Number(isProductSoldOut(a)) - Number(isProductSoldOut(b))),
    [products]
  );

  if (checking) return <p className="section-shell py-20 text-center font-body text-sm text-brand-ink/60">Carregando painel...</p>;

  return (
    <main className="section-shell py-8 sm:py-12">
      <div className="mb-8 flex flex-col gap-5 border-b border-brand-ink/10 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Gestão da vitrine</p>
          <h1 className="mt-2 font-heading text-4xl font-semibold tracking-[-0.04em] text-brand-ink">
            {activeTab === "produtos" ? "Produtos" : activeTab === "colecoes" ? "Coleções" : activeTab === "emails" ? "E-mails cadastrados" : activeTab === "carrinhos" ? "Carrinhos abandonados" : activeTab === "metricas" ? "Métricas da vitrine" : activeTab === "frete" ? "Frete" : activeTab === "avaliacoes" ? "Avaliações" : activeTab === "slides" ? "Carrossel da home" : "Destaque"}
          </h1>
          <p className="mt-2 font-body text-sm text-brand-ink/55">
            {activeTab === "produtos"
              ? "Cadastre imagens, variações, ofertas e materiais em um só lugar."
              : activeTab === "colecoes"
              ? "Gerencie as vitrines de marcas e recortes que aparecem na home."
              : activeTab === "emails" ? "Contatos que se cadastraram pelo formulário do final da home." : activeTab === "carrinhos" ? "Contatos que pediram para guardar os óculos da sacola." : activeTab === "metricas" ? "Produtos mais clicados desde que o rastreamento foi ativado." : activeTab === "frete" ? "Configure o pacote usado no cálculo automático de frete." : activeTab === "avaliacoes" ? "Publique avaliações do Google com foto, texto e estrelas." : activeTab === "slides" ? "Troque as fotos ou vídeos que passam no topo da home e escolha para onde cada um leva ao ser clicado." : "Publique uma novidade opcional na home."}
          </p>
        </div>
        <div className="flex gap-3">
          {activeTab === "produtos" && <button onClick={openNewForm} className="btn-brand"><Plus size={15} className="mr-2" /> Novo produto</button>}
          {activeTab === "slides" && <button onClick={openNewHeroSlideForm} className="btn-brand"><Plus size={15} className="mr-2" /> Novo slide</button>}
          <button onClick={handleLogout} className="btn-brand-outline"><LogOut size={15} className="mr-2" /> Sair</button>
        </div>
      </div>

      <div className="mb-8 flex gap-2 border-b border-brand-ink/10">
        {([
          { key: "produtos", label: "Produtos" },
          { key: "colecoes", label: "Coleções" },
          { key: "slides", label: `Carrossel da home${heroSlides.length > 0 ? ` (${heroSlides.length})` : ""}` },
          { key: "emails", label: `E-mails cadastrados${leads.length > 0 ? ` (${leads.length})` : ""}` },
          { key: "carrinhos", label: `Carrinhos${abandonedCarts.length > 0 ? ` (${abandonedCarts.length})` : ""}` },
          { key: "metricas", label: "Métricas" },
          { key: "frete", label: "Frete" },
          { key: "avaliacoes", label: `Avaliações${testimonials.length > 0 ? ` (${testimonials.length})` : ""}` },
          { key: "destaque", label: "Destaque" },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              if (tab.key === "frete" && shippingConnection === "unknown") void checkShippingConnection();
            }}
            className={`border-b-2 px-4 py-3 font-body text-sm font-semibold transition-colors ${
              activeTab === tab.key ? "border-brand-gold text-brand-ink" : "border-transparent text-brand-ink/45 hover:text-brand-ink"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "destaque" && (
        <section className="max-w-3xl rounded-[1.5rem] bg-brand-paper p-6 shadow-card sm:p-8">
          <p className="eyebrow">Novidade na home</p>
          <h2 className="mt-2 font-heading text-2xl font-semibold text-brand-ink">Destaque promocional</h2>
          <p className="mt-2 font-body text-sm leading-6 text-brand-ink/55">Envie uma imagem horizontal, ative quando quiser e desative para removê-la da home sem apagar o arquivo.</p>
          <form onSubmit={savePromoBanner} className="mt-6 space-y-4">
            <label className="block font-body text-xs font-semibold text-brand-ink/65">Imagem (JPG, PNG ou WebP)
              <input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadPromoBanner(file); }} className="mt-2 block w-full rounded-xl border border-dashed border-brand-ink/20 bg-brand-cream px-4 py-4 font-body text-sm" />
            </label>
            {promoBanner.image_url && <img src={promoBanner.image_url} alt="Prévia do destaque" className="aspect-[16/9] w-full rounded-xl object-cover" />}
            <label className="block font-body text-xs font-semibold text-brand-ink/65">Texto alternativo
              <input value={promoBanner.alt_text} onChange={(event) => setPromoBanner((current) => ({ ...current, alt_text: event.target.value }))} className="input-premium mt-1" />
            </label>
            <label className="block font-body text-xs font-semibold text-brand-ink/65">Ao clicar no destaque, levar para
              <select value={promoBanner.destination_type === "none" ? "none" : `${promoBanner.destination_type}:${promoBanner.destination_id}`} onChange={(event) => {
                const [type, id = ""] = event.target.value.split(":");
                const destinationType = type as PromoBannerSettings["destination_type"];
                const href = destinationType === "collection" ? `/produtos?colecao=${encodeURIComponent(id)}` : destinationType === "product" ? `/produtos/${encodeURIComponent(id)}` : "";
                setPromoBanner((current) => ({ ...current, destination_type: destinationType, destination_id: id, href }));
              }} className="input-premium mt-1">
                <option value="none">Nenhum destino</option>
                <optgroup label="Coleções">
                  {collections.map((collection) => <option key={collection.id} value={`collection:${collection.slug}`}>{collection.name}</option>)}
                </optgroup>
                <optgroup label="Produtos">
                  {products.map((product) => <option key={product.id} value={`product:${product.slug}`}>{product.name}</option>)}
                </optgroup>
              </select>
            </label>
            <label className="flex items-center gap-3 font-body text-sm font-semibold text-brand-ink/70"><input type="checkbox" checked={promoBanner.active} onChange={(event) => setPromoBanner((current) => ({ ...current, active: event.target.checked }))} className="h-4 w-4 accent-brand-gold" /> Mostrar destaque na home</label>
            <div className="flex items-center gap-4"><button type="submit" disabled={promoSaving || !promoBanner.image_url} className="btn-brand">{promoSaving ? "Salvando..." : "Salvar destaque"}</button>{promoMessage && <p className="font-body text-sm text-brand-ink/65">{promoMessage}</p>}</div>
          </form>
        </section>
      )}

      {activeTab === "avaliacoes" && (
        <section className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="eyebrow">Prova social</p><h2 className="mt-2 font-heading text-2xl font-semibold text-brand-ink">Avaliações do Google</h2><p className="mt-2 max-w-2xl font-body text-sm leading-6 text-brand-ink/55">Cadastre manualmente as avaliações que você já tem no Google. Elas aparecerão em grupos de até três no final da home.</p></div>
            <button type="button" onClick={openNewTestimonialForm} className="btn-brand shrink-0"><Plus size={15} className="mr-2" /> Nova avaliação</button>
          </div>
          {showTestimonialForm && <form onSubmit={saveTestimonial} className="max-w-2xl rounded-[1.5rem] bg-brand-paper p-6 shadow-card sm:p-8"><div className="grid gap-4 sm:grid-cols-2"><label className="font-body text-xs font-semibold text-brand-ink/65">Nome do cliente<input required value={testimonialForm.author_name} onChange={(event) => setTestimonialForm((current) => ({ ...current, author_name: event.target.value }))} className="input-premium mt-1" /></label><label className="font-body text-xs font-semibold text-brand-ink/65">Estrelas<select value={testimonialForm.rating} onChange={(event) => setTestimonialForm((current) => ({ ...current, rating: event.target.value }))} className="input-premium mt-1">{[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} estrelas</option>)}</select></label></div><label className="mt-4 block font-body text-xs font-semibold text-brand-ink/65">Texto da avaliação<textarea value={testimonialForm.content} onChange={(event) => setTestimonialForm((current) => ({ ...current, content: event.target.value }))} className="input-premium mt-1 min-h-28 resize-y" /></label><div className="mt-4"><p className="font-body text-xs font-semibold text-brand-ink/65">Foto do cliente (opcional)</p><label className="mt-1 flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-brand-ink/20 bg-brand-cream px-4 py-4 font-body text-sm text-brand-ink/65 hover:border-brand-gold"><UploadCloud size={18} className="mr-2 text-brand-gold" />{testimonialUploading ? "Enviando foto..." : "Escolher arquivo"}<input type="file" accept="image/*" disabled={testimonialUploading} onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadTestimonialImage(file); }} className="sr-only" /></label>{testimonialForm.image_url && <img src={testimonialForm.image_url} alt="Prévia da avaliação" className="mt-3 h-20 w-20 rounded-full object-cover" />}<p className="mt-2 font-body text-xs leading-5 text-brand-ink/45">A foto será enviada ao armazenamento do site. Use somente uma imagem autorizada pelo cliente.</p></div><div className="mt-5 flex flex-wrap items-center gap-3"><button type="submit" disabled={testimonialSaving || testimonialUploading} className="btn-brand">{testimonialSaving ? "Salvando..." : "Salvar avaliação"}</button><button type="button" onClick={() => setShowTestimonialForm(false)} className="btn-brand-outline">Cancelar</button>{testimonialMessage && <span className="font-body text-sm text-brand-ink/60">{testimonialMessage}</span>}</div></form>}
          {testimonials.length === 0 ? <div className="rounded-2xl border border-dashed border-brand-ink/15 bg-brand-paper px-6 py-10 text-center font-body text-sm text-brand-ink/50">Nenhuma avaliação cadastrada.</div> : <div className="grid gap-4 md:grid-cols-2">{testimonials.map((testimonial) => <article key={testimonial.id} className="rounded-2xl bg-brand-paper p-5 shadow-card"><div className="flex items-start justify-between gap-3"><div><h3 className="font-heading text-lg font-semibold text-brand-ink">{testimonial.author_name}</h3><p className="mt-1 text-sm text-brand-gold">{"★".repeat(testimonial.rating || 5)}{"☆".repeat(5 - (testimonial.rating || 5))}</p></div><div className="flex gap-3"><button type="button" onClick={() => openEditTestimonialForm(testimonial)} className="text-brand-ink/55 hover:text-brand-gold" aria-label={`Editar avaliação de ${testimonial.author_name}`}><Pencil size={17} /></button><button type="button" onClick={() => void deleteTestimonial(testimonial.id)} className="text-brand-ink/40 hover:text-red-600" aria-label={`Remover avaliação de ${testimonial.author_name}`}><Trash2 size={17} /></button></div></div><p className="mt-4 font-body text-sm leading-6 text-brand-ink/65">“{testimonial.content}”</p></article>)}</div>}
        </section>
      )}

      {activeTab === "frete" && (
        <section className="max-w-2xl rounded-[1.5rem] bg-brand-paper p-6 shadow-card sm:p-8">
          <div className={`mb-6 flex items-center gap-3 rounded-xl px-4 py-3 ${
            shippingConnection === "ok" ? "bg-green-50 text-green-800" :
            shippingConnection === "down" ? "bg-red-50 text-red-700" :
            "bg-brand-cream text-brand-ink/60"
          }`}>
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${
              shippingConnection === "ok" ? "bg-green-600" :
              shippingConnection === "down" ? "bg-red-600" :
              shippingConnection === "checking" ? "animate-pulse bg-brand-ink/40" :
              "bg-brand-ink/30"
            }`} />
            <p className="font-body text-sm font-medium">
              {shippingConnection === "ok" && "Cotação automática de frete funcionando normalmente."}
              {shippingConnection === "down" && "Cotação automática indisponível — os clientes estão vendo \"confirmar pelo WhatsApp\" no lugar do preço do frete. Pode ser hora de reautorizar o Melhor Envio (veja o README)."}
              {shippingConnection === "checking" && "Verificando conexão com o Melhor Envio..."}
              {shippingConnection === "unknown" && "Status ainda não verificado."}
            </p>
            <button type="button" onClick={() => void checkShippingConnection()} className="ml-auto shrink-0 font-body text-xs font-semibold uppercase tracking-[0.08em] text-brand-ink/50 hover:text-brand-gold">
              Verificar agora
            </button>
          </div>
          <p className="eyebrow">Embalagem padrão</p>
          <h2 className="mt-2 font-heading text-2xl font-semibold text-brand-ink">Peso e dimensões para o cálculo</h2>
          <p className="mt-2 font-body text-sm leading-6 text-brand-ink/55">Informe as medidas externas da caixa fechada, em centímetros, e o peso total do pacote, em quilogramas.</p>
          <form onSubmit={saveShippingSettings} className="mt-6 grid gap-4 sm:grid-cols-2">
            {([['width', 'Largura (cm)'], ['height', 'Altura (cm)'], ['length', 'Comprimento (cm)'], ['weight', 'Peso (kg)']] as const).map(([key, label]) => (
              <label key={key} className="font-body text-xs font-semibold text-brand-ink/65">
                {label}
                <input required type="number" min="0.001" step="0.001" value={shippingSettings[key]} onChange={(event) => setShippingSettings((current) => ({ ...current, [key]: event.target.value }))} className="input-premium mt-1" />
              </label>
            ))}
            <div className="sm:col-span-2 flex items-center gap-4">
              <button type="submit" disabled={shippingSaving} className="btn-brand">{shippingSaving ? "Salvando..." : "Salvar medidas"}</button>
              {shippingMessage && <p className="font-body text-sm text-brand-ink/65">{shippingMessage}</p>}
            </div>
          </form>
        </section>
      )}

      {activeTab === "colecoes" && (
      <section className="mb-10">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Vitrines da home</p>
            <h2 className="mt-1 font-heading text-2xl font-semibold text-brand-ink">Marcas e coleções</h2>
            <p className="mt-1 font-body text-xs leading-5 text-brand-ink/50">Ex.: Ray-Ban, Voogue, HB, Ciclista. Cada uma vira um retângulo clicável na home — o mesmo produto pode aparecer em quantas você quiser.</p>
          </div>
          <button onClick={openNewCollectionForm} className="btn-brand-outline shrink-0"><Plus size={15} className="mr-2" /> Nova coleção</button>
        </div>

        {collections.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-brand-ink/15 bg-brand-paper px-6 py-8 text-center font-body text-sm text-brand-ink/50">Nenhuma coleção cadastrada ainda.</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {collections.map((collection, index) => (
              <div key={collection.id} className="group relative aspect-[16/9] overflow-hidden rounded-2xl bg-brand-ink shadow-card sm:aspect-[21/9]">
                {collection.image_url ? <img src={collection.image_url} alt={collection.name} className="absolute inset-0 h-full w-full object-cover opacity-80" /> : <div className="absolute inset-0 bg-brand-moss/60" />}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/85 via-brand-ink/15 to-transparent" />
                <span className="absolute bottom-3 left-3 font-heading text-sm font-semibold text-brand-paper sm:text-base">{collection.name}</span>
                <div className="absolute right-2 top-2 flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                  <button type="button" onClick={() => moveCollection(index, -1)} disabled={index === 0} className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-paper/90 text-brand-ink disabled:opacity-30" aria-label={`Mover ${collection.name} para cima`}><ArrowUp size={13} /></button>
                  <button type="button" onClick={() => moveCollection(index, 1)} disabled={index === collections.length - 1} className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-paper/90 text-brand-ink disabled:opacity-30" aria-label={`Mover ${collection.name} para baixo`}><ArrowDown size={13} /></button>
                  <button type="button" onClick={() => openEditCollectionForm(collection)} className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-paper/90 text-brand-ink" aria-label={`Editar ${collection.name}`}><Pencil size={13} /></button>
                  <button type="button" onClick={() => handleDeleteCollection(collection)} className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-paper/90 text-red-600" aria-label={`Apagar ${collection.name}`}><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      )}

      {activeTab === "slides" && (
      <section className="mb-10">
        <div className="mb-4">
          <p className="eyebrow">Topo da home</p>
          <h2 className="mt-1 font-heading text-2xl font-semibold text-brand-ink">Carrossel principal</h2>
          <p className="mt-1 font-body text-xs leading-5 text-brand-ink/50">Foto (retrato) ou vídeo. Envie também uma versão widescreen da foto para ficar perfeita no desktop — se não enviar, usamos a mesma foto. Escolha para onde cada slide leva ao ser clicado.</p>
        </div>

        {heroSlides.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-brand-ink/15 bg-brand-paper px-6 py-8 text-center font-body text-sm text-brand-ink/50">Nenhum slide cadastrado ainda — a home está mostrando o carrossel padrão de fábrica. Clique em "Novo slide" para assumir o controle.</div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {heroSlides.map((slide, index) => (
              <div key={slide.id} className={`group relative aspect-[9/16] overflow-hidden rounded-2xl bg-brand-ink shadow-card sm:aspect-video ${slide.active === false ? "opacity-50" : ""}`}>
                {slide.media_type === "video" && slide.video_url ? (
                  <video src={slide.video_url} muted loop playsInline className="absolute inset-0 h-full w-full object-cover" />
                ) : slide.image_url ? (
                  <img src={slide.image_url_desktop || slide.image_url} alt={slide.alt_text || slide.title || ""} className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-brand-moss/60" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/85 via-brand-ink/10 to-transparent" />
                <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-brand-ink/70 px-2 py-1 font-body text-[10px] font-semibold uppercase tracking-[0.1em] text-brand-paper">
                  {slide.media_type === "video" ? <><Film size={11} /> Vídeo</> : <><ImageIcon size={11} /> Foto</>}
                </span>
                {slide.active === false && <span className="absolute right-3 top-3 rounded-full bg-red-600/90 px-2 py-1 font-body text-[10px] font-semibold uppercase tracking-[0.1em] text-white">Oculto</span>}
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="font-heading text-sm font-semibold leading-tight text-brand-paper sm:text-base">{slide.eyebrow}{slide.eyebrow && slide.title ? " · " : ""}{slide.title}</p>
                  <p className="mt-0.5 font-body text-[11px] leading-4 text-brand-paper/70">{slide.href ? `Leva para: ${slide.href}` : "Sem destino de clique"}</p>
                </div>
                <div className="absolute right-2 top-11 flex flex-col gap-1.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                  <button type="button" onClick={() => moveHeroSlide(index, -1)} disabled={index === 0} className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-paper/90 text-brand-ink disabled:opacity-30" aria-label="Mover para cima"><ArrowUp size={13} /></button>
                  <button type="button" onClick={() => moveHeroSlide(index, 1)} disabled={index === heroSlides.length - 1} className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-paper/90 text-brand-ink disabled:opacity-30" aria-label="Mover para baixo"><ArrowDown size={13} /></button>
                  <button type="button" onClick={() => toggleHeroSlideActive(slide)} className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-paper/90 text-brand-ink" aria-label={slide.active === false ? "Mostrar na home" : "Esconder da home"}>{slide.active === false ? <PackageCheck size={13} /> : <PackageX size={13} />}</button>
                  <button type="button" onClick={() => openEditHeroSlideForm(slide)} className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-paper/90 text-brand-ink" aria-label="Editar slide"><Pencil size={13} /></button>
                  <button type="button" onClick={() => handleDeleteHeroSlide(slide)} className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-paper/90 text-red-600" aria-label="Apagar slide"><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      )}

      {showHeroSlideForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-ink/60 px-4 py-8" onClick={() => setShowHeroSlideForm(false)}>
          <form onSubmit={handleSaveHeroSlide} onClick={(event) => event.stopPropagation()} className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[1.5rem] bg-brand-paper shadow-card">
            <div className="flex items-start justify-between border-b border-brand-ink/10 px-6 py-5"><div><p className="eyebrow">Carrossel da home</p><h2 className="mt-1 font-heading text-2xl font-semibold text-brand-ink">{heroSlideForm.id ? "Editar slide" : "Novo slide"}</h2></div><button type="button" onClick={() => setShowHeroSlideForm(false)} className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-ink/10" aria-label="Fechar"><X size={16} /></button></div>

            <div className="space-y-5 px-6 py-6">
              <div className="flex gap-2">
                <button type="button" onClick={() => setHeroSlideForm((current) => ({ ...current, media_type: "image" }))} className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 font-body text-sm font-semibold transition-colors ${heroSlideForm.media_type === "image" ? "border-brand-gold bg-brand-gold/10 text-brand-ink" : "border-brand-ink/10 text-brand-ink/50"}`}><ImageIcon size={15} /> Foto</button>
                <button type="button" onClick={() => setHeroSlideForm((current) => ({ ...current, media_type: "video" }))} className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 font-body text-sm font-semibold transition-colors ${heroSlideForm.media_type === "video" ? "border-brand-gold bg-brand-gold/10 text-brand-ink" : "border-brand-ink/10 text-brand-ink/50"}`}><Video size={15} /> Vídeo</button>
              </div>

              {heroSlideForm.media_type === "image" ? (
                <>
                  <label className="block font-body text-xs font-semibold text-brand-ink/65">Foto — versão retrato (mobile)
                    <div onDragOver={(event) => { event.preventDefault(); setHeroSlideDragActive(true); }} onDragLeave={() => setHeroSlideDragActive(false)} onDrop={(event) => handleHeroSlideDrop(event, "image_url")} className={`mt-2 rounded-xl border-2 border-dashed p-4 text-center transition-colors ${heroSlideDragActive ? "border-brand-gold bg-brand-gold/10" : "border-brand-ink/15 bg-brand-cream"}`}>
                      <input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadHeroSlideFile(file, "image_url"); }} className="block w-full font-body text-xs" />
                    </div>
                  </label>
                  {heroSlideForm.image_url && <img src={heroSlideForm.image_url} alt="Prévia mobile" className="aspect-[9/16] w-40 rounded-xl object-cover" />}

                  <label className="block font-body text-xs font-semibold text-brand-ink/65">Foto — versão widescreen (desktop, opcional)
                    <input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadHeroSlideFile(file, "image_url_desktop"); }} className="mt-2 block w-full rounded-xl border border-dashed border-brand-ink/20 bg-brand-cream px-4 py-3 font-body text-xs" />
                  </label>
                  {heroSlideForm.image_url_desktop && <img src={heroSlideForm.image_url_desktop} alt="Prévia desktop" className="aspect-video w-full rounded-xl object-cover" />}
                </>
              ) : (
                <>
                  <label className="block font-body text-xs font-semibold text-brand-ink/65">Vídeo (MP4 ou WebM, até 30 MB)
                    <div onDragOver={(event) => { event.preventDefault(); setHeroSlideDragActive(true); }} onDragLeave={() => setHeroSlideDragActive(false)} onDrop={(event) => handleHeroSlideDrop(event, "video_url")} className={`mt-2 rounded-xl border-2 border-dashed p-4 text-center transition-colors ${heroSlideDragActive ? "border-brand-gold bg-brand-gold/10" : "border-brand-ink/15 bg-brand-cream"}`}>
                      <input type="file" accept="video/mp4,video/webm" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadHeroSlideFile(file, "video_url"); }} className="block w-full font-body text-xs" />
                    </div>
                  </label>
                  {heroSlideForm.video_url && <video src={heroSlideForm.video_url} controls muted className="aspect-video w-full rounded-xl object-cover" />}
                  <label className="block font-body text-xs font-semibold text-brand-ink/65">Imagem de capa (opcional, aparece antes do vídeo carregar)
                    <input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadHeroSlideFile(file, "image_url"); }} className="mt-2 block w-full rounded-xl border border-dashed border-brand-ink/20 bg-brand-cream px-4 py-3 font-body text-xs" />
                  </label>
                </>
              )}

              {heroSlideUploading && <p className="flex items-center gap-2 rounded-xl bg-brand-gold/10 px-4 py-3 font-body text-xs text-brand-gold"><UploadCloud size={15} /> Enviando arquivo...</p>}

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block font-body text-xs font-semibold text-brand-ink/65">Texto pequeno (eyebrow)
                  <input placeholder="Ex.: Feminino" value={heroSlideForm.eyebrow} onChange={(event) => setHeroSlideForm((current) => ({ ...current, eyebrow: event.target.value }))} className="input-premium mt-1" />
                </label>
                <label className="block font-body text-xs font-semibold text-brand-ink/65">Título
                  <input placeholder="Ex.: Urbano" value={heroSlideForm.title} onChange={(event) => setHeroSlideForm((current) => ({ ...current, title: event.target.value }))} className="input-premium mt-1" />
                </label>
              </div>

              <label className="block font-body text-xs font-semibold text-brand-ink/65">Texto alternativo (acessibilidade/SEO)
                <input value={heroSlideForm.alt_text} onChange={(event) => setHeroSlideForm((current) => ({ ...current, alt_text: event.target.value }))} className="input-premium mt-1" placeholder="Descreva a cena da foto ou vídeo" />
              </label>

              <label className="block font-body text-xs font-semibold text-brand-ink/65">Ao clicar no slide, levar para
                <select value={heroSlideForm.destination_type === "none" ? "none" : `${heroSlideForm.destination_type}:${heroSlideForm.destination_id}`} onChange={(event) => {
                  const [type, id = ""] = event.target.value.split(":");
                  const destinationType = type as HeroSlideFormState["destination_type"];
                  const href =
                    destinationType === "collection" ? `/produtos?colecao=${encodeURIComponent(id)}` :
                    destinationType === "product" ? `/produtos/${encodeURIComponent(id)}` :
                    destinationType === "filter" ? FILTER_DESTINATIONS.find((item) => item.value === id)?.href || "" :
                    "";
                  setHeroSlideForm((current) => ({ ...current, destination_type: destinationType, destination_id: id, href }));
                }} className="input-premium mt-1">
                  <option value="none">Nenhum destino (foto sem clique)</option>
                  <optgroup label="Filtros da vitrine">
                    {FILTER_DESTINATIONS.map((filter) => <option key={filter.value} value={`filter:${filter.value}`}>{filter.label}</option>)}
                  </optgroup>
                  <optgroup label="Coleções">
                    {collections.map((collection) => <option key={collection.id} value={`collection:${collection.slug}`}>{collection.name}</option>)}
                  </optgroup>
                  <optgroup label="Produtos">
                    {products.map((product) => <option key={product.id} value={`product:${product.slug}`}>{product.name}</option>)}
                  </optgroup>
                </select>
                {heroSlideForm.href && <p className="mt-1.5 font-body text-[11px] text-brand-ink/40">Vai para: {heroSlideForm.href}</p>}
              </label>

              <label className="flex items-center gap-3 font-body text-sm font-semibold text-brand-ink/70"><input type="checkbox" checked={heroSlideForm.active} onChange={(event) => setHeroSlideForm((current) => ({ ...current, active: event.target.checked }))} className="h-4 w-4 accent-brand-gold" /> Mostrar este slide na home</label>

              {heroSlideError && <p className="rounded-xl bg-red-50 px-4 py-3 font-body text-xs leading-5 text-red-700">{heroSlideError}</p>}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-brand-ink/10 bg-brand-paper px-6 py-5 sm:flex-row sm:justify-end sm:px-8"><button type="button" onClick={() => setShowHeroSlideForm(false)} className="btn-brand-outline">Cancelar</button><button type="submit" disabled={heroSlideSaving || heroSlideUploading} className="btn-brand"><Check size={15} className="mr-2" />{heroSlideSaving ? "Salvando…" : "Salvar slide"}</button></div>
          </form>
        </div>
      )}

      {activeTab === "produtos" && (
      <div className="overflow-hidden rounded-[1.5rem] bg-brand-paper shadow-card">
        <div className="hidden grid-cols-[1fr_140px_110px_180px_120px] gap-4 border-b border-brand-ink/10 px-6 py-4 font-body text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-ink/45 sm:grid">
          <span>Produto</span><span>Preço</span><span>Estoque</span><span>Badges</span><span />
        </div>
        {products.length === 0 ? (
          <div className="px-6 py-14 text-center"><p className="font-heading text-2xl text-brand-ink">Nenhum produto cadastrado</p><p className="mt-2 font-body text-sm text-brand-ink/55">Comece adicionando o primeiro modelo da coleção.</p></div>
        ) : sortedProducts.map((product) => {
          const soldOut = isProductSoldOut(product);
          return (
          <div key={product.id} className={`grid gap-4 border-b border-brand-ink/10 px-5 py-5 last:border-0 sm:grid-cols-[1fr_140px_110px_180px_120px] sm:items-center sm:gap-4 sm:px-6 ${soldOut ? "bg-red-50/40" : ""}`}>
            <div className="flex min-w-0 items-center gap-3">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-brand-sage/60">{product.images?.[0] && <img src={product.images[0]} alt="" className={`h-full w-full object-contain p-2 mix-blend-multiply ${soldOut ? "grayscale opacity-60" : ""}`} />}</div>
              <div className="min-w-0"><p className="truncate font-heading text-lg font-semibold text-brand-ink">{product.name}</p><p className="font-body text-xs text-brand-ink/50">{product.category}{product.gender ? ` · ${product.gender === "masculino" ? "Masculino" : product.gender === "feminino" ? "Feminino" : product.gender === "infantil" ? "Infantil" : "Unissex"}` : ""}</p></div>
            </div>
            <div className="font-body text-sm font-semibold text-brand-ink">{formatBRL(product.price)}{product.compare_at_price && <span className="ml-2 text-[11px] font-normal text-brand-ink/35 line-through">{formatBRL(product.compare_at_price)}</span>}</div>
            <div className="font-body text-sm text-brand-ink/70">{product.stock} un.</div>
            <div className="flex flex-wrap gap-2 font-body text-[9px] font-semibold uppercase tracking-[0.12em]">{soldOut && !product.made_to_order && <span className="rounded-full bg-red-600 px-2.5 py-1.5 text-white">Esgotado</span>}{product.made_to_order && <span className="rounded-full bg-brand-gold px-2.5 py-1.5 text-brand-paper">Sob encomenda</span>}{product.more_sold && <span className="rounded-full bg-brand-ink px-2.5 py-1.5 text-brand-paper">Mais vendido</span>}{product.featured && <span className="rounded-full bg-brand-gold/15 px-2.5 py-1.5 text-brand-gold">Destaque</span>}</div>
            <div className="flex gap-4 sm:justify-end">
              <button onClick={() => toggleProductSoldOut(product)} className={`transition-colors ${product.sold_out ? "text-red-600 hover:text-brand-moss" : "text-brand-ink/55 hover:text-red-600"}`} aria-label={product.sold_out ? `Marcar ${product.name} como disponível de novo` : `Marcar ${product.name} como já vendido / esgotado`} title={product.sold_out ? "Já vendeu · clique para reativar" : "Marcar como já vendeu / esgotado"}>{product.sold_out ? <PackageCheck size={17} /> : <PackageX size={17} />}</button>
              <button onClick={() => openEditForm(product)} className="text-brand-ink/55 transition-colors hover:text-brand-gold" aria-label={`Editar ${product.name}`}><Pencil size={17} /></button>
              <button onClick={() => handleDelete(product.id)} className="text-brand-ink/40 transition-colors hover:text-red-600" aria-label={`Apagar ${product.name}`}><Trash2 size={17} /></button>
            </div>
          </div>
        );})}
      </div>
      )}

      {activeTab === "carrinhos" && (
        <section className="space-y-4">
          {abandonedCarts.length === 0 ? <div className="rounded-2xl border border-dashed border-brand-ink/15 bg-brand-paper px-6 py-10 text-center font-body text-sm text-brand-ink/50">Nenhum carrinho salvo ainda.</div> : abandonedCarts.map((cart) => { const message = `Olá! Aqui é da Ótica Líder Brasil. 😊\n\nNotamos que você deixou estes itens na sua sacola:\n${cart.items.map((item) => `• ${item.name} — ${item.quantity} unidade(s)`).join("\n")}\n\nPodemos separar tudo para você e ajudar a finalizar seu pedido com segurança. Quer que eu reserve esses óculos?`; return <article key={cart.id} className="flex flex-col gap-4 rounded-2xl bg-brand-paper p-5 shadow-card sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><input type="checkbox" checked={sentCartIds.includes(cart.id)} onChange={() => toggleSentCart(cart.id)} className="mt-1 h-5 w-5 shrink-0 accent-brand-gold" aria-label="Marcar mensagem enviada" /><div><h3 className="font-heading text-lg font-semibold text-brand-ink">{cart.items.map((item) => item.name).join(" + ")}</h3><p className="mt-1 font-body text-xs text-brand-ink/55">{new Date(cart.created_at).toLocaleString("pt-BR")} · Total {formatBRL(Number(cart.total))}</p></div></div><a href={`https://wa.me/55${cart.whatsapp}?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 self-start rounded-full bg-[#25D366] px-4 py-2.5 font-body text-xs font-semibold text-white"><MessageCircle size={15} /> {formatWhatsAppDigits(cart.whatsapp)}</a></article>; })}
        </section>
      )}

      {activeTab === "metricas" && (
        <section className="space-y-4">
          <div className="rounded-2xl bg-brand-paper p-5 shadow-card"><p className="eyebrow">Vitrine</p><h2 className="mt-2 font-heading text-2xl font-semibold text-brand-ink">Produtos mais clicados</h2><p className="mt-1 font-body text-sm text-brand-ink/55">Top 10 · desde que o rastreamento foi ativado</p></div>
          {Object.entries(productClicks.reduce<Record<string, { name: string; slug: string; count: number }>>((acc, click) => { const key = click.product_id || click.product_slug; acc[key] = acc[key] || { name: click.product_name, slug: click.product_slug, count: 0 }; acc[key].count += 1; return acc; }, {})).sort((a, b) => b[1].count - a[1].count).slice(0, 10).map(([key, item], index) => <div key={key} className="flex items-center justify-between rounded-2xl bg-brand-paper px-5 py-4 shadow-card"><div className="flex items-center gap-4"><span className="font-heading text-xl font-semibold text-brand-gold">{index + 1}</span><a href={`/produtos/${item.slug}`} target="_blank" className="font-body text-sm font-semibold text-brand-ink hover:text-brand-gold">{item.name}</a></div><span className="font-body text-sm text-brand-ink/60">{item.count} {item.count === 1 ? "clique" : "cliques"}</span></div>)}
          {productClicks.length === 0 && <div className="rounded-2xl border border-dashed border-brand-ink/15 bg-brand-paper px-6 py-10 text-center font-body text-sm text-brand-ink/50">Ainda não há cliques registrados.</div>}
        </section>
      )}

      {activeTab === "emails" && (
      <div className="overflow-hidden rounded-[1.5rem] bg-brand-paper shadow-card">
        <div className="hidden grid-cols-[1fr_220px_110px_90px] gap-4 border-b border-brand-ink/10 px-6 py-4 font-body text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-ink/45 sm:grid">
          <span>Nome</span><span>E-mail</span><span>Público</span><span>Data</span>
        </div>
        {leads.length === 0 ? (
          <div className="px-6 py-14 text-center"><p className="font-heading text-2xl text-brand-ink">Nenhum cadastro ainda</p><p className="mt-2 font-body text-sm text-brand-ink/55">Assim que alguém se cadastrar na home, o contato aparece aqui.</p></div>
        ) : leads.map((lead) => (
          <div key={lead.id} className="grid gap-3 border-b border-brand-ink/10 px-5 py-4 last:border-0 sm:grid-cols-[1fr_220px_110px_90px] sm:items-center sm:gap-4 sm:px-6">
            <p className="truncate font-body text-sm font-semibold text-brand-ink">{lead.name?.trim() || "Sem nome"}</p>
            <a
              href={`mailto:${lead.email}`}
              className="flex items-center gap-2 truncate font-body text-sm text-brand-ink transition-colors hover:text-brand-gold"
              aria-label={`Enviar e-mail para ${lead.name || lead.email}`}
            >
              <Mail size={16} className="shrink-0 text-brand-gold" />
              <span className="truncate">{lead.email}</span>
            </a>
            <span className="font-body text-xs uppercase tracking-[0.08em] text-brand-ink/55">{lead.gender === "masculino" ? "Masculino" : lead.gender === "feminino" ? "Feminino" : "—"}</span>
            <span className="font-body text-xs text-brand-ink/45">{formatLeadDate(lead.created_at)}</span>
          </div>
        ))}
      </div>
      )}

      {showCollectionForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-brand-ink/55 px-4 py-5 backdrop-blur-sm sm:py-10">
          <form onSubmit={handleSaveCollection} className="mx-auto max-w-lg overflow-hidden rounded-[1.5rem] bg-brand-cream shadow-soft">
            <div className="flex items-start justify-between border-b border-brand-ink/10 px-6 py-5"><div><p className="eyebrow">Vitrines da home</p><h2 className="mt-1 font-heading text-2xl font-semibold text-brand-ink">{collectionForm.id ? "Editar coleção" : "Nova coleção"}</h2></div><button type="button" onClick={() => setShowCollectionForm(false)} className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-ink/10" aria-label="Fechar"><X size={16} /></button></div>

            <div className="space-y-4 px-6 py-6">
              <div>
                <label className="mb-1.5 block font-body text-[10px] font-semibold uppercase tracking-[0.13em] text-brand-ink/55">Nome</label>
                <input required placeholder="Ex.: Ray-Ban, Voogue, Ciclista, HB..." value={collectionForm.name} onChange={(event) => setCollectionForm((current) => ({ ...current, name: event.target.value, slug: current.id ? current.slug : slugify(event.target.value) }))} className="input-premium" />
              </div>
              <div>
                <label className="mb-1.5 block font-body text-[10px] font-semibold uppercase tracking-[0.13em] text-brand-ink/55">URL amigável (slug)</label>
                <input value={collectionForm.slug} onChange={(event) => setCollectionForm((current) => ({ ...current, slug: slugify(event.target.value) }))} className="input-premium" />
              </div>

              <div>
                <label className="mb-1.5 block font-body text-[10px] font-semibold uppercase tracking-[0.13em] text-brand-ink/55">Imagem de fundo do retângulo</label>
                <div onDragOver={(event) => { event.preventDefault(); setDragTarget("collection"); }} onDragLeave={() => setDragTarget(null)} onDrop={handleCollectionImageDrop} className={`rounded-2xl border-2 border-dashed p-5 text-center transition-colors ${dragTarget === "collection" ? "border-brand-gold bg-brand-gold/10" : "border-brand-ink/15 bg-brand-paper"}`}>
                  <ImageIcon className="mx-auto text-brand-gold" size={22} strokeWidth={1.5} />
                  <p className="mt-2 font-body text-xs text-brand-ink/50">Arraste uma imagem ou escolha um arquivo</p>
                  <label className="btn-brand mt-3 cursor-pointer px-4 py-2 text-[10px]">Escolher imagem<input type="file" accept="image/*" className="sr-only" onChange={(event) => { if (event.target.files) void uploadCollectionImage(event.target.files); }} /></label>
                </div>
                <input placeholder="Ou cole uma URL pública" value={collectionForm.image_url} onChange={(event) => setCollectionForm((current) => ({ ...current, image_url: event.target.value }))} className="input-premium mt-3 text-xs" />
                {collectionForm.image_url && <div className="relative mt-3 aspect-[21/9] overflow-hidden rounded-2xl bg-brand-ink"><img src={collectionForm.image_url} alt="Prévia" className="absolute inset-0 h-full w-full object-cover opacity-80" /><span className="absolute bottom-3 left-3 font-heading text-sm font-semibold text-brand-paper">{collectionForm.name || "Nome da coleção"}</span></div>}
              </div>

              {collectionUploading && <p className="flex items-center gap-2 rounded-xl bg-brand-gold/10 px-4 py-3 font-body text-xs text-brand-gold"><UploadCloud size={15} /> Enviando imagem…</p>}
              {collectionError && <p className="rounded-xl bg-red-50 px-4 py-3 font-body text-xs leading-5 text-red-700">{collectionError}</p>}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-brand-ink/10 bg-brand-paper px-6 py-5 sm:flex-row sm:justify-end"><button type="button" onClick={() => setShowCollectionForm(false)} className="btn-brand-outline">Cancelar</button><button type="submit" disabled={collectionSaving || collectionUploading} className="btn-brand"><Check size={15} className="mr-2" />{collectionSaving ? "Salvando…" : "Salvar coleção"}</button></div>
          </form>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-brand-ink/55 px-4 py-5 backdrop-blur-sm sm:py-10">
          <form onSubmit={handleSave} className="mx-auto max-w-3xl overflow-hidden rounded-[1.5rem] bg-brand-cream shadow-soft">
            <div className="flex items-start justify-between border-b border-brand-ink/10 px-6 py-5 sm:px-8"><div><p className="eyebrow">Catálogo</p><h2 className="mt-1 font-heading text-2xl font-semibold text-brand-ink">{form.id ? "Editar produto" : "Novo produto"}</h2></div><button type="button" onClick={() => setShowForm(false)} className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-ink/10" aria-label="Fechar"><X size={16} /></button></div>

            <div className="space-y-8 px-6 py-7 sm:px-8">
              <section className="space-y-4"><div><p className="font-body text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-gold">01 · Identidade</p><p className="mt-1 font-body text-xs leading-5 text-brand-ink/50">A marca aparece maior e o modelo fica logo abaixo na vitrine.</p></div><div className="grid gap-3 sm:grid-cols-2"><div><label className="mb-1.5 block font-body text-[10px] font-semibold uppercase tracking-[0.13em] text-brand-ink/55">Marca</label><input required placeholder="Ex.: Ray-Ban" value={form.brand} onChange={(event) => setForm({ ...form, brand: event.target.value })} className="input-premium" /></div><div><label className="mb-1.5 block font-body text-[10px] font-semibold uppercase tracking-[0.13em] text-brand-ink/55">Modelo</label><input required placeholder="Ex.: RB3025" value={form.model} onChange={(event) => setForm({ ...form, model: event.target.value, name: event.target.value })} className="input-premium" /></div></div><div className="grid gap-3 sm:grid-cols-3"><input placeholder="URL amigável (opcional)" value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} className="input-premium" /><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="input-premium"><option>Óculos de Sol</option><option>Óculos de Grau</option><option>Armações</option><option>Acessórios</option></select><select value={form.gender} onChange={(event) => setForm({ ...form, gender: event.target.value })} className="input-premium" aria-label="Público"><option value="unissex">Unisex — masculino e feminino</option><option value="masculino">Masculino</option><option value="feminino">Feminino</option><option value="infantil">Infantil</option></select></div><textarea placeholder="Descrição do produto" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="input-premium min-h-28 resize-y" /></section>

              <section className="space-y-4"><div><p className="font-body text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-gold">02 · Preço e presença</p><p className="mt-1 font-body text-xs text-brand-ink/50">O preço promocional aparece junto ao preço anterior riscado.</p></div><div className="grid gap-3 sm:grid-cols-2"><div><label className="mb-1.5 block font-body text-[10px] font-semibold uppercase tracking-[0.13em] text-brand-ink/55">Preço atual/promocional</label><input required type="text" inputMode="decimal" placeholder="Ex.: 189,90" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} className="input-premium" /></div><div><label className="mb-1.5 block font-body text-[10px] font-semibold uppercase tracking-[0.13em] text-brand-ink/55">Preço anterior (opcional)</label><input type="text" inputMode="decimal" placeholder="Ex.: 249,90" value={form.compare_at_price} onChange={(event) => setForm({ ...form, compare_at_price: event.target.value })} className="input-premium" /></div></div>{discountPreview && <p className="rounded-xl bg-brand-gold/10 px-4 py-3 font-body text-xs text-brand-gold">Oferta de aproximadamente <strong>{discountPreview}% OFF</strong>.</p>}<div className="rounded-2xl border border-brand-ink/10 bg-brand-paper p-4"><label className="flex cursor-pointer items-start gap-3"><input type="checkbox" checked={form.installmentsEnabled} onChange={(event) => setForm({ ...form, installmentsEnabled: event.target.checked })} className="mt-0.5 accent-brand-gold" /><span><strong className="block font-body text-sm text-brand-ink">Exibir parcelamento</strong><small className="mt-1 block font-body text-xs leading-5 text-brand-ink/50">Opcional. Aparece logo abaixo do preço na vitrine.</small></span></label>{form.installmentsEnabled && <div className="mt-4 grid gap-3 sm:grid-cols-2"><div><label className="mb-1.5 block font-body text-[10px] font-semibold uppercase tracking-[0.13em] text-brand-ink/55">Número de parcelas</label><input type="number" min="1" max="24" value={form.installmentCount} onChange={(event) => setForm({ ...form, installmentCount: event.target.value })} className="input-premium" /></div><div><label className="mb-1.5 block font-body text-[10px] font-semibold uppercase tracking-[0.13em] text-brand-ink/55">Valor de cada parcela</label><input type="text" inputMode="decimal" placeholder="Ex.: 99,90" value={form.installmentAmount} onChange={(event) => setForm({ ...form, installmentAmount: event.target.value })} className="input-premium" /></div></div>}{form.installmentsEnabled && parseNumber(form.installmentAmount) > 0 && <p className="mt-3 rounded-xl bg-brand-gold/10 px-4 py-3 font-body text-xs text-brand-gold">Prévia: <strong>{form.installmentCount || "1"}x de {formatBRL(parseNumber(form.installmentAmount))}</strong></p>}</div><input type="number" min="0" placeholder="Quantidade em estoque" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} className="input-premium" /><div className="grid gap-3 sm:grid-cols-2"><label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-brand-ink/10 bg-brand-paper p-4"><input type="checkbox" checked={form.featured} onChange={(event) => setForm({ ...form, featured: event.target.checked })} className="mt-0.5 accent-brand-gold" /><span><strong className="block font-body text-sm text-brand-ink">Destaque</strong><small className="mt-1 block font-body text-xs leading-5 text-brand-ink/50">Exibe também na faixa de curadoria da home.</small></span></label><label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-brand-ink/10 bg-brand-paper p-4"><input type="checkbox" checked={form.more_sold} onChange={(event) => setForm({ ...form, more_sold: event.target.checked })} className="mt-0.5 accent-brand-gold" /><span><strong className="block font-body text-sm text-brand-ink">Mais vendido</strong><small className="mt-1 block font-body text-xs leading-5 text-brand-ink/50">Mostra um selo no topo do card e do produto.</small></span></label><label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-brand-ink/10 bg-brand-paper p-4"><input type="checkbox" checked={form.ai_tryon} onChange={(event) => setForm({ ...form, ai_tryon: event.target.checked })} className="mt-0.5 accent-brand-gold" /><span><strong className="block font-body text-sm text-brand-ink">Óculos com IA</strong><small className="mt-1 block font-body text-xs leading-5 text-brand-ink/50">Inclui este produto no filtro "Óculos com IA" da vitrine.</small></span></label><label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-brand-ink/10 bg-brand-paper p-4"><input type="checkbox" checked={form.sportivo} onChange={(event) => setForm({ ...form, sportivo: event.target.checked })} className="mt-0.5 accent-brand-gold" /><span><strong className="block font-body text-sm text-brand-ink">Óculos esportivo</strong><small className="mt-1 block font-body text-xs leading-5 text-brand-ink/50">Inclui este produto no filtro "Óculos esportivo" — ele continua aparecendo normalmente nos demais filtros também.</small></span></label></div><label className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors ${form.sold_out ? "border-red-200 bg-red-50" : "border-brand-ink/10 bg-brand-paper"}`}><input type="checkbox" checked={form.sold_out} onChange={(event) => setForm({ ...form, sold_out: event.target.checked })} className="mt-0.5 accent-red-600" /><span><strong className={`block font-body text-sm ${form.sold_out ? "text-red-700" : "text-brand-ink"}`}>Já vendeu tudo / esgotado</strong><small className="mt-1 block font-body text-xs leading-5 text-brand-ink/50">Some da vitrine como disponível, mas o cliente ainda consegue abrir o produto e pedir pelo WhatsApp. Quando repor, é só desmarcar — nada é apagado.</small></span></label><div className={`rounded-2xl border p-4 transition-colors ${form.made_to_order ? "border-brand-gold bg-brand-gold/10" : "border-brand-ink/10 bg-brand-paper"}`}><label className="flex cursor-pointer items-start gap-3"><input type="checkbox" checked={form.made_to_order} onChange={(event) => setForm({ ...form, made_to_order: event.target.checked })} className="mt-0.5 accent-brand-gold" /><span><strong className="block font-body text-sm text-brand-ink">Pedido especial (fazer sob encomenda)</strong><small className="mt-1 block font-body text-xs leading-5 text-brand-ink/50">Para modelos de pouco giro que só são comprados depois que o cliente pede (ex.: Ray-Ban Meta). Em vez de ir para o carrinho, o cliente vê "Fazer pedido" e cai direto numa mensagem pronta no WhatsApp avisando o prazo abaixo.</small></span></label>{form.made_to_order && <div className="mt-4"><label className="mb-1.5 block font-body text-[10px] font-semibold uppercase tracking-[0.13em] text-brand-ink/55">Prazo médio de entrega</label><input placeholder="Ex.: 2 meses" value={form.made_to_order_note} onChange={(event) => setForm({ ...form, made_to_order_note: event.target.value })} className="input-premium" /><p className="mt-1.5 font-body text-[11px] leading-4 text-brand-ink/40">Aparece na página do produto e já entra pronto na mensagem do WhatsApp.</p></div>}</div></section>

              <section className="space-y-4"><div><p className="font-body text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-gold">03 · Fotos do produto</p><p className="mt-1 font-body text-xs text-brand-ink/50">Arraste as imagens para cá ou escolha os arquivos no celular/computador.</p></div><div onDragOver={(event) => { event.preventDefault(); setDragTarget("images"); }} onDragLeave={() => setDragTarget(null)} onDrop={(event) => handleDrop(event, "images")} className={`rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${dragTarget === "images" ? "border-brand-gold bg-brand-gold/10" : "border-brand-ink/15 bg-brand-paper"}`}><UploadCloud className="mx-auto text-brand-gold" size={26} strokeWidth={1.5} /><p className="mt-3 font-body text-sm font-semibold text-brand-ink">Solte suas fotos aqui</p><p className="mt-1 font-body text-xs text-brand-ink/45">JPG, PNG ou WebP · várias imagens permitidas</p><label className="btn-brand mt-4 cursor-pointer">Escolher imagens<input type="file" accept="image/*" multiple className="sr-only" onChange={(event) => { if (event.target.files) void uploadFiles(event.target.files, "images"); }} /></label></div><textarea value={form.imagesText} onChange={(event) => setForm({ ...form, imagesText: event.target.value })} className="input-premium min-h-24 resize-y text-xs" placeholder="Ou cole URLs públicas, uma por linha" />{form.imagesText && <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">{form.imagesText.split("\n").filter(Boolean).map((url) => <div key={url} className="aspect-square overflow-hidden rounded-xl bg-brand-sage/50"><img src={url} alt="Prévia" className="h-full w-full object-contain p-2 mix-blend-multiply" /></div>)}</div>}</section>

              <section className="space-y-4"><div><p className="font-body text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-gold">04 · Cores e variações</p><p className="mt-1 font-body text-xs leading-5 text-brand-ink/50">Cada bolinha é uma opção que aparecerá no card da loja. Selecione uma cor, informe o nome, escolha o tom e cole a foto específica daquele modelo.</p></div><div className="flex flex-wrap gap-2">{form.colors.map((color, index) => <button key={`${color.name}-${index}`} type="button" onClick={() => setSelectedColorIndex(index)} className={`flex items-center gap-2 rounded-full border px-3 py-2 font-body text-xs transition-colors ${selectedColorIndex === index ? "border-brand-gold bg-brand-gold/10 text-brand-ink" : "border-brand-ink/10 bg-brand-paper text-brand-ink/60"} ${color.sold_out ? "opacity-60" : ""}`}><span className="relative block h-4 w-4 shrink-0 overflow-hidden rounded-full border border-brand-ink/10"><span className="absolute inset-0" style={{ backgroundColor: color.hex }} />{color.sold_out && <span className="absolute left-1/2 top-1/2 h-[150%] w-[1.5px] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white" />}</span>{color.name || "Sem nome"}{color.sold_out && <span className="rounded-full bg-brand-ink/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-brand-ink/50">Esgotada</span>}</button>)}<button type="button" onClick={addColorField} className="flex items-center gap-1 rounded-full border border-dashed border-brand-gold px-3 py-2 font-body text-xs font-semibold text-brand-gold"><Plus size={13} /> Adicionar cor</button></div>{form.colors.length > 0 && form.colors[selectedColorIndex] && <div className="rounded-2xl bg-brand-paper p-4"><div className="flex items-center justify-between"><p className="font-body text-xs font-semibold uppercase tracking-[0.14em] text-brand-ink/55">Editando cor {selectedColorIndex + 1}</p><button type="button" onClick={() => removeColorField(selectedColorIndex)} className="text-brand-ink/40 hover:text-red-600" aria-label="Remover cor permanentemente"><Trash2 size={15} /></button></div><label className={`mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors ${form.colors[selectedColorIndex].sold_out ? "border-red-200 bg-red-50" : "border-brand-ink/10 bg-brand-cream"}`}><input type="checkbox" checked={Boolean(form.colors[selectedColorIndex].sold_out)} onChange={() => toggleColorSoldOut(selectedColorIndex)} className="mt-0.5 accent-red-600" /><span><strong className={`block font-body text-sm ${form.colors[selectedColorIndex].sold_out ? "text-red-700" : "text-brand-ink"}`}>Marcar esta cor como esgotada</strong><small className="mt-1 block font-body text-xs leading-5 text-brand-ink/50">Some da venda e vai para o final na vitrine, mas continua salva. Quando chegar mais estoque, é só desmarcar — não precisa cadastrar de novo.</small></span></label><div className="mt-4 grid gap-3 sm:grid-cols-[1fr_130px]"><input placeholder="Nome (ex.: Tartaruga)" value={form.colors[selectedColorIndex].name} onChange={(event) => updateColorField(selectedColorIndex, "name", event.target.value)} className="input-premium" /><label className="flex items-center gap-3 rounded-2xl border border-brand-ink/10 px-3 py-2"><span className="h-8 w-8 rounded-full border border-brand-ink/10" style={{ backgroundColor: form.colors[selectedColorIndex].hex }} /><input type="color" value={form.colors[selectedColorIndex].hex} onChange={(event) => updateColorField(selectedColorIndex, "hex", event.target.value)} className="h-8 w-10 cursor-pointer border-0 bg-transparent" /><span className="font-body text-xs text-brand-ink/50">Tom</span></label></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="block font-body text-[10px] font-semibold uppercase tracking-[0.13em] text-brand-ink/55">Armação<input placeholder="Ex.: Preto" value={form.colors[selectedColorIndex].frame_color || ""} onChange={(event) => updateColorField(selectedColorIndex, "frame_color", event.target.value)} className="input-premium mt-2 text-sm normal-case tracking-normal" /></label><label className="block font-body text-[10px] font-semibold uppercase tracking-[0.13em] text-brand-ink/55">Lentes<input placeholder="Ex.: Verde" value={form.colors[selectedColorIndex].lens_color || ""} onChange={(event) => updateColorField(selectedColorIndex, "lens_color", event.target.value)} className="input-premium mt-2 text-sm normal-case tracking-normal" /></label></div><div className="mt-5 rounded-2xl border border-brand-ink/10 bg-brand-sage/30 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-body text-[10px] font-semibold uppercase tracking-[0.13em] text-brand-ink/60">Galeria desta variação</p><p className="mt-1 max-w-md font-body text-xs leading-5 text-brand-ink/50">Cadastre todos os ângulos desta cor. Essa galeria aparecerá quando o cliente tocar nesta bolinha.</p></div><span className="shrink-0 rounded-full bg-brand-paper px-2.5 py-1 font-body text-[10px] font-semibold text-brand-ink/55">{(form.colors[selectedColorIndex].images ?? []).filter((url) => url.trim()).length} fotos</span></div><div onDragOver={(event) => { event.preventDefault(); setDragTarget("color"); }} onDragLeave={() => setDragTarget(null)} onDrop={(event) => handleColorDrop(event, selectedColorIndex)} className={`mt-4 flex flex-col items-center gap-3 rounded-xl border-2 border-dashed p-4 text-center transition-colors sm:flex-row sm:text-left ${dragTarget === "color" ? "border-brand-gold bg-brand-gold/10" : "border-brand-ink/15 bg-brand-paper/60"}`}><UploadCloud className="shrink-0 text-brand-gold" size={22} /><div className="min-w-0 flex-1"><p className="font-body text-xs font-semibold text-brand-ink">Arraste vários ângulos desta cor</p><p className="mt-1 font-body text-[11px] leading-4 text-brand-ink/45">Frente, lateral, haste, detalhe e embalagem.</p></div><label className="btn-brand shrink-0 cursor-pointer px-4 py-2 text-[10px]">Adicionar fotos<input type="file" accept="image/*" multiple className="sr-only" onChange={(event) => { if (event.target.files) void uploadColorImages(event.target.files, selectedColorIndex); }} /></label></div><textarea value={(form.colors[selectedColorIndex].images ?? []).join("\n")} onChange={(event) => updateColorImagesText(selectedColorIndex, event.target.value)} className="input-premium mt-3 min-h-24 resize-y text-xs" placeholder="Ou cole várias URLs públicas, uma por linha" />{(form.colors[selectedColorIndex].images ?? []).filter((url) => url.trim()).length > 0 && <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">{(form.colors[selectedColorIndex].images ?? []).map((url, imageIndex) => url.trim() && <div key={`${url}-${imageIndex}`} className="group relative aspect-square overflow-hidden rounded-xl bg-brand-paper"><img src={url} alt={`Ângulo ${imageIndex + 1}`} className="h-full w-full object-contain p-1 mix-blend-multiply" /><button type="button" onClick={() => removeColorImage(selectedColorIndex, imageIndex)} className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-ink/80 text-[11px] text-brand-paper opacity-0 transition-opacity group-hover:opacity-100" aria-label={`Remover ângulo ${imageIndex + 1}`}>×</button></div>)}</div>}<p className="mt-3 font-body text-[11px] leading-5 text-brand-ink/45">Exemplo: a cor preta pode ter 4 fotos do óculos preto. Ao escolher dourado, o cliente verá somente a galeria dourada.</p></div></div>}</section>

              <section className="space-y-4"><div><p className="font-body text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-gold">05 · Coleções</p><p className="mt-1 font-body text-xs leading-5 text-brand-ink/50">Marque em quais vitrines (marcas ou recortes como "Ciclista") este produto deve aparecer. Pode marcar mais de uma — ele continua aparecendo só 1 vez na coleção completa.</p></div>{collections.length === 0 ? <p className="rounded-xl bg-brand-paper px-4 py-3 font-body text-xs text-brand-ink/50">Nenhuma coleção cadastrada ainda. Crie uma lá em cima, em "Marcas e coleções".</p> : <div className="flex flex-wrap gap-2">{collections.map((collection) => { const active = form.collection_slugs.includes(collection.slug); return <button key={collection.id} type="button" onClick={() => toggleFormCollection(collection.slug)} className={`rounded-full border px-3 py-2 font-body text-xs transition-colors ${active ? "border-brand-gold bg-brand-gold/10 text-brand-ink" : "border-brand-ink/10 bg-brand-paper text-brand-ink/60"}`}>{collection.name}</button>; })}</div>}</section>

              <section className="space-y-4"><div><p className="font-body text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-gold">06 · Especificações</p><p className="mt-1 font-body text-xs leading-5 text-brand-ink/50">Aparece no acordeão "Especificações" na página do produto, junto do gênero já definido acima. Deixe em branco o que não se aplicar.</p></div><div className="grid gap-3 sm:grid-cols-2"><div><label className="mb-1.5 block font-body text-[10px] font-semibold uppercase tracking-[0.13em] text-brand-ink/55">Material</label><select value={form.specMaterial} onChange={(event) => setForm({ ...form, specMaterial: event.target.value })} className="input-premium"><option value="">Não informar</option><option>Acetato</option><option>Injetado</option><option>Metal</option><option>Titânio</option><option>Policarbonato</option><option>Alumínio</option></select></div><div><label className="mb-1.5 block font-body text-[10px] font-semibold uppercase tracking-[0.13em] text-brand-ink/55">Formato</label><select value={form.specFormat} onChange={(event) => setForm({ ...form, specFormat: event.target.value })} className="input-premium"><option value="">Não informar</option>{FORMAT_OPTIONS.map((format) => <option key={format} value={format}>{format}</option>)}</select></div><div><label className="mb-1.5 block font-body text-[10px] font-semibold uppercase tracking-[0.13em] text-brand-ink/55">Garantia</label><input placeholder="Ex.: 6 meses" value={form.specWarranty} onChange={(event) => setForm({ ...form, specWarranty: event.target.value })} className="input-premium" /></div><div><label className="mb-1.5 block font-body text-[10px] font-semibold uppercase tracking-[0.13em] text-brand-ink/55">Tipo de lente</label><input placeholder="Ex.: Visão simples, Antirreflexo..." value={form.specLensType} onChange={(event) => setForm({ ...form, specLensType: event.target.value })} className="input-premium" /></div></div><div><label className="mb-1.5 block font-body text-[10px] font-semibold uppercase tracking-[0.13em] text-brand-ink/55">Conteúdo da embalagem</label><textarea placeholder="Ex.: Óculos, Flanela, Estojo" value={form.specPackageContents} onChange={(event) => setForm({ ...form, specPackageContents: event.target.value })} className="input-premium min-h-20 resize-y" /><p className="mt-1.5 font-body text-[11px] leading-4 text-brand-ink/40">Pode variar por produto — ajuste se algum modelo não incluir estojo, flanela ou certificado.</p></div></section>

              <section className="space-y-4"><div><p className="font-body text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-gold">07 · Materiais para download</p><p className="mt-1 font-body text-xs text-brand-ink/50">Inclua ficha técnica, manual, certificado ou outros arquivos para o cliente.</p></div><div onDragOver={(event) => { event.preventDefault(); setDragTarget("downloads"); }} onDragLeave={() => setDragTarget(null)} onDrop={(event) => handleDrop(event, "downloads")} className={`rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${dragTarget === "downloads" ? "border-brand-gold bg-brand-gold/10" : "border-brand-ink/15 bg-brand-paper"}`}><FileText className="mx-auto text-brand-gold" size={26} strokeWidth={1.5} /><p className="mt-3 font-body text-sm font-semibold text-brand-ink">Arraste documentos aqui</p><p className="mt-1 font-body text-xs text-brand-ink/45">PDF, DOC, DOCX, ZIP ou TXT</p><label className="btn-brand mt-4 cursor-pointer">Escolher documentos<input type="file" accept=".pdf,.doc,.docx,.zip,.txt" multiple className="sr-only" onChange={(event) => { if (event.target.files) void uploadFiles(event.target.files, "downloads"); }} /></label></div>{form.downloads.length > 0 && <div className="space-y-2">{form.downloads.map((download, index) => <div key={`${download.url}-${index}`} className="flex items-center justify-between gap-3 rounded-xl bg-brand-paper px-4 py-3"><a href={download.url} target="_blank" rel="noreferrer" className="flex min-w-0 items-center gap-2 font-body text-sm text-brand-gold hover:text-brand-ink"><FileText size={15} /><span className="truncate">{download.name}</span></a><button type="button" onClick={() => removeDownload(index)} className="shrink-0 text-brand-ink/40 hover:text-red-600" aria-label={`Remover ${download.name}`}><Trash2 size={14} /></button></div>)}</div>}</section>

              {uploading && <p className="flex items-center gap-2 rounded-xl bg-brand-gold/10 px-4 py-3 font-body text-xs text-brand-gold"><UploadCloud size={15} /> Enviando arquivos para o Storage…</p>}{uploadError && <p className="rounded-xl bg-red-50 px-4 py-3 font-body text-xs leading-5 text-red-700">{uploadError}</p>}{saveError && <p className="rounded-xl bg-red-50 px-4 py-3 font-body text-xs leading-5 text-red-700">Não foi possível salvar: {saveError}</p>}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-brand-ink/10 bg-brand-paper px-6 py-5 sm:flex-row sm:justify-end sm:px-8"><button type="button" onClick={() => setShowForm(false)} className="btn-brand-outline">Cancelar</button><button type="submit" disabled={saving || uploading} className="btn-brand"><Check size={15} className="mr-2" />{saving ? "Salvando…" : "Salvar produto"}</button></div>
          </form>
        </div>
      )}
    </main>
  );
}
