import { createClient } from "https://esm.sh/@supabase/supabase-js";
import { config } from "./config.js";

const supabase = createClient(config.supabaseUrl, config.supabaseKey);

const id = localStorage.getItem("selectedPostId");

async function loadPost() {

  
    if (!id) {
        document.body.innerHTML = "<p>No post selected. <a href='index.html'>Go back</a></p>";
        return;
    }



    
    const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .single();

 



    if (error) {
        document.body.innerHTML = `<p>Error loading post: ${error.message}. <a href='index.html'>Go back</a></p>`;
        return;
    }
    document.getElementById("post-author").textContent  = "@" + data.author_name;
    document.getElementById("post-time").textContent    = data.time_label;
    document.getElementById("post-title").textContent   = data.title;
    document.getElementById("post-body").textContent    = data.full_body;
    document.getElementById("post-tag").textContent     = data.tag;
    document.getElementById("reply-placeholder").placeholder = "Reply to " + data.author_name + "…";
}

loadPost();