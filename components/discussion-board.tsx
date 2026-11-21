"use client";
import { useState } from "react";

const initial = [
  { id: 1, topic: "Questions", author: "Maya T.", time: "2 hours ago", title: "How do you keep watercolors from getting muddy?", body: "I'm practicing landscapes and would love to hear your favorite tips for keeping colors fresh.", votes: 24, replies: ["Try letting each layer dry before adding the next one!", "A limited palette helped me a lot."] },
  { id: 2, topic: "Share your work", author: "Emma R.", time: "5 hours ago", title: "Finally filled my first sketchbook!", body: "It's full of wonky drawings and little experiments, but I'm proud I kept going. What are you working on lately?", votes: 38, replies: ["That's such a lovely milestone. Congratulations!"] },
  { id: 3, topic: "Tips & advice", author: "Oliver C.", time: "Yesterday", title: "A small reminder for anyone starting out", body: "Ten minutes of making something counts. Your practice doesn't have to be perfect to be worthwhile.", votes: 51, replies: ["I needed this reminder today."] },
  { id: 4, topic: "Inspiration", author: "Sofia L.", time: "Yesterday", title: "Where do you find your color inspiration?", body: "I've been collecting colors from walks around my neighborhood. I'd love to hear what inspires your palettes.", votes: 17, replies: [] as string[] },
];
const topics = ["All discussions", "Questions", "Share your work", "Tips & advice", "Inspiration"];
export default function DiscussionBoard() {
  const [posts, setPosts] = useState(initial);
  const [topic, setTopic] = useState(topics[0]);
  const [open, setOpen] = useState<number | null>(null);
  const [voted, setVoted] = useState<number[]>([]);
  const [reply, setReply] = useState("");
  const [writing, setWriting] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [newTopic, setNewTopic] = useState(topics[1]);
  return <section aria-label="Discussions">
    <div className="discussion-bar"><div><strong>Community discussions</strong><p>Pull up a chair and join in.</p></div><button className="discussion-primary" onClick={() => setWriting(!writing)}>{writing ? "Cancel" : "+ Start a discussion"}</button></div>
    <p className="discussion-note">Preview discussions · Posts and replies last for this session only.</p>
    {writing && <form className="discussion-form" onSubmit={(e) => { e.preventDefault(); if (!title.trim() || !body.trim()) return; setPosts([{ id: Date.now(), topic: newTopic, author: "You", time: "Just now", title: title.trim(), body: body.trim(), votes: 0, replies: [] }, ...posts]); setTopic(topics[0]); setTitle(""); setBody(""); setWriting(false); }}><label>Topic<select value={newTopic} onChange={e => setNewTopic(e.target.value)}>{topics.slice(1).map(t => <option key={t}>{t}</option>)}</select></label><label>Title<input required value={title} onChange={e => setTitle(e.target.value)} placeholder="What would you like to talk about?" /></label><label>Your post<textarea required value={body} onChange={e => setBody(e.target.value)} placeholder="Share a little more..." /></label><button className="discussion-primary">Post discussion</button></form>}
    <div className="filter-tabs" role="group" aria-label="Filter discussions">{topics.map(t => <button key={t} aria-pressed={topic === t} className={topic === t ? "selected" : ""} onClick={() => setTopic(t)}>{t}</button>)}</div>
    <div className="discussion-list">{posts.filter(p => topic === topics[0] || p.topic === topic).map(p => <article className="discussion-post" key={p.id}><button className={`discussion-vote ${voted.includes(p.id) ? "selected" : ""}`} aria-label={`Appreciate ${p.title}`} aria-pressed={voted.includes(p.id)} onClick={() => setVoted(voted.includes(p.id) ? voted.filter(id => id !== p.id) : [...voted, p.id])}>↑<span>{p.votes + (voted.includes(p.id) ? 1 : 0)}</span></button><div className="discussion-content"><div className="discussion-meta"><span>{p.topic}</span> · {p.author} · {p.time}</div><h2>{p.title}</h2><p>{p.body}</p><button className="discussion-replies" aria-expanded={open === p.id} onClick={() => { setOpen(open === p.id ? null : p.id); setReply(""); }}>♡ &nbsp; {p.replies.length} {p.replies.length === 1 ? "reply" : "replies"} {open === p.id ? "↑" : "↓"}</button>{open === p.id && <div className="discussion-thread">{p.replies.map((r, i) => <p key={i}>{r}</p>)}<form onSubmit={e => { e.preventDefault(); if (!reply.trim()) return; setPosts(posts.map(post => post.id === p.id ? { ...post, replies: [...post.replies, reply.trim()] } : post)); setReply(""); }}><input aria-label="Write a reply" placeholder="Add a thoughtful reply..." value={reply} onChange={e => setReply(e.target.value)} required /><button className="discussion-primary">Reply</button></form></div>}</div></article>)}</div>
  </section>;
}
