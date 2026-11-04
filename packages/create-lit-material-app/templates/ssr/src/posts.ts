// Stands in for your API or database. A loader can be any async function: fetch(), an SQL query, a CMS.
export interface Post {
  slug: string;
  title: string;
  body: string;
}

const posts: Post[] = [
  { slug: "hello", title: "Hello, world", body: "This page was rendered on the server, with its data, then hydrated." },
  { slug: "loaders", title: "Route loaders", body: "A route's loader runs before it renders, on the server and on navigation." },
];

export async function listPosts(): Promise<Post[]> {
  return posts;
}

export async function getPost(slug: string): Promise<Post | undefined> {
  return posts.find((post) => post.slug === slug);
}
