"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Collection, Product, ProductColor, ProductDownload } from "@/types/product";
import { isProductSoldOut } from "@/lib/productStatus";
import {
  ArrowDown,
  ArrowUp,
  Check,
  FileText,
  ImageIcon,
  LogOut,
  MessageCircle,
  PackageCheck,
  PackageX,
  Pencil,
  Plus,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";

type Lead = {
  id: string;
  name: string | null;
  whatsapp: string;
  gender: string | null;
  created_at: string;
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
  featured: boolean;
  more_sold: boolean;
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
  specWarranty: "",
  specLensType: "",
  specPackageContents: "Óculos, flanela, estojo e certificado de garantia",
  stock: "1",
  sold_out: false,
  featured: false,
  more_sold: false,
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
  const [activeTab, setActiveTab] = useState<"produtos" | "colecoes" | "whatsapp">("produtos");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/admin");
      } else {
        setChecking(false);
        void loadProducts();
        void loadCollections();
        void loadLeads();
      }
    });
  }, [router]);

  async function loadProducts() {
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    setProducts((data as Product[]) ?? []);
  }

  async function loadCollections() {
    const { data } = await supabase.from("collections").select("*").order("sort_order", { ascending: true });
    setCollections((data as Collection[]) ?? []);
  }

  async function loadLeads() {
    const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    setLeads((data as Lead[]) ?? []);
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
      const file = files[0];
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
      specWarranty: product.specifications?.warranty ?? "",
      specLensType: product.specifications?.lens_type ?? "",
      specPackageContents: product.specifications?.package_contents ?? "Óculos, flanela, estojo e certificado de garantia",
      stock: String(product.stock ?? 0),
      sold_out: Boolean(product.sold_out),
      featured: product.featured ?? false,
      more_sold: product.more_sold ?? false,
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
    const images = value.split("\n").map((item) => item.trim()).filter(Boolean);
    setForm((current) => {
      const colors = [...current.colors];
      colors[index] = { ...colors[index], images, image_url: colors[index].image_url || images[0] || "" };
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
      for (const file of files) {
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
      for (const file of acceptedFiles) {
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
      featured: form.featured,
      more_sold: form.more_sold,
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

  const discountPreview = useMemo(() => {
    const price = parseNumber(form.price);
    const compare = parseNumber(form.compare_at_price);
    if (!compare || !price || compare <= price) return null;
    return Math.round((1 - price / compare) * 100);
  }, [form.price, form.compare_at_price]);

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
            {activeTab === "produtos" ? "Produtos" : activeTab === "colecoes" ? "Coleções" : "Números de WhatsApp"}
          </h1>
          <p className="mt-2 font-body text-sm text-brand-ink/55">
            {activeTab === "produtos"
              ? "Cadastre imagens, variações, ofertas e materiais em um só lugar."
              : activeTab === "colecoes"
              ? "Gerencie as vitrines de marcas e recortes que aparecem na home."
              : "Contatos que se cadastraram pelo formulário do final da home."}
          </p>
        </div>
        <div className="flex gap-3">
          {activeTab === "produtos" && <button onClick={openNewForm} className="btn-brand"><Plus size={15} className="mr-2" /> Novo produto</button>}
          <button onClick={handleLogout} className="btn-brand-outline"><LogOut size={15} className="mr-2" /> Sair</button>
        </div>
      </div>

      <div className="mb-8 flex gap-2 border-b border-brand-ink/10">
        {([
          { key: "produtos", label: "Produtos" },
          { key: "colecoes", label: "Coleções" },
          { key: "whatsapp", label: `Números de WhatsApp${leads.length > 0 ? ` (${leads.length})` : ""}` },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`border-b-2 px-4 py-3 font-body text-sm font-semibold transition-colors ${
              activeTab === tab.key ? "border-brand-gold text-brand-ink" : "border-transparent text-brand-ink/45 hover:text-brand-ink"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

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
              <div className="min-w-0"><p className="truncate font-heading text-lg font-semibold text-brand-ink">{product.name}</p><p className="font-body text-xs text-brand-ink/50">{product.category}{product.gender ? ` · ${product.gender === "masculino" ? "Masculino" : product.gender === "feminino" ? "Feminino" : "Unissex"}` : ""}</p></div>
            </div>
            <div className="font-body text-sm font-semibold text-brand-ink">{formatBRL(product.price)}{product.compare_at_price && <span className="ml-2 text-[11px] font-normal text-brand-ink/35 line-through">{formatBRL(product.compare_at_price)}</span>}</div>
            <div className="font-body text-sm text-brand-ink/70">{product.stock} un.</div>
            <div className="flex flex-wrap gap-2 font-body text-[9px] font-semibold uppercase tracking-[0.12em]">{soldOut && <span className="rounded-full bg-red-600 px-2.5 py-1.5 text-white">Esgotado</span>}{product.more_sold && <span className="rounded-full bg-brand-ink px-2.5 py-1.5 text-brand-paper">Mais vendido</span>}{product.featured && <span className="rounded-full bg-brand-gold/15 px-2.5 py-1.5 text-brand-gold">Destaque</span>}</div>
            <div className="flex gap-4 sm:justify-end">
              <button onClick={() => toggleProductSoldOut(product)} className={`transition-colors ${product.sold_out ? "text-red-600 hover:text-brand-moss" : "text-brand-ink/55 hover:text-red-600"}`} aria-label={product.sold_out ? `Marcar ${product.name} como disponível de novo` : `Marcar ${product.name} como já vendido / esgotado`} title={product.sold_out ? "Já vendeu · clique para reativar" : "Marcar como já vendeu / esgotado"}>{product.sold_out ? <PackageCheck size={17} /> : <PackageX size={17} />}</button>
              <button onClick={() => openEditForm(product)} className="text-brand-ink/55 transition-colors hover:text-brand-gold" aria-label={`Editar ${product.name}`}><Pencil size={17} /></button>
              <button onClick={() => handleDelete(product.id)} className="text-brand-ink/40 transition-colors hover:text-red-600" aria-label={`Apagar ${product.name}`}><Trash2 size={17} /></button>
            </div>
          </div>
        );})}
      </div>
      )}

      {activeTab === "whatsapp" && (
      <div className="overflow-hidden rounded-[1.5rem] bg-brand-paper shadow-card">
        <div className="hidden grid-cols-[1fr_170px_110px_90px] gap-4 border-b border-brand-ink/10 px-6 py-4 font-body text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-ink/45 sm:grid">
          <span>Nome</span><span>WhatsApp</span><span>Público</span><span>Data</span>
        </div>
        {leads.length === 0 ? (
          <div className="px-6 py-14 text-center"><p className="font-heading text-2xl text-brand-ink">Nenhum cadastro ainda</p><p className="mt-2 font-body text-sm text-brand-ink/55">Assim que alguém se cadastrar na home, o contato aparece aqui.</p></div>
        ) : leads.map((lead) => (
          <div key={lead.id} className="grid gap-3 border-b border-brand-ink/10 px-5 py-4 last:border-0 sm:grid-cols-[1fr_170px_110px_90px] sm:items-center sm:gap-4 sm:px-6">
            <p className="truncate font-body text-sm font-semibold text-brand-ink">{lead.name?.trim() || "Sem nome"}</p>
            <a
              href={`https://wa.me/55${lead.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 font-body text-sm text-brand-ink transition-colors hover:text-brand-gold"
              aria-label={`Abrir conversa no WhatsApp com ${lead.name || lead.whatsapp}`}
            >
              <MessageCircle size={16} className="shrink-0 text-green-600" />
              {formatWhatsAppDigits(lead.whatsapp)}
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
              <section className="space-y-4"><div><p className="font-body text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-gold">01 · Identidade</p><p className="mt-1 font-body text-xs leading-5 text-brand-ink/50">A marca aparece maior e o modelo fica logo abaixo na vitrine.</p></div><div className="grid gap-3 sm:grid-cols-2"><div><label className="mb-1.5 block font-body text-[10px] font-semibold uppercase tracking-[0.13em] text-brand-ink/55">Marca</label><input required placeholder="Ex.: Ray-Ban" value={form.brand} onChange={(event) => setForm({ ...form, brand: event.target.value })} className="input-premium" /></div><div><label className="mb-1.5 block font-body text-[10px] font-semibold uppercase tracking-[0.13em] text-brand-ink/55">Modelo</label><input required placeholder="Ex.: RB3025" value={form.model} onChange={(event) => setForm({ ...form, model: event.target.value, name: event.target.value })} className="input-premium" /></div></div><div className="grid gap-3 sm:grid-cols-3"><input placeholder="URL amigável (opcional)" value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} className="input-premium" /><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="input-premium"><option>Óculos de Sol</option><option>Óculos de Grau</option><option>Armações</option><option>Acessórios</option></select><select value={form.gender} onChange={(event) => setForm({ ...form, gender: event.target.value })} className="input-premium" aria-label="Público"><option value="unissex">Unisex — masculino e feminino</option><option value="masculino">Masculino</option><option value="feminino">Feminino</option></select></div><textarea placeholder="Descrição do produto" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="input-premium min-h-28 resize-y" /></section>

              <section className="space-y-4"><div><p className="font-body text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-gold">02 · Preço e presença</p><p className="mt-1 font-body text-xs text-brand-ink/50">O preço promocional aparece junto ao preço anterior riscado.</p></div><div className="grid gap-3 sm:grid-cols-2"><div><label className="mb-1.5 block font-body text-[10px] font-semibold uppercase tracking-[0.13em] text-brand-ink/55">Preço atual/promocional</label><input required type="text" inputMode="decimal" placeholder="Ex.: 189,90" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} className="input-premium" /></div><div><label className="mb-1.5 block font-body text-[10px] font-semibold uppercase tracking-[0.13em] text-brand-ink/55">Preço anterior (opcional)</label><input type="text" inputMode="decimal" placeholder="Ex.: 249,90" value={form.compare_at_price} onChange={(event) => setForm({ ...form, compare_at_price: event.target.value })} className="input-premium" /></div></div>{discountPreview && <p className="rounded-xl bg-brand-gold/10 px-4 py-3 font-body text-xs text-brand-gold">Oferta de aproximadamente <strong>{discountPreview}% OFF</strong>.</p>}<div className="rounded-2xl border border-brand-ink/10 bg-brand-paper p-4"><label className="flex cursor-pointer items-start gap-3"><input type="checkbox" checked={form.installmentsEnabled} onChange={(event) => setForm({ ...form, installmentsEnabled: event.target.checked })} className="mt-0.5 accent-brand-gold" /><span><strong className="block font-body text-sm text-brand-ink">Exibir parcelamento</strong><small className="mt-1 block font-body text-xs leading-5 text-brand-ink/50">Opcional. Aparece logo abaixo do preço na vitrine.</small></span></label>{form.installmentsEnabled && <div className="mt-4 grid gap-3 sm:grid-cols-2"><div><label className="mb-1.5 block font-body text-[10px] font-semibold uppercase tracking-[0.13em] text-brand-ink/55">Número de parcelas</label><input type="number" min="1" max="24" value={form.installmentCount} onChange={(event) => setForm({ ...form, installmentCount: event.target.value })} className="input-premium" /></div><div><label className="mb-1.5 block font-body text-[10px] font-semibold uppercase tracking-[0.13em] text-brand-ink/55">Valor de cada parcela</label><input type="text" inputMode="decimal" placeholder="Ex.: 99,90" value={form.installmentAmount} onChange={(event) => setForm({ ...form, installmentAmount: event.target.value })} className="input-premium" /></div></div>}{form.installmentsEnabled && parseNumber(form.installmentAmount) > 0 && <p className="mt-3 rounded-xl bg-brand-gold/10 px-4 py-3 font-body text-xs text-brand-gold">Prévia: <strong>{form.installmentCount || "1"}x de {formatBRL(parseNumber(form.installmentAmount))}</strong></p>}</div><input type="number" min="0" placeholder="Quantidade em estoque" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} className="input-premium" /><div className="grid gap-3 sm:grid-cols-2"><label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-brand-ink/10 bg-brand-paper p-4"><input type="checkbox" checked={form.featured} onChange={(event) => setForm({ ...form, featured: event.target.checked })} className="mt-0.5 accent-brand-gold" /><span><strong className="block font-body text-sm text-brand-ink">Destaque</strong><small className="mt-1 block font-body text-xs leading-5 text-brand-ink/50">Exibe também na faixa de curadoria da home.</small></span></label><label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-brand-ink/10 bg-brand-paper p-4"><input type="checkbox" checked={form.more_sold} onChange={(event) => setForm({ ...form, more_sold: event.target.checked })} className="mt-0.5 accent-brand-gold" /><span><strong className="block font-body text-sm text-brand-ink">Mais vendido</strong><small className="mt-1 block font-body text-xs leading-5 text-brand-ink/50">Mostra um selo no topo do card e do produto.</small></span></label></div><label className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors ${form.sold_out ? "border-red-200 bg-red-50" : "border-brand-ink/10 bg-brand-paper"}`}><input type="checkbox" checked={form.sold_out} onChange={(event) => setForm({ ...form, sold_out: event.target.checked })} className="mt-0.5 accent-red-600" /><span><strong className={`block font-body text-sm ${form.sold_out ? "text-red-700" : "text-brand-ink"}`}>Já vendeu tudo / esgotado</strong><small className="mt-1 block font-body text-xs leading-5 text-brand-ink/50">Some da vitrine como disponível, mas o cliente ainda consegue abrir o produto e pedir pelo WhatsApp. Quando repor, é só desmarcar — nada é apagado.</small></span></label></section>

              <section className="space-y-4"><div><p className="font-body text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-gold">03 · Fotos do produto</p><p className="mt-1 font-body text-xs text-brand-ink/50">Arraste as imagens para cá ou escolha os arquivos no celular/computador.</p></div><div onDragOver={(event) => { event.preventDefault(); setDragTarget("images"); }} onDragLeave={() => setDragTarget(null)} onDrop={(event) => handleDrop(event, "images")} className={`rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${dragTarget === "images" ? "border-brand-gold bg-brand-gold/10" : "border-brand-ink/15 bg-brand-paper"}`}><UploadCloud className="mx-auto text-brand-gold" size={26} strokeWidth={1.5} /><p className="mt-3 font-body text-sm font-semibold text-brand-ink">Solte suas fotos aqui</p><p className="mt-1 font-body text-xs text-brand-ink/45">JPG, PNG ou WebP · várias imagens permitidas</p><label className="btn-brand mt-4 cursor-pointer">Escolher imagens<input type="file" accept="image/*" multiple className="sr-only" onChange={(event) => { if (event.target.files) void uploadFiles(event.target.files, "images"); }} /></label></div><textarea value={form.imagesText} onChange={(event) => setForm({ ...form, imagesText: event.target.value })} className="input-premium min-h-24 resize-y text-xs" placeholder="Ou cole URLs públicas, uma por linha" />{form.imagesText && <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">{form.imagesText.split("\n").filter(Boolean).map((url) => <div key={url} className="aspect-square overflow-hidden rounded-xl bg-brand-sage/50"><img src={url} alt="Prévia" className="h-full w-full object-contain p-2 mix-blend-multiply" /></div>)}</div>}</section>

              <section className="space-y-4"><div><p className="font-body text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-gold">04 · Cores e variações</p><p className="mt-1 font-body text-xs leading-5 text-brand-ink/50">Cada bolinha é uma opção que aparecerá no card da loja. Selecione uma cor, informe o nome, escolha o tom e cole a foto específica daquele modelo.</p></div><div className="flex flex-wrap gap-2">{form.colors.map((color, index) => <button key={`${color.name}-${index}`} type="button" onClick={() => setSelectedColorIndex(index)} className={`flex items-center gap-2 rounded-full border px-3 py-2 font-body text-xs transition-colors ${selectedColorIndex === index ? "border-brand-gold bg-brand-gold/10 text-brand-ink" : "border-brand-ink/10 bg-brand-paper text-brand-ink/60"} ${color.sold_out ? "opacity-60" : ""}`}><span className="relative block h-4 w-4 shrink-0 overflow-hidden rounded-full border border-brand-ink/10"><span className="absolute inset-0" style={{ backgroundColor: color.hex }} />{color.sold_out && <span className="absolute left-1/2 top-1/2 h-[150%] w-[1.5px] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white" />}</span>{color.name || "Sem nome"}{color.sold_out && <span className="rounded-full bg-brand-ink/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-brand-ink/50">Esgotada</span>}</button>)}<button type="button" onClick={addColorField} className="flex items-center gap-1 rounded-full border border-dashed border-brand-gold px-3 py-2 font-body text-xs font-semibold text-brand-gold"><Plus size={13} /> Adicionar cor</button></div>{form.colors.length > 0 && form.colors[selectedColorIndex] && <div className="rounded-2xl bg-brand-paper p-4"><div className="flex items-center justify-between"><p className="font-body text-xs font-semibold uppercase tracking-[0.14em] text-brand-ink/55">Editando cor {selectedColorIndex + 1}</p><button type="button" onClick={() => removeColorField(selectedColorIndex)} className="text-brand-ink/40 hover:text-red-600" aria-label="Remover cor permanentemente"><Trash2 size={15} /></button></div><label className={`mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors ${form.colors[selectedColorIndex].sold_out ? "border-red-200 bg-red-50" : "border-brand-ink/10 bg-brand-cream"}`}><input type="checkbox" checked={Boolean(form.colors[selectedColorIndex].sold_out)} onChange={() => toggleColorSoldOut(selectedColorIndex)} className="mt-0.5 accent-red-600" /><span><strong className={`block font-body text-sm ${form.colors[selectedColorIndex].sold_out ? "text-red-700" : "text-brand-ink"}`}>Marcar esta cor como esgotada</strong><small className="mt-1 block font-body text-xs leading-5 text-brand-ink/50">Some da venda e vai para o final na vitrine, mas continua salva. Quando chegar mais estoque, é só desmarcar — não precisa cadastrar de novo.</small></span></label><div className="mt-4 grid gap-3 sm:grid-cols-[1fr_130px]"><input placeholder="Nome (ex.: Tartaruga)" value={form.colors[selectedColorIndex].name} onChange={(event) => updateColorField(selectedColorIndex, "name", event.target.value)} className="input-premium" /><label className="flex items-center gap-3 rounded-2xl border border-brand-ink/10 px-3 py-2"><span className="h-8 w-8 rounded-full border border-brand-ink/10" style={{ backgroundColor: form.colors[selectedColorIndex].hex }} /><input type="color" value={form.colors[selectedColorIndex].hex} onChange={(event) => updateColorField(selectedColorIndex, "hex", event.target.value)} className="h-8 w-10 cursor-pointer border-0 bg-transparent" /><span className="font-body text-xs text-brand-ink/50">Tom</span></label></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="block font-body text-[10px] font-semibold uppercase tracking-[0.13em] text-brand-ink/55">Armação<input placeholder="Ex.: Preto" value={form.colors[selectedColorIndex].frame_color || ""} onChange={(event) => updateColorField(selectedColorIndex, "frame_color", event.target.value)} className="input-premium mt-2 text-sm normal-case tracking-normal" /></label><label className="block font-body text-[10px] font-semibold uppercase tracking-[0.13em] text-brand-ink/55">Lentes<input placeholder="Ex.: Verde" value={form.colors[selectedColorIndex].lens_color || ""} onChange={(event) => updateColorField(selectedColorIndex, "lens_color", event.target.value)} className="input-premium mt-2 text-sm normal-case tracking-normal" /></label></div><div className="mt-5 rounded-2xl border border-brand-ink/10 bg-brand-sage/30 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-body text-[10px] font-semibold uppercase tracking-[0.13em] text-brand-ink/60">Galeria desta variação</p><p className="mt-1 max-w-md font-body text-xs leading-5 text-brand-ink/50">Cadastre todos os ângulos desta cor. Essa galeria aparecerá quando o cliente tocar nesta bolinha.</p></div><span className="shrink-0 rounded-full bg-brand-paper px-2.5 py-1 font-body text-[10px] font-semibold text-brand-ink/55">{(form.colors[selectedColorIndex].images ?? []).length} fotos</span></div><div onDragOver={(event) => { event.preventDefault(); setDragTarget("color"); }} onDragLeave={() => setDragTarget(null)} onDrop={(event) => handleColorDrop(event, selectedColorIndex)} className={`mt-4 flex flex-col items-center gap-3 rounded-xl border-2 border-dashed p-4 text-center transition-colors sm:flex-row sm:text-left ${dragTarget === "color" ? "border-brand-gold bg-brand-gold/10" : "border-brand-ink/15 bg-brand-paper/60"}`}><UploadCloud className="shrink-0 text-brand-gold" size={22} /><div className="min-w-0 flex-1"><p className="font-body text-xs font-semibold text-brand-ink">Arraste vários ângulos desta cor</p><p className="mt-1 font-body text-[11px] leading-4 text-brand-ink/45">Frente, lateral, haste, detalhe e embalagem.</p></div><label className="btn-brand shrink-0 cursor-pointer px-4 py-2 text-[10px]">Adicionar fotos<input type="file" accept="image/*" multiple className="sr-only" onChange={(event) => { if (event.target.files) void uploadColorImages(event.target.files, selectedColorIndex); }} /></label></div><textarea value={(form.colors[selectedColorIndex].images ?? []).join("\n")} onChange={(event) => updateColorImagesText(selectedColorIndex, event.target.value)} className="input-premium mt-3 min-h-24 resize-y text-xs" placeholder="Ou cole várias URLs públicas, uma por linha" />{(form.colors[selectedColorIndex].images ?? []).length > 0 && <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">{(form.colors[selectedColorIndex].images ?? []).map((url, imageIndex) => <div key={`${url}-${imageIndex}`} className="group relative aspect-square overflow-hidden rounded-xl bg-brand-paper"><img src={url} alt={`Ângulo ${imageIndex + 1}`} className="h-full w-full object-contain p-1 mix-blend-multiply" /><button type="button" onClick={() => removeColorImage(selectedColorIndex, imageIndex)} className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-ink/80 text-[11px] text-brand-paper opacity-0 transition-opacity group-hover:opacity-100" aria-label={`Remover ângulo ${imageIndex + 1}`}>×</button></div>)}</div>}<p className="mt-3 font-body text-[11px] leading-5 text-brand-ink/45">Exemplo: a cor preta pode ter 4 fotos do óculos preto. Ao escolher dourado, o cliente verá somente a galeria dourada.</p></div></div>}</section>

              <section className="space-y-4"><div><p className="font-body text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-gold">05 · Coleções</p><p className="mt-1 font-body text-xs leading-5 text-brand-ink/50">Marque em quais vitrines (marcas ou recortes como "Ciclista") este produto deve aparecer. Pode marcar mais de uma — ele continua aparecendo só 1 vez na coleção completa.</p></div>{collections.length === 0 ? <p className="rounded-xl bg-brand-paper px-4 py-3 font-body text-xs text-brand-ink/50">Nenhuma coleção cadastrada ainda. Crie uma lá em cima, em "Marcas e coleções".</p> : <div className="flex flex-wrap gap-2">{collections.map((collection) => { const active = form.collection_slugs.includes(collection.slug); return <button key={collection.id} type="button" onClick={() => toggleFormCollection(collection.slug)} className={`rounded-full border px-3 py-2 font-body text-xs transition-colors ${active ? "border-brand-gold bg-brand-gold/10 text-brand-ink" : "border-brand-ink/10 bg-brand-paper text-brand-ink/60"}`}>{collection.name}</button>; })}</div>}</section>

              <section className="space-y-4"><div><p className="font-body text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-gold">06 · Especificações</p><p className="mt-1 font-body text-xs leading-5 text-brand-ink/50">Aparece no acordeão "Especificações" na página do produto, junto do gênero já definido acima. Deixe em branco o que não se aplicar.</p></div><div className="grid gap-3 sm:grid-cols-2"><div><label className="mb-1.5 block font-body text-[10px] font-semibold uppercase tracking-[0.13em] text-brand-ink/55">Material</label><select value={form.specMaterial} onChange={(event) => setForm({ ...form, specMaterial: event.target.value })} className="input-premium"><option value="">Não informar</option><option>Acetato</option><option>Metal</option><option>Titânio</option><option>Policarbonato</option><option>Alumínio</option></select></div><div><label className="mb-1.5 block font-body text-[10px] font-semibold uppercase tracking-[0.13em] text-brand-ink/55">Formato</label><input placeholder="Ex.: Redondo, Quadrado, Aviador..." value={form.specFormat} onChange={(event) => setForm({ ...form, specFormat: event.target.value })} className="input-premium" /></div><div><label className="mb-1.5 block font-body text-[10px] font-semibold uppercase tracking-[0.13em] text-brand-ink/55">Garantia</label><input placeholder="Ex.: 12 meses contra defeito de fabricação" value={form.specWarranty} onChange={(event) => setForm({ ...form, specWarranty: event.target.value })} className="input-premium" /></div><div><label className="mb-1.5 block font-body text-[10px] font-semibold uppercase tracking-[0.13em] text-brand-ink/55">Tipo de lente</label><input placeholder="Ex.: Visão simples, Antirreflexo..." value={form.specLensType} onChange={(event) => setForm({ ...form, specLensType: event.target.value })} className="input-premium" /></div></div><div><label className="mb-1.5 block font-body text-[10px] font-semibold uppercase tracking-[0.13em] text-brand-ink/55">Conteúdo da embalagem</label><textarea placeholder="Ex.: Óculos, flanela, estojo e certificado de garantia" value={form.specPackageContents} onChange={(event) => setForm({ ...form, specPackageContents: event.target.value })} className="input-premium min-h-20 resize-y" /><p className="mt-1.5 font-body text-[11px] leading-4 text-brand-ink/40">Pode variar por produto — ajuste se algum modelo não incluir estojo, flanela ou certificado.</p></div></section>

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
