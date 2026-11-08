import { test, expect } from "@playwright/test";

test.describe("Agape Communion Church - Public Website & Admin E2E", () => {
  test("Public homepage renders reference visual sections and navigation", async ({
    request,
  }) => {
    const response = await request.get("/");
    expect(response.status()).toBe(200);
    const html = await response.text();

    expect(html).toContain("Welcome To");
    expect(html).toContain("Our Church");
    expect(html).toContain("Join the Sunday Live Stream");
    expect(html).toContain("We Love Serving Our Local Community");
    expect(html).toContain("Hope for Tomorrow");
  });

  test("Public routes (About, Services, Events, Messages, Blog, Devotionals, Testimonies, Livestream, Contact, Sitemap, Robots) respond with 200", async ({
    request,
  }) => {
    const routes = [
      "/about",
      "/services",
      "/events",
      "/messages",
      "/blog",
      "/devotionals",
      "/testimonies",
      "/livestream",
      "/contact",
      "/sitemap.xml",
      "/robots.txt",
    ];

    for (const route of routes) {
      const res = await request.get(route);
      expect(res.status(), `Expected 200 OK for ${route}`).toBe(200);
    }
  });

  test("Unauthenticated visitor is redirected from /admin to /admin/login", async ({
    request,
  }) => {
    const res = await request.get("/admin", { maxRedirects: 0 });
    expect([302, 307, 308]).toContain(res.status());
    expect(res.headers()["location"]).toContain("/admin/login");

    const loginPage = await request.get("/admin/login");
    expect(loginPage.status()).toBe(200);
    const loginHtml = await loginPage.text();
    expect(loginHtml).toContain("Administrator Sign In");
  });
});
