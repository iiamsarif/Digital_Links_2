import { useEffect, useRef, useState } from "react";
import { apiFetch, resolveAssetUrl } from "../utils/api.js";
import "./AdminPanel.css";

const photoSlots = 10;
const defaultPackageItems = [
  "Semantic\nSearch",
  "Stable &\nInnovative",
  "Cost-effective",
  "Plugins for\nFunctionalities",
  "Content\nUpdating",
];
const defaultPackagePrice = "Price 5000";

export default function AdminPanel() {
  const defaultTransformText =
    "From autonomous agent to product cockpit. Strategy bots, design systems, dashboards, and deployment pipelines converge into one polished client-facing workspace.";
  const [token, setToken] = useState(() => window.localStorage.getItem("adminToken") || "");
  const [login, setLogin] = useState({ admin: "", password: "" });
  const [photos, setPhotos] = useState([]);
  const [photoForm, setPhotoForm] = useState({
    title: "",
    file: null,
    preview: "",
  });
  const photoInputRef = useRef(null);
  const [links, setLinks] = useState([""]);
  const [transformText, setTransformText] = useState(defaultTransformText);
  const [packageItems, setPackageItems] = useState(defaultPackageItems);
  const [packagePriceText, setPackagePriceText] = useState(defaultPackagePrice);
  const [packageLogoUrl, setPackageLogoUrl] = useState("");
  const [packageLogoFile, setPackageLogoFile] = useState(null);
  const [packageLogoPreview, setPackageLogoPreview] = useState("");
  const [message, setMessage] = useState("");
  const [activePanel, setActivePanel] = useState("photos");

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const loadData = async () => {
    const [photosResult, projectsResult, contentResult, packageResult] = await Promise.all([
      apiFetch("/api/photos").catch(() => ({ photos: [] })),
      apiFetch("/api/projects").catch(() => ({ links: [] })),
      apiFetch("/api/content/transform").catch(() => ({ text: "" })),
      apiFetch("/api/content/package").catch(() => ({ items: [] })),
    ]);
    setPhotos(photosResult.photos || []);
    const nextLinks = (projectsResult.links || []).filter((link) => String(link || "").trim().length > 0);
    setLinks(nextLinks.length ? nextLinks : [""]);
    setTransformText(contentResult.text || defaultTransformText);
    const nextPackageItems = (packageResult.items || []).filter(Boolean);
    setPackageItems(nextPackageItems.length ? [...nextPackageItems, ...defaultPackageItems].slice(0, 5) : defaultPackageItems);
    setPackagePriceText(packageResult.priceText || defaultPackagePrice);
    setPackageLogoUrl(resolveAssetUrl(packageResult.logoUrl || ""));
    setPackageLogoFile(null);
    setPackageLogoPreview("");
  };

  useEffect(() => {
    if (token) loadData();
  }, [token]);

  useEffect(() => {
    return () => {
      if (photoForm.preview) URL.revokeObjectURL(photoForm.preview);
      if (packageLogoPreview) URL.revokeObjectURL(packageLogoPreview);
    };
  }, [photoForm.preview, packageLogoPreview]);

  const submitLogin = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      const result = await apiFetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(login),
      });
      window.localStorage.setItem("adminToken", result.token);
      setToken(result.token);
      setMessage("Logged in.");
    } catch (error) {
      setMessage(error.message);
    }
  };

  const submitPhoto = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      if (photos.length >= photoSlots) {
        const maxMessage = "Maximum 10 photos reached. Delete one photo before uploading another.";
        window.alert(maxMessage);
        setMessage(maxMessage);
        return;
      }

      if (!photoForm.file) {
        setMessage("Select one photo.");
        return;
      }

      const formData = new FormData();
      formData.append("title", photoForm.title || photoForm.file.name);
      formData.append("photo", photoForm.file);

      await apiFetch("/api/photos", {
        method: "POST",
        headers: authHeaders,
        body: formData,
      });

      if (photoForm.preview) URL.revokeObjectURL(photoForm.preview);
      setPhotoForm({
        title: "",
        file: null,
        preview: "",
      });
      if (photoInputRef.current) photoInputRef.current.value = "";
      await loadData();
      setMessage("1 photo(s) added.");
    } catch (error) {
      setMessage(error.message);
    }
  };

  const deletePhoto = async (id) => {
    setMessage("");
    try {
      await apiFetch(`/api/photos/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      await loadData();
      setMessage("Photo deleted.");
    } catch (error) {
      setMessage(error.message);
    }
  };

  const saveLinks = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      const result = await apiFetch("/api/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ links }),
      });
      const nextLinks = (result.links || []).filter((link) => String(link || "").trim().length > 0);
      setLinks(nextLinks.length ? nextLinks : [""]);
      setMessage("Project links saved.");
    } catch (error) {
      setMessage(error.message);
    }
  };

  const saveTransformText = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      const result = await apiFetch("/api/content/transform", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ text: transformText }),
      });
      setTransformText(result.text || "");
      setMessage("How We Works section content saved.");
    } catch (error) {
      setMessage(error.message);
    }
  };

  const savePackageItems = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      if (packageLogoFile) {
        const logoFormData = new FormData();
        logoFormData.append("logo", packageLogoFile);
        const logoResult = await apiFetch("/api/content/package/logo", {
          method: "POST",
          headers: authHeaders,
          body: logoFormData,
        });
        setPackageLogoUrl(resolveAssetUrl(logoResult.logoUrl || ""));
        setPackageLogoFile(null);
        if (packageLogoPreview) {
          URL.revokeObjectURL(packageLogoPreview);
          setPackageLogoPreview("");
        }
      }

      const result = await apiFetch("/api/content/package", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ items: packageItems, priceText: packagePriceText }),
      });
      const nextPackageItems = (result.items || []).filter(Boolean);
      setPackageItems(nextPackageItems.length ? [...nextPackageItems, ...defaultPackageItems].slice(0, 5) : defaultPackageItems);
      setPackagePriceText(result.priceText || defaultPackagePrice);
      setPackageLogoUrl(resolveAssetUrl(result.logoUrl || ""));
      setMessage("Package section content saved.");
    } catch (error) {
      setMessage(error.message);
    }
  };

  if (!token) {
    return (
      <main className="admin-page">
        <div className="admin-login-shell">
          <form className="admin-login" onSubmit={submitLogin}>
            <span>Digital Links Admin</span>
            <h1>Control proof photos and project links.</h1>
            <input
              autoComplete="username"
              onChange={(event) => setLogin((value) => ({ ...value, admin: event.target.value }))}
              placeholder="Admin ID"
              value={login.admin}
            />
            <input
              autoComplete="current-password"
              onChange={(event) => setLogin((value) => ({ ...value, password: event.target.value }))}
              placeholder="Password"
              type="password"
              value={login.password}
            />
            <button type="submit">Login</button>
            {message && <p>{message}</p>}
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-page admin-page--dashboard">
      <div className="layout-wrapper">
        <input type="checkbox" id="sidebar-toggle" hidden />
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="logo-icon">DL</div>
            <h2>Digital Links</h2>
          </div>
          <nav className="sidebar-nav">
            <ul>
              <li className={activePanel === "photos" ? "active" : ""}>
                <button
                  type="button"
                  className="sidebar-nav-btn"
                  onClick={() => setActivePanel("photos")}
                >
                  Add Photos
                </button>
              </li>
              <li className={activePanel === "projects" ? "active" : ""}>
                <button
                  type="button"
                  className="sidebar-nav-btn"
                  onClick={() => setActivePanel("projects")}
                >
                  Add Projects
                </button>
              </li>
              <li className={activePanel === "content" ? "active" : ""}>
                <button
                  type="button"
                  className="sidebar-nav-btn"
                  onClick={() => setActivePanel("content")}
                >
                  Content section&apos;s
                </button>
              </li>
              <li className={activePanel === "package" ? "active" : ""}>
                <button
                  type="button"
                  className="sidebar-nav-btn"
                  onClick={() => setActivePanel("package")}
                >
                  Package
                </button>
              </li>
              <li>
                <button
                  className="sidebar-logout"
                  type="button"
                  onClick={() => {
                    window.localStorage.removeItem("adminToken");
                    setToken("");
                  }}
                >
                  Logout
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        <label htmlFor="sidebar-toggle" className="sidebar-overlay" />

        <section className="main-content">
          <header className="topbar">
            <div className="topbar-left">
              <label htmlFor="sidebar-toggle" className="menu-toggle-btn">
                &#9776;
              </label>
              <div className="search-container">
                <input placeholder="Search" readOnly value="" />
              </div>
            </div>
            <div className="topbar-actions">
              <button type="button" className="icon-btn">
                •
              </button>
              <div className="profile-avatar">DL</div>
            </div>
          </header>

          <div className="content-wrapper">
            <header className="admin-header">
              <span>Private CMS</span>
              <h1 className="page-title">Manage live visuals.</h1>
              {message && <p className="status-message">{message}</p>}
            </header>

            <section className="card admin-card" id="photos" hidden={activePanel !== "photos"}>
              <h2>Add Photos</h2>
              <form className="admin-form" onSubmit={submitPhoto}>
                <input
                  onChange={(event) => setPhotoForm((value) => ({ ...value, title: event.target.value }))}
                  placeholder="Photo title prefix (optional)"
                  value={photoForm.title}
                />

                <label className="admin-upload-slot admin-upload-slot--single">
                  <span>Upload photo ({photos.length}/{photoSlots})</span>
                  <input
                    ref={photoInputRef}
                    accept="image/*"
                    onChange={(event) => {
                      const nextFile = event.target.files?.[0] || null;
                      setPhotoForm((value) => {
                        if (value.preview) URL.revokeObjectURL(value.preview);
                        return {
                          ...value,
                          file: nextFile,
                          preview: nextFile ? URL.createObjectURL(nextFile) : "",
                        };
                      });
                    }}
                    type="file"
                  />
                  {photoForm.preview ? (
                    <img src={photoForm.preview} alt="Preview selected upload" />
                  ) : (
                    <em>No preview</em>
                  )}
                </label>
                <button type="submit">Upload Photo</button>
              </form>

              <div className="admin-photo-grid">
                {photos.map((photo) => (
                  <article className="admin-photo" key={photo._id}>
                    <img alt={photo.title || "Proof upload"} src={resolveAssetUrl(photo.url)} />
                    <div>
                      <span>{photo.title || "Untitled"}</span>
                      <button type="button" onClick={() => deletePhoto(photo._id)}>
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="card admin-card" id="projects" hidden={activePanel !== "projects"}>
              <h2>Add Projects</h2>
              <form className="admin-form" onSubmit={saveLinks}>
                {links.map((link, index) => (
                  <div key={`project-link-${index}`} className="project-link-row">
                    <input
                      onChange={(event) => {
                        const next = [...links];
                        next[index] = event.target.value;
                        setLinks(next);
                      }}
                      placeholder={`Website link ${index + 1}`}
                      value={link}
                    />
                    <button
                      type="button"
                      className="project-link-remove"
                      onClick={() => {
                        if (links.length === 1) {
                          setLinks([""]);
                          return;
                        }
                        const next = links.filter((_, linkIndex) => linkIndex !== index);
                        setLinks(next.length ? next : [""]);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="project-link-add"
                  onClick={() => setLinks((current) => [...current, ""])}
                >
                  Add New Link
                </button>
                <button type="submit">Save Project Links</button>
              </form>
            </section>

            <section className="card admin-card" id="content" hidden={activePanel !== "content"}>
              <h2>Content section&apos;s</h2>
              <form className="admin-form" onSubmit={saveTransformText}>
                <label className="admin-field-label" htmlFor="transform-text">
                  How We Works section text
                </label>
                <textarea
                  id="transform-text"
                  value={transformText}
                  onChange={(event) => setTransformText(event.target.value)}
                  rows={6}
                />
                <button type="submit">Save Content</button>
              </form>
            </section>

            <section className="card admin-card" id="package" hidden={activePanel !== "package"}>
              <h2>Package</h2>
              <form className="admin-form" onSubmit={savePackageItems}>
                <label className="package-item-row">
                  <span>Center logo</span>
                  <input
                    accept="image/*"
                    type="file"
                    onChange={(event) => {
                      const file = event.target.files?.[0] || null;
                      setPackageLogoFile(file);
                      if (packageLogoPreview) URL.revokeObjectURL(packageLogoPreview);
                      setPackageLogoPreview(file ? URL.createObjectURL(file) : "");
                    }}
                  />
                  {(packageLogoPreview || packageLogoUrl) ? (
                    <img
                      className="package-logo-preview"
                      src={packageLogoPreview || packageLogoUrl}
                      alt="Package logo preview"
                    />
                  ) : (
                    <em>No logo uploaded</em>
                  )}
                </label>

                <label className="package-item-row">
                  <span>Price text</span>
                  <input
                    type="text"
                    value={packagePriceText}
                    onChange={(event) => setPackagePriceText(event.target.value)}
                    placeholder="Price 5000"
                  />
                </label>

                {packageItems.map((item, index) => (
                  <label className="package-item-row" key={`package-item-${index}`}>
                    <span>Package card {index + 1}</span>
                    <textarea
                      value={item}
                      onChange={(event) => {
                        const next = [...packageItems];
                        next[index] = event.target.value;
                        setPackageItems(next);
                      }}
                      rows={2}
                    />
                  </label>
                ))}
                <button type="submit">Save Package</button>
              </form>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
