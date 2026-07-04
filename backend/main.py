from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr

from .data import SITE_DATA

SECRET_KEY = "change-me-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 120

app = FastAPI(title="Darkvampire API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

BOOKINGS: List[Dict[str, Any]] = []
CONTACTS: List[Dict[str, Any]] = []
ADMIN_USER = {
    "email": "admin@darkvampire.studio",
    "password": "admin123",
    "name": "Studio Admin",
    "role": "admin",
}


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class BookingRequest(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    package: str
    preferredDate: Optional[str] = None
    message: Optional[str] = None


class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str


def create_access_token(data: Dict[str, Any]) -> str:
    payload = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload.update({"exp": expire})
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str) -> Dict[str, Any]:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError as exc:
        raise HTTPException(status_code=401, detail="Invalid authentication token") from exc


@app.get("/api/health")
def health() -> Dict[str, str]:
    return {"status": "ok", "service": "lumen-atelier-api"}


@app.get("/api/site")
def site() -> Dict[str, Any]:
    return SITE_DATA


@app.get("/api/seo")
def seo(path: str = "/") -> Dict[str, Any]:
    title_map = {
        "/": "Darkvampire | Luxury Photography Portfolio",
        "/portfolio": "Portfolio | Darkvampire",
        "/gallery": "Gallery | Darkvampire",
        "/blog": "Blog | Darkvampire",
        "/booking": "Booking | Darkvampire",
        "/contact": "Contact | Darkvampire",
        "/admin": "Dashboard | Darkvampire",
    }
    description_map = {
        "/": "Premium photography platform with cinematic editorial design, dynamic galleries, and CMS-ready architecture.",
        "/portfolio": "Explore curated portrait, wedding, fashion, travel, and commercial imagery.",
        "/gallery": "Browse a dynamic gallery with filters, metadata, and editorial presentation.",
        "/blog": "Read studio notes, creative insights, and luxury photography strategy.",
        "/booking": "Request a session, campaign, or bespoke creative direction from the studio.",
        "/contact": "Contact the studio for commissions, collaborations, and booking enquiries.",
        "/admin": "Secure dashboard for managing content, bookings, and contact activity.",
    }
    return {
        "title": title_map.get(path, f"{SITE_DATA['brand']['name']} | Premium Photography"),
        "description": description_map.get(path, SITE_DATA["hero"]["summary"]),
        "canonical": f"https://darkvampire.studio{path}",
        "openGraphImage": SITE_DATA["hero"]["image"],
        "twitterCard": "summary_large_image",
    }


@app.get("/api/photos")
def photos(category: Optional[str] = None, album: Optional[str] = None, search: Optional[str] = None) -> Dict[str, Any]:
    items = SITE_DATA["photos"]
    if category:
        items = [item for item in items if item["category"].lower() == category.lower()]
    if album:
        items = [item for item in items if item["album"].lower() == album.lower()]
    if search:
        query = search.lower()
        items = [
            item
            for item in items
            if query in item["title"].lower()
            or query in item["category"].lower()
            or query in " ".join(item["tags"]).lower()
        ]
    return {"items": items}


@app.get("/api/albums")
def albums() -> Dict[str, Any]:
    return {"items": SITE_DATA["albums"]}


@app.get("/api/blogs")
def blogs() -> Dict[str, Any]:
    return {"items": SITE_DATA["blogs"]}


@app.get("/api/faqs")
def faqs() -> Dict[str, Any]:
    return {"items": SITE_DATA["faqs"]}


@app.get("/api/search")
def search(q: str) -> Dict[str, Any]:
    query = q.lower().strip()
    if not query:
        return {"photos": [], "albums": [], "blogs": []}
    return {
        "photos": [
            item for item in SITE_DATA["photos"]
            if query in item["title"].lower() or query in item["category"].lower() or query in item["album"].lower()
        ],
        "albums": [item for item in SITE_DATA["albums"] if query in item["title"].lower()],
        "blogs": [item for item in SITE_DATA["blogs"] if query in item["title"].lower() or query in item["category"].lower()],
    }


@app.post("/api/bookings")
def create_booking(payload: BookingRequest) -> Dict[str, Any]:
    record = payload.dict()
    record["status"] = "pending"
    record["createdAt"] = datetime.utcnow().isoformat() + "Z"
    BOOKINGS.append(record)
    return {"ok": True, "booking": record}


@app.post("/api/contact")
def create_contact(payload: ContactRequest) -> Dict[str, Any]:
    record = payload.dict()
    record["createdAt"] = datetime.utcnow().isoformat() + "Z"
    CONTACTS.append(record)
    return {"ok": True, "message": "Message received", "contact": record}


@app.post("/api/auth/login")
def login(payload: LoginRequest) -> Dict[str, Any]:
    if payload.email != ADMIN_USER["email"] or payload.password != ADMIN_USER["password"]:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": ADMIN_USER["email"], "role": ADMIN_USER["role"], "name": ADMIN_USER["name"]})
    return {"accessToken": token, "user": {k: ADMIN_USER[k] for k in ("email", "name", "role")}}


@app.get("/api/admin/summary")
def admin_summary(token: str = "") -> Dict[str, Any]:
    if not token:
        raise HTTPException(status_code=401, detail="Missing token")
    verify_token(token)
    return {
        "counts": {
            "photos": len(SITE_DATA["photos"]),
            "albums": len(SITE_DATA["albums"]),
            "blogs": len(SITE_DATA["blogs"]),
            "bookings": len(BOOKINGS),
            "contacts": len(CONTACTS),
        },
        "recentBookings": BOOKINGS[-5:],
        "recentContacts": CONTACTS[-5:],
        "metrics": SITE_DATA["stats"],
    }


@app.get("/sitemap.xml")
def sitemap() -> Response:
    urls = [
        "https://darkvampire.studio/",
        "https://darkvampire.studio/portfolio",
        "https://darkvampire.studio/gallery",
        "https://darkvampire.studio/albums",
        "https://darkvampire.studio/categories",
        "https://darkvampire.studio/services",
        "https://darkvampire.studio/pricing",
        "https://darkvampire.studio/about",
        "https://darkvampire.studio/experience",
        "https://darkvampire.studio/awards",
        "https://darkvampire.studio/testimonials",
        "https://darkvampire.studio/blog",
        "https://darkvampire.studio/faq",
        "https://darkvampire.studio/booking",
        "https://darkvampire.studio/contact",
    ]
    body = ["<?xml version=\"1.0\" encoding=\"UTF-8\"?>", "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">"]
    for url in urls:
        body.append(f"<url><loc>{url}</loc><lastmod>{datetime.utcnow().date().isoformat()}</lastmod></url>")
    body.append("</urlset>")
    return Response(content="".join(body), media_type="application/xml")


@app.get("/robots.txt")
def robots() -> Response:
    content = "User-agent: *\nAllow: /\nSitemap: https://darkvampire.studio/sitemap.xml\n"
    return Response(content=content, media_type="text/plain")


@app.get("/rss.xml")
def rss() -> Response:
    items = []
    for blog in SITE_DATA["blogs"]:
        items.append(
            f"<item><title>{blog['title']}</title><description>{blog['excerpt']}</description><pubDate>{blog['date']}</pubDate></item>"
        )
    body = (
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
        "<rss version=\"2.0\"><channel>"
        f"<title>{SITE_DATA['brand']['name']} Journal</title>"
        f"<description>{SITE_DATA['hero']['summary']}</description>"
        + "".join(items)
        + "</channel></rss>"
    )
    return Response(content=body, media_type="application/rss+xml")
