import { createClient } from "https://esm.sh/@supabase/supabase-js";

// ⚠️  Replace these with your own Supabase project values
// Project Settings → API → Project URL + anon public key
const SUPABASE_URL = "https://pdflofygddwnlzrrpoox.supabase.co";
const SUPABASE_KEY = "sb_publishable_t3AmxMMjxpJrSFo9e5h9wA_Ul6FL3pA";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── DOM refs ───────────────────────────────────────────────
const screenFeed    = document.querySelector("#screen-feed");
const screenDetail  = document.querySelector("#screen-detail");
const postsDiv      = document.querySelector("#posts");
const detailPost    = document.querySelector("#detail-post");
const detailComments = document.querySelector("#detail-comments");

// ─── Helpers ────────────────────────────────────────────────
function timeAgo(dateStr) {
  const mins = Math.floor((Date.now() - new Date(dateStr)) / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  return `${Math.floor(hrs / 24)} days ago`;
}

function avatarColors(name = "") {
  const colors = ["#f277a4", "#e8d96a", "#a3c4f3", "#f4a261", "#90be6d"];
  return colors[name.charCodeAt(0) % colors.length];
}

function avatarHTML(authorName, size = "") {
  const color = avatarColors(authorName);
  const cls = size === "sm" ? "avatar avatar--sm" : "avatar";
  return `<div class="${cls}" style="background:${color}">${(authorName || "?")[0].toUpperCase()}</div>`;
}

// ─── Feed: load all posts ────────────────────────────────────
async function loadPosts() {
  postsDiv.innerHTML = `<p class="loading-msg">Loading posts…</p>`;

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    postsDiv.innerHTML = `<p class="loading-msg" style="color:#c24a78">
      Couldn't load posts — check your Supabase URL & key in app.js.
    </p>`;
    console.error(error);
    return;
  }

  postsDiv.innerHTML = "";

  data.forEach((post) => {
    postsDiv.innerHTML += `
      <article class="post-card" onclick="openPost('${post.id}')">
        <div class="post-card-header">
          ${avatarHTML(post.author_name)}
          <div class="meta">
            <span class="handle">@${post.author_name}</span>
            <span class="time">${timeAgo(post.created_at)}</span>
          </div>
          <button class="icon-btn bookmark-btn" type="button" aria-label="Bookmark">🔖</button>
        </div>

        <h4>${post.title}</h4>
        <p class="body-text">${post.body}</p>

        ${post.tag ? `<span class="tag-pill">${post.tag}</span>` : ""}

        <div class="action-row">
          <button class="action-btn" type="button" onclick="event.stopPropagation()">
            <span class="icon">🤍</span> ${post.like_count ?? 0}
          </button>
          <button class="action-btn" type="button" onclick="event.stopPropagation()">
            <span class="icon">👎</span> 0
          </button>
          <button class="action-btn" type="button" onclick="event.stopPropagation()">
            <span class="icon">💬</span> ${post.comment_count ?? 0}
          </button>
          <button class="action-btn share-btn" type="button" onclick="event.stopPropagation()">
            <span class="icon">↗</span>
          </button>
        </div>

        <button class="see-replies" type="button" onclick="event.stopPropagation(); openPost('${post.id}')">
          See replies (${post.comment_count ?? 0}) ...
        </button>
      </article>
    `;
  });
}

// ─── Detail: open a single post + its comments ──────────────
window.openPost = async function (id) {
  detailPost.innerHTML    = `<p class="loading-msg">Loading…</p>`;
  detailComments.innerHTML = "";

  // Switch screens
  screenFeed.hidden   = true;
  screenDetail.hidden = false;
  window.scrollTo(0, 0);

  // Fetch post and its comments in parallel
  const [postRes, commentsRes] = await Promise.all([
    supabase.from("posts").select("*").eq("id", id).single(),
    supabase.from("comments").select("*").eq("post_id", id).order("created_at", { ascending: false }),
  ]);

  if (postRes.error) {
    detailPost.innerHTML = `<p class="loading-msg" style="color:#c24a78">Couldn't load post.</p>`;
    console.error(postRes.error);
    return;
  }

  const post     = postRes.data;
  const comments = commentsRes.data ?? [];

  // Render the original post at the top
  detailPost.innerHTML = `
    <div class="post-card detail-post-card">
      <div class="post-card-header">
        ${avatarHTML(post.author_name)}
        <div class="meta">
          <span class="handle">@${post.author_name}</span>
          <span class="time">${timeAgo(post.created_at)}</span>
        </div>
        <button class="icon-btn bookmark-btn" type="button" aria-label="Bookmark">🔖</button>
      </div>

      <h4>${post.title}</h4>
      <p class="body-text body-text--full">${post.body}</p>

      ${post.tag ? `<span class="tag-pill">${post.tag}</span>` : ""}

      <div class="action-row">
        <button class="action-btn like-btn--active" type="button">
          <span class="icon">❤️</span> ${post.like_count ?? 0}
        </button>
        <button class="action-btn" type="button">
          <span class="icon">👎</span> 0
        </button>
        <button class="action-btn" type="button">
          <span class="icon">💬</span> ${comments.length}
        </button>
        <button class="action-btn share-btn" type="button">
          <span class="icon">↗</span>
        </button>
      </div>
    </div>
  `;

  // Render comments
  if (comments.length === 0) {
    detailComments.innerHTML = `<p class="loading-msg">No replies yet. Be the first!</p>`;
    return;
  }

  detailComments.innerHTML = comments.map((c) => `
    <div class="comment-card">
      <div class="post-card-header">
        ${avatarHTML(c.author_name)}
        <div class="meta">
          <span class="handle">@${c.author_name}</span>
          <span class="time">${timeAgo(c.created_at)}</span>
        </div>
      </div>
      <p class="body-text body-text--full">${c.body}</p>
      <div class="action-row">
        <button class="action-btn" type="button"><span class="icon">❤️</span> ${c.like_count ?? 0}</button>
        <button class="action-btn" type="button"><span class="icon">👎</span> 0</button>
        <button class="action-btn" type="button"><span class="icon">💬</span> ${c.reply_count ?? 0}</button>
        <button class="action-btn share-btn" type="button"><span class="icon">↗</span></button>
      </div>
      ${c.reply_count > 0 ? `<button class="see-replies" type="button">See replies (${c.reply_count}) ...</button>` : ""}
    </div>
  `).join("");
};

// ─── Go back to feed ─────────────────────────────────────────
window.goBack = function () {
  screenDetail.hidden = false; // keep in DOM
  screenFeed.hidden   = false;
  screenDetail.hidden = true;
  window.scrollTo(0, 0);
};

// ─── Boot ────────────────────────────────────────────────────
loadPosts();