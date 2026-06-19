const topics = ["🍕 Food","💑 Relationships","🎮 Gaming","💰 Money","🐶 Pets","✈️ Travel","🎵 Music","📱 Tech","⚽ Sports","👗 Fashion","🏠 Roommates","🧠 Psychology","🎬 Movies","🍔 Fast Food","🎓 School","💼 Work","🚗 Cars","🎨 Art"];
  const track = document.getElementById('marquee');
  const list = [...topics, ...topics]; // duplicate for seamless loop
  track.innerHTML = list.map(t => `<span class="pill">${t}</span>`).join('');