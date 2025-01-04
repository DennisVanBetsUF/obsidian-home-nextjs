import {unified} from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeSanitize from 'rehype-sanitize'
import rehypeRewrite from 'rehype-rewrite';
import rehypeStringify from 'rehype-stringify'

import { getLinksMapping, getPostBySlug, getSlugFromHref, updateMarkdownLinks } from './api'
import removeMd from 'remove-markdown'
import {Element} from 'hast-util-select'
import { renderToStaticMarkup } from "react-dom/server"
import NotePreview from '../components/misc/note-preview'
import { fromHtml } from 'hast-util-from-html'
import calloutsPlugin from "rehype-obsidian-callout";

const calloutsConfig = {
  callouts: {
    tip: {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgb(83, 223, 221)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>`
    }
  }
};


export async function markdownToHtml(markdown: string, currSlug: string) {
  markdown = updateMarkdownLinks(markdown, currSlug);

  // get mapping of current links
  const links = (getLinksMapping())[currSlug] as string[]
  const linkNodeMapping = new Map<string, Element>();
  for (const l of links) {
    const post = getPostBySlug(l, ['title', 'excerpt']);
    const node = createNoteNode(post.title, post.excerpt)
    linkNodeMapping[l] = node
  }

  let html = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(calloutsPlugin, calloutsConfig)
    // .use(rehypeSanitize)
    .use(rehypeRewrite, {
      selector: 'a',
      rewrite: async (node) => rewriteLinkNodes(node, linkNodeMapping, currSlug)
    })
    .use(rehypeStringify)
    .process(markdown);
  return html.toString();
}

export function getMDExcerpt(markdown: string, length: number = 500) {
  const text = removeMd(markdown, {
    stripListLeaders: false,
    gfm: true,
  }) as string
  return text.slice(0, length).trim();
}

export function createNoteNode(title: string, content: string) {
  const mdContentStr = getMDExcerpt(content);
  const htmlStr = renderToStaticMarkup(NotePreview({ title, content: mdContentStr }))
  const noteNode = fromHtml(htmlStr);
  return noteNode;
}

function rewriteLinkNodes (node, linkNodeMapping: Map<string, any>, currSlug) {
  if (node.type === 'element' && node.tagName === 'a') {
    const slug = getSlugFromHref(currSlug, node.properties.href)
    const noteCardNode = linkNodeMapping[slug]
    if (noteCardNode) {
      const anchorNode = {...node}
      anchorNode.properties.className = 'internal-link'
      node.tagName = 'span'
      node.properties = { className: 'internal-link-container' }
      node.children = [
        anchorNode,
        noteCardNode
      ]
    }
  }
}
