const request = require("supertest");
const app = require("../index"); // Adjust path according to your project structure

describe("Express App Tests", () => {
  let sessionCookie;

  // Test the root login page
  test("GET / should return the login page", async () => {
    const response = await request(app).get("/");
    expect(response.statusCode).toBe(200);
    expect(response.type).toBe("text/html");
  });

  // Test the login functionality
  test("POST /login should handle correct login", async () => {
    const response = await request(app)
      .post("/login")
      .send("displayName=JohnDoe&password=brokenTelephone")
      .expect(302); // Expect a redirection

    sessionCookie = response.headers["set-cookie"][0].split(";")[0];
    expect(response.headers.location).toBe("/game");
  });

  test("POST /login should reject incorrect password", async () => {
    const response = await request(app)
      .post("/login")
      .send("displayName=JohnDoe&password=wrongPassword");

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("Incorrect password. Please try again.");
  });

  // Test the game page with authentication
  test("GET /game should require authentication", async () => {
    const response = await request(app).get("/game");
    expect(response.statusCode).toBe(302); // Should be redirected to login
    expect(response.headers.location).toBe("/");
  });

  test("GET /game should allow access with valid session", async () => {
    const response = await request(app)
      .get("/game")
      .set("Cookie", sessionCookie);

    expect(response.statusCode).toBe(200);
    expect(response.type).toBe("text/html");
  });

  // Test logging out
  test("GET /logout should clear the session and redirect", async () => {
    const response = await request(app)
      .get("/logout")
      .set("Cookie", sessionCookie);

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe("/");
  });

  // Test logged-in users route
  test("GET /loggedInUsers should return an empty list when not logged in", async () => {
    const response = await request(app).get("/loggedInUsers");
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([]);
  });

  test("GET /loggedInUsers should return list of logged-in users when logged in", async () => {
    const response = await request(app)
      .get("/loggedInUsers")
      .set("Cookie", sessionCookie);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([{ displayName: "JohnDoe" }]);
  });
});
