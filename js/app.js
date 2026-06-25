import { createClient } from "https://esm.sh/@supabase/supabase-js";
import { config } from "./config.js";

const supabase = createClient(config.supabaseUrl, config.supabaseKey);

const feed = document.querySelector("#feed");

async function loadPosts() {
    const { data } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

    feed.innerHTML = "";

    data.forEach((post) => {
        feed.innerHTML += `
            <article class="post-card" onclick="openPost('${post.id}')">
                <div class="post-card-header">
                    <img class="user" src="assets/user1.jpeg" />
                    <div class="meta">
                        <span class="handle">@${post.author_name}</span>
                        <span class="time">${post.time_label}</span>
                    </div>
                    <button class="icon-btn">
                        <img src="assets/icon-savetolist.png" />
                    </button>
                </div>

                <h4 class="post-title">${post.title}</h4>
                <p class="body-text">${post.preview_text}</p>

                <span class="tag-pill">${post.tag}</span>

                <div class="action-row">
                    <button class="action-btn"><img src="assets/icon-heart.png">212</button>
                    <button class="action-btn"><img src="assets/icon-dislike.png">0</button>
                    <button class="action-btn"><img src="assets/icon-comment.png">103</button>
                    <button class="action-btn share"><img src="assets/icon-share.png"></button>
                </div>

                <button class="see-replies" onclick="openPost('${post.id}')">
                    See replies (103) ...
                </button>
            </article>
        `;
    });
}

window.openPost = function(id) {
    localStorage.setItem("selectedPostId", id);
    window.location.href = "post.html";
}

loadPosts();