import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  createDefaultContent,
  heroSlidesSchema,
  profileSchema,
  siteContentSchema,
} from "@/lib/content/schema";
import {
  __resetContentDbCacheForTests,
  getContentSnapshot,
  resetSiteContent,
  updateSiteContent,
} from "@/lib/server/content-db";

let directory = "";
let dbPath = "";

async function useFreshDb(): Promise<void> {
  directory = await mkdtemp(join(tmpdir(), "tarcin-content-db-"));
  dbPath = join(directory, "site-content.json");
  __resetContentDbCacheForTests(dbPath);
}

async function readRaw(): Promise<Record<string, unknown>> {
  return JSON.parse(await readFile(dbPath, "utf8")) as Record<string, unknown>;
}

beforeEach(async () => {
  await useFreshDb();
});

afterEach(async () => {
  __resetContentDbCacheForTests();
  if (directory) await rm(directory, { recursive: true, force: true });
});

describe("content-db", () => {
  it("ilk açılışta veritabanı dosyasını varsayılan içerikle oluşturur", async () => {
    const snapshot = await getContentSnapshot();

    expect(snapshot.revision).toBe(1);
    expect(snapshot.updatedBy).toBe("seed");
    expect(snapshot.content).toEqual(createDefaultContent());

    const raw = await readRaw();
    expect(raw["version"]).toBe(1);
    expect(raw["revision"]).toBe(1);
  });

  it("admin kaydı veritabanına yazılır ve yeniden okumada korunur", async () => {
    const content = createDefaultContent();
    content.profile.fullName = "Yönetici Kişi";
    content.fixMenu.Salı.main = "Test Yemeği";

    const result = await updateSiteContent(
      { profile: content.profile, fixMenu: content.fixMenu },
      "admin",
      1,
    );

    expect(result.conflict).toBe(false);
    expect(result.snapshot.revision).toBe(2);

    const raw = await readRaw();
    const persisted = raw["content"] as {
      profile: { fullName: string };
      fixMenu: { Salı: { main: string } };
    };
    expect(persisted.profile.fullName).toBe("Yönetici Kişi");
    expect(persisted.fixMenu.Salı.main).toBe("Test Yemeği");

    // Önbelleği sıfırlayıp diskten oku: kaynak dosya, hafıza değil.
    __resetContentDbCacheForTests(dbPath);
    const reloaded = await getContentSnapshot();
    expect(reloaded.revision).toBe(2);
    expect(reloaded.content.profile.fullName).toBe("Yönetici Kişi");
  });

  it("tek bölüm güncellemesi diğer bölümlere dokunmaz", async () => {
    const before = await getContentSnapshot();
    const content = createDefaultContent();
    const first = content.testimonials[0];
    content.testimonials = [
      {
        id: "9",
        name: "Yeni Yorumcu",
        role: first?.role ?? "Ofis Yöneticisi",
        company: first?.company,
        comment: first?.comment ?? "Kurumsal tabldot hizmetinden çok memnun kaldık.",
        rating: 5,
      },
    ];

    const { snapshot } = await updateSiteContent(
      { testimonials: content.testimonials },
      "admin",
      before.revision,
    );

    expect(snapshot.content.categories).toEqual(before.content.categories);
    expect(snapshot.content.heroSlides).toEqual(before.content.heroSlides);
    expect(snapshot.content.testimonials).toHaveLength(1);
  });

  it("bayat sürümle yazmaya çalışan istek 409 conflict döner ve veri değişmez", async () => {
    await updateSiteContent(
      { profile: { ...createDefaultContent().profile, fullName: "Birinci" } },
      "admin",
      1,
    );

    const conflict = await updateSiteContent(
      { profile: { ...createDefaultContent().profile, fullName: "İkinci" } },
      "admin",
      1,
    );

    expect(conflict.conflict).toBe(true);
    expect(conflict.snapshot.content.profile.fullName).toBe("Birinci");
    expect((await readRaw())["revision"]).toBe(2);
  });

  it("geçersiz içerik veritabanına yazılmaz", async () => {
    const content = createDefaultContent();
    await expect(
      updateSiteContent(
        { profile: { ...content.profile, fullName: "Kontrol Karakteri\u0000" } },
        "admin",
        1,
      ),
    ).rejects.toThrow();

    expect((await readRaw())["revision"]).toBe(1);
  });

  it("sıfırlama tüm bölümleri varsayılanlara döndürür", async () => {
    const content = createDefaultContent();
    content.categories = [];
    await updateSiteContent(
      { profile: { ...content.profile, fullName: "Silinecek" }, fixMenu: content.fixMenu },
      "admin",
      1,
    );

    const snapshot = await resetSiteContent("admin");

    expect(snapshot.content).toEqual(createDefaultContent());
    expect(snapshot.revision).toBe(3);
  });

  it("bozuk dosya geliştirme ortamında varsayılanlarla devam eder", async () => {
    await writeFile(dbPath, "{ bozuk json", "utf8");
    __resetContentDbCacheForTests(dbPath);

    const snapshot = await getContentSnapshot();
    expect(snapshot.content).toEqual(createDefaultContent());
  });

  it("eşzamanlı kayıtlar sürümü yarıştırmaz", async () => {
    const content = createDefaultContent();
    const writes = Array.from({ length: 5 }, (_, index) =>
      updateSiteContent({ profile: { ...content.profile, fullName: `Kişi ${index}` } }, "admin"),
    );

    await Promise.all(writes);
    const snapshot = await getContentSnapshot();
    expect(snapshot.revision).toBe(6);
  });
});

describe("content schema", () => {
  it("varsayılan içer şemadan geçer", () => {
    expect(siteContentSchema.safeParse(createDefaultContent()).success).toBe(true);
  });

  it("javascript: ve veri: görsel adreslerini reddeder", () => {
    expect(
      heroSlidesSchema.safeParse([{ id: "a", src: "javascript:alert(1)", alt: "x" }]).success,
    ).toBe(false);
    expect(
      heroSlidesSchema.safeParse([{ id: "a", src: "data:text/html;base64,PHA+", alt: "x" }])
        .success,
    ).toBe(false);
    expect(
      heroSlidesSchema.safeParse([{ id: "a", src: "/content/hero-tabldot.jpg", alt: "x" }]).success,
    ).toBe(true);
  });

  it("boş e-postaya izin verir ama hatalı biçimi reddeder", () => {
    const base = createDefaultContent().profile;
    expect(profileSchema.safeParse({ ...base, email: "" }).success).toBe(true);
    expect(profileSchema.safeParse({ ...base, email: "eksik@invalid" }).success).toBe(false);
    expect(profileSchema.safeParse({ ...base, email: "ornek@firma.com.tr" }).success).toBe(true);
    expect(profileSchema.safeParse({ ...base, email: "<script@x" }).success).toBe(false);
  });
});
