# Code Snippets

## Pre-requisites
Before reading this document read documents that are available in this folder

- ./garchi-cms-doc.md
- ./garchi-sdk-node.md
- ./garchi-sdk-php.md

For OpenAPI reference of the Garchi CMS API [visit](https://garchi.co.uk/docs/v2.openapi)

These snippets are references to generate the necessary code for rendering content from Garchi CMS. These are in Next JS and same logic can be used in other tech stacks like Laravel, Nuxt, SvelteKit etc.

## Page rendering

A Page can be mapped to a headless web page in a website. To know more about page read [here](./garchi-cms-doc.md).

Each page's section map to a component in a code base. Below is an example of a how a page created on Garchi CMS with 3 sections namely Navbar, HeroContainer, BodyText can be rendered using Next JS.

Each section maps to it's respective reusable component in the code base.

```jsx
import Link from "next/link"

export default function Navbar({ image, ...other }) {
    return (
        <header className="flex justify-between items-center p-2" {...other}>
            <img className="w-10 h-10" src={image} />
            <ul className="flex items-center space-x-2">
                <Link href="/">Home</Link>
                <Link href="/blog">Blog</Link>
            </ul>
        </header>
    );
}
```

```jsx
// components/HeroContainer.jsx
export default function HeroContainer({ backgroundImage, title, subheading, ...other }) {
    const background = `url("${backgroundImage}")`;
    return (
        <div className="h-screen w-screen grid place-items-center bg-center bg-cover" 
        style={{backgroundImage: background}} {...other}>
            <div>
                <h1 className="text-xl text-white bg-black/40 p-1">{title}</h1>
                <h2 className="text-base text-white bg-black/40 p-1">{subheading}</h2>
            </div>
        </div>
    );
}

```

```jsx
// components/Paragraph.jsx
import MarkdownRenderer from '@/components/atoms/MarkdownRenderer'

export default function BodyText({
    content,
    ...other
}) {
  return (
    <MarkdownRenderer markdown={content} className='font-lora max-w-4xl mx-auto prose-td:p-2' {...other}  />
  )
}


```

Notice {...other} is passed as spread props. For every Garchi Section component, forward all unknown/extra props/attributes to the root element (the outermost wrapper). Garchi uses these attributes for the Visual Editor, so they must not be dropped.

Examples by stack:

React / Preact / Solid: spread ...other on root

Vue: v-bind="$attrs" on root (and don’t disable inheritAttrs unless you re-bind)

Svelte: ...$$restProps on root

Angular: bind/forward unknown attributes to the host/root element (don’t strip them; use host bindings / attribute passthrough patterns)

Web Components: forward attributes to the outermost element or keep them on the custom element host

---

The page api returns page details with associated sections. It's output schema can be found at [API Spec](https://garchi.co.uk/docs/v2.openapi). The recommended method is to use either Node or PHP sdk depending on the backend.

Read node sdk docs [here](./garchi-sdk-node.md)
Read PHP sdk docs [here](./garchi-sdk-php.md)

A dynamic component as below can be used to render these components dynamically. This acts as section renderer for all the Garchi CMS pages.

```tsx
// GarchiSectionRenderer.tsx

import { GarchiSection } from '@garchicms/garchi-node-sdk'
import dynamic from 'next/dynamic'
import React from 'react'

type Props = {
    section: GarchiSection
}

export default function GarchiSectionRenderer({ section }: Props) {

    if (!section)
        return <></>


    /*  
    * the description field of the section contains path to the component otherwise fallback is name field for the components
    * residing at same directory level of this component.
     */

    const Component = dynamic(() => import(`@/components/${section.description || section.name}`).catch( err => {
        const ErrorComponent = () => <></>
        ErrorComponent.displayName = 'ErrorComponent'
        return ErrorComponent
    }))
    
    const componentProps = section?.children.length > 0 ? {
        ...section.props,
        subsections: section.children
    } : section.props


  

    return (
        <Component {...componentProps} />
    )


}
```

Create a util to initiate Garchi client

```ts
import "server-only";
import GarchiCMS, { GarchiItemAPIResponse } from "@garchicms/garchi-node-sdk";
import { notFound } from "next/navigation";

// garchi client
export const garchi = new GarchiCMS({
    api_key: process.env.GARCHI_API_KEY,
    //headers : { key value pair of request headers}
});

export async function getPage(slug: string, mode: "draft" | "live") {
    try {
        return await garchi.headless.getPage({
            slug,
            space_uid: process.env.GARCHI_SPACE_UID!,
            mode
        })
    }
    catch (e) {
        return null
    }
}

```


Now using this util a page can be rendered.

```tsx
// app/[slug]/page.tsx

import GarchiSectionRenderer from "@/components/garchi/GarchiSectionRenderer"
import { PageSearchParamProps, PageParams } from "@/interface/page"

import { getPage } from "@/utils/garchi"
import { Metadata } from "next"



export async function generateMetadata({ searchParams, params }: PageSearchParamProps & PageParams): Promise<Metadata> {
  const slug = (await params).slug || "/"
 

  const page = await getPage(`/${slug}` as string, 'live') //live for production, draft in dev

  return {
    title: page?.title,
    description: page?.description,
    openGraph: {
      images: [page?.image!]
    }
  }
}

export default async function Page({ searchParams, params }: PageSearchParamProps & PageParams) {

  const slug = (await params).slug || "/"

  const page = await getPage(slug, 'live') //live for production, draft in dev

  if(!page)
    notFound()
    
  return (
    <>
      {page?.sections?.map((section, index) => (
        <GarchiSectionRenderer key={index} section={section} />
      ))}
    </>
}
```
---

In some cases there are nested sections. Below is the example in React. Note that in React there is built in children prop thus subsection is used to avoid conflicts. This shouldn't be a problem in other tech stack.


```tsx
"use client"

import React from 'react'
// StatItem.jsx

function StatItem({label, value, index = 0}: {label: string; value: string | number; index?: number}) {
    return (
        <motion.div 
            className="flex flex-col-reverse gap-y-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{
                duration: 0.6,
                delay: index * 0.15,
                ease: "easeOut"
            }}
        >
            <motion.dt 
                className="text-base/7 text-muted-foreground"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: index * 0.15 + 0.3 }}
            >
                {label}
            </motion.dt>
            <motion.dd 
                className="text-5xl font-semibold tracking-tight text-foreground"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ 
                    duration: 0.5, 
                    delay: index * 0.15 + 0.1,
                    ease: "easeOut"
                }}
                whileHover={{ 
                    scale: 1.05,
                    transition: { duration: 0.2 }
                }}
            >
                {value}
            </motion.dd>
        </motion.div>
    )
}
```


```tsx
"use client"

import React from 'react'
import { Heading } from '../common/Typography';
import Markdown from '../common/Markdown';
import { GarchiSection } from '@garchicms/garchi-node-sdk';
import { motion } from 'framer-motion';
import GarchiSectionRenderer from "@/components/garchi/GarchiSectionRenderer"

type Props = {
    title: string;
    description: string;
    subsections: GarchiSection[]
    [key: string]: unknown;
}

// in Garchi use this with StatItem

export default function TextWithStat({ title, description, subsections, ...props }: Props) {
    return (
        <motion.div 
            className="mx-auto -mt-12 max-w-7xl px-6 sm:mt-0 lg:px-8 xl:-mt-8" 
            {...props}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
        >
            <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <Heading as="h1" className="ttracking-tight text-pretty sm:text-5xl">{title}</Heading>
                </motion.div>
                
                <div className="mt-6 flex flex-col gap-x-8 gap-y-20 lg:flex-row">
                    <motion.div 
                        className="lg:w-full lg:max-w-2xl lg:flex-auto"
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                    >
                       <Markdown content={description} />
                    </motion.div>
                    
                    <motion.div 
                        className="lg:flex lg:flex-auto lg:justify-center"
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
                    >
                        <dl className="w-64 space-y-8 xl:w-80">
                            {subsections.map((section, index) => (
                                 <GarchiSectionRenderer key={index} section={section} />
                            ))}
                        </dl>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    )
}
```


## Data items rendering

Data items enables creating of reusable, dynamic content like blog posts, products, etc. to display on your site.
To know more about data items read [Garchi CMS Documentation](./garchi-cms-doc.md)  file in this folder.

Data items can be fetched using API or SDK.

Below is an example of fetching blog post data items using compound query utility and rendering them. Data items can be rendered using various ways depending upon the use cases. To know more read API spec or respective SDK documentation (Node, PHP).


```ts
import "server-only";
import { GarchiItemAPIResponse } from "@garchicms/garchi-node-sdk";
import {garchi} from '@/utils/garchi'


export async function getBlogPosts(page: number = 1, category = 235) {

    try {
        const posts = await garchi.compoundQuery.query({
            dataset: "items",
            fields: ["categories"],
            values: [category],
            conditions: ["eq"],
        }, {
            page: page,
            order_key: "meta.published_date",
            order_by: "desc",
            size: 9,
        })
        return posts as GarchiItemAPIResponse
    }
    catch (e) {
         // handle error
    }
}

export async function getPost(slug: string) {
    try {
        const post = await garchi.dataItem.get({
            item: slug
        })

        if (!post?.item_id)
            return notFound()

        return post
    }
    catch (e) {
        // handle error
    }
}
```

Then call this functions in page.tsx to render list of blog articles

```tsx
import { getBlogPosts } from "@/utils/garchi"
import Footer from "@/components/common/Footer"
import { PageParams } from "@/interface/page"
import { getPage } from "@/utils/garchi"
import { Metadata } from "next"
import PostCard from "./Card"
import PaginationLinks from "./PaginationLinks"

export const revalidate = 600 // 10 minutes

export const metadata: Metadata = {
  title: `${process.env.COMPANY_NAME} Blog`,
  description: `Tutorials, headless-CMS guides and startup tech tips from LumenHarbor mentors—your weekly beacon for modern stacks and growth hacks`,
}


export default async function Page({params}: PageParams) {

  const pageNumber = (await params).page || 1
  
    // getting page is optional. It is needed to get the common sections like Footer across pages,
  const page = await getPage("/", "draft")
  const footerProps = page?.sections.find(section => section.name == "Footer")?.props

  const posts = await getBlogPosts(page)

  if(posts?.data.length === 0)
    return redirect("/blog")

  return (
    <>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                {posts?.data?.map((post, index) => <PostCard key={post.item_id} post={post} index={index} />)}
        </div>

        <PaginationLinks lastPage={posts?.meta?.last_page as number} currentPage={posts?.meta?.current_page as number} />

        <Footer {...footerProps} />
    </>
  )
}
```

Then individual blog post can be rendered as below

```tsx
// app/blog/[slug]/page.tsx

import Footer from '@/components/common/Footer'
import Markdown from '@/components/common/Markdown'
import { Heading } from '@/components/common/Typography'
import { TracingBeam } from '@/components/ui/tracing-beam'
import { PageParams } from '@/interface/page'
import { flattenGarchiItemMeta } from '@/lib/utils'
import { getPage, getPost } from '@/utils/garchi'
import { GarchiItem } from '@garchicms/garchi-node-sdk'
import dayjs from 'dayjs'
import { Metadata } from 'next'
import Image from 'next/image'
import React from 'react'

export const revalidate = 3600

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
    const slug = (await params).slug as string
    const post = await getPost(slug)
    const meta = flattenGarchiItemMeta(post as GarchiItem)

    return {
        title: post?.name || "Blog Post",
        description: post?.one_liner || "Read our latest blog post",
        openGraph: {
            title: post?.name || "Blog Post",
            description: post?.one_liner || "Read our latest blog post",
            images: [post?.main_image || meta?.featured_image],
        }
    }
}


export default async function Page({ params }: PageParams) {

    const slug = (await params).slug as string
    const post = await getPost(slug) as GarchiItem
    const meta = flattenGarchiItemMeta(post)

    const page = await getPage("/", "draft")
    const footerProps = page?.sections.find(section => section.name == "Footer")?.props

    return (
        <>
            <div className="max-w-5xl mx-auto">
                <div className="relative aspect-video w-full md:w-3/4 rounded-xl overflow-hidden mx-auto my-6">
                    <Image
                        src={meta?.featured_image || post?.main_image}
                        alt={post.name || "Blog post image"}
                        fill={true}
                        objectFit="cover"
                        className="object-cover"
                    />
                </div>
                <Heading as="h3" className='my-5 text-center'>
                    {post?.name}
                </Heading>



                <TracingBeam>
                    <div className="p-10 md:p-3">
                        <div className="flex flex-col gap-2">
                            <span>{dayjs(meta?.published_at).format('MMMM D, YYYY')}</span>
                            <span className="text-gray-500 text-sm">By {meta?.author || "Unknown"}</span>
                        </div>
                        <Markdown content={post?.description as string} className='prose-img:rounded-xl' />
                    </div>
                </TracingBeam>
            </div>
            <Footer {...footerProps} />
        </>
    )
}
```

As the description of each data item in this case blog post is HTML, make sure to sanitise it to avoid xss attack.


## Preview mode.

To enable preview mode, first check if user has provided the preview token.
Preview token can be retrieved from the CMS dashboard by visiting Space Settings ----> Preview Token.

The Garchi CMS editor automatically pass the space preview token and slug in the URL as query parameter as ```?preview_token=Token&slug=urlSlug```

Example of Next JS draft mode API to enable preview mode. 

```ts
//app/api/draft/route.ts

import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
 
export async function GET(request: Request) {

  const { searchParams } = new URL(request.url)
  const previewToken = searchParams.get('preview_token')
  const slug = searchParams.get('slug')

  
  
  if (previewToken !== process.env.GARCHI_PREVIEW_TOKEN || !slug) {
    return new Response('Invalid token', { status: 401 })
  }
  
  const draft = await draftMode()
  draft.enable()

  redirect(slug)

}

```