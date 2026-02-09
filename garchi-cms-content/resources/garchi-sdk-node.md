# GarchiCMS Node SDK (API wrapper)

This document provides details about Garchi CMS Node sdk and its example usage for managing data items, categories, spaces, reviews, reactions, page content, and many more. 
The SDK is a thin wrapper over the REST API documented at https://garchi.co.uk/docs/v2.openapi



## Runtime and environment

- Target runtime: Node.js (ESM).
- Package name: @garchicms/garchi-node-sdk.
- Auth: API key via constructor or environment variable.

## Installation
Install the SDK using npm or yarn:

```bash
npm install @garchicms/garchi-node-sdk
```

## Initialization

Always initialize the SDK once and reuse it.

```ts
import GarchiCMS from "@garchicms/garchi-node-sdk";

const garchi = new GarchiCMS({
  api_key: process.env.GARCHI_API_KEY,
});
```

Key points:

- Uses the API base URL: https://garchi.co.uk/api/v2.
- Auth header: Bearer token from `api_key` or `GARCHI_API_KEY`.
- Optional custom headers are supported.

## Core module

The SDK organizes functionality into modules. The agent should select the smallest module that matches the task.

### Data items: `garchi.dataItem`

Use for CRUD, filtering, semantic search, and meta information.

Example: create item

```ts
const item = await garchi.dataItem.create({
  space_uid: "space_uid",
  name: "New Item",
  categories: [1, 2],
  price: 10,
});
```

Example: filter items by meta

```ts
const items = await garchi.dataItem.filterByMeta({
  query: { order_key: "name", order_by: "asc" },
  body: {
    meta_filters: [
      { key: "color", value: "red", operator: "equals" },
    ],
  },
});
```

### Categories: `garchi.category`

Use for category CRUD and listing.

Example: create category

```ts
const category = await garchi.category.create({
  category: "Shoes",
  space_uid: "space_uid",
});
```

### Spaces: `garchi.space`

Use for space CRUD, categories per space, and headless content lists.

Example: list pages in a space

```ts
const pages = await garchi.space.listPages("space_uid");
```

### Reviews: `garchi.review`

Use for review CRUD and pagination.

Example: get reviews for an item

```ts
const reviews = await garchi.review.getByItem(123, { size: 10, page: 1 });
```

### Reactions: `garchi.reaction`

Use to add or update reactions for reviews or items.

Example: react to a review

```ts
const reaction = await garchi.reaction.manage({
  reaction: "like",
  user_identifier: "user@example.com",
  review_id: 10,
  reaction_for: "review",
});
```

### Compound query: `garchi.compoundQuery`

Use for multi-field, multi-condition queries across datasets.

Example: compound query

```ts
const result = await garchi.compoundQuery.query(
  {
    dataset: "items",
    fields: ["name", "price"],
    conditions: ["like", "gte"],
    values: ["%shoe%", 25],
    logic: ["and"],
  },
  { order_key: "name", order_by: "asc" }
);
```

### Headless CMS: `garchi.headless`

Use for pages, assets, and section templates.

Example: fetch a page

```ts
const page = await garchi.headless.getPage({
  space_uid: "space_uid",
  slug: "/",
  lang: "en-US",
  mode: "live",
});
```

Example: create a page

```ts
const page = await garchi.headless.addPage({
  space_uid: "space_uid",
  title: "Home",
  path: "/",
  description: "Landing page",
});
```

## Pagination

Many list endpoints return a paginated response.

- Use `size` and `page` to control pagination.
- Read `links` and `meta` for navigation.

Example: paginated items

```ts
const items = await garchi.dataItem.getAll({ size: 20, page: 2 });
```

## Function reference with examples

Use this section when you need an exact method call. Each method includes a minimal example.

### Data items: `garchi.dataItem`

```ts
// create(params: CreateDataItemParams): Promise<GarchiItem>
await garchi.dataItem.create({
  space_uid: "space_uid",
  name: "Item name",
  categories: [1, 2],
  price: 19.99,
});

// delete(params: DeleteDataItemParams): Promise<string>
await garchi.dataItem.delete({ item_id: 1, space_uid: "space_uid" });

// update(params: UpdateDataItemParams): Promise<string>
await garchi.dataItem.update({
  item_id: 1,
  space_uid: "space_uid",
  name: "Updated name",
  price: 24.99,
});

// createMetaInfo(params: CreateMetaInfoParams): Promise<GarchiItemMeta[]>
await garchi.dataItem.createMetaInfo({
  item_id: 1,
  meta: [{ key: "color", type: "string", value: "red" }],
});

// deleteMetaInfo(params: DeleteMetaInfoParams): Promise<string>
await garchi.dataItem.deleteMetaInfo({
  meta_id: 10,
  item_id: 1,
  space_uid: "space_uid",
});

// updateMetaInfo(params: UpdateMetaInfoParams): Promise<string>
await garchi.dataItem.updateMetaInfo({
  meta_id: 10,
  item_id: 1,
  value: "blue",
});

// getBySpace(params: GetItemsBySpaceParams): Promise<GarchiItemAPIResponse>
await garchi.dataItem.getBySpace({ uid: "space_uid", page: 1, size: 20 });

// semanticSearch(params: SemanticSearchParams): Promise<GarchiItem[]>
await garchi.dataItem.semanticSearch({ q: "running shoe", threshold: 0.6 });

// featured(params: GetFeaturedItemsParams): Promise<GarchiItemAPIResponse>
await garchi.dataItem.featured({ description: "include" });

// get(params: GetItemParams): Promise<GarchiItem>
await garchi.dataItem.get({ item: 1, reactions: "include" });

// getAll(params: GetAllItemsParams): Promise<GarchiItemAPIResponse>
await garchi.dataItem.getAll({ page: 1, size: 10, search_keyword: "shoe" });

// filter(params: FilterItemsParams): Promise<GarchiItem[]>
await garchi.dataItem.filter({
  query: { order_key: "price", order_by: "asc" },
  body: { spaces: ["space_uid"], categories: [1], size: 20 },
});

// filterByMeta(params: FilterItemsByMetaParams): Promise<GarchiItem[]>
await garchi.dataItem.filterByMeta({
  body: { meta_filters: [{ key: "size", value: "10", operator: "equals" }] },
});

// getByIds(params: GetItemsByIdsParams): Promise<GarchiItemAPIResponse>
await garchi.dataItem.getByIds({ body: { item_ids: [1, "slug-2"] } });
```

### Categories: `garchi.category`

```ts
// create(params: CreateCategoryParams): Promise<GarchiCategory>
await garchi.category.create({ category: "Shoes", space_uid: "space_uid" });

// delete(params: DeleteCategoryParams): Promise<string>
await garchi.category.delete({ category_id: 1, space_uid: "space_uid" });

// update(params: UpdateCategoryParams): Promise<string>
await garchi.category.update({
  category_id: 1,
  category: "Sneakers",
  space_uid: "space_uid",
});

// getAll(): Promise<GarchiCategory[]>
await garchi.category.getAll();
```

### Spaces: `garchi.space`

```ts
// categories(space_uid: string): Promise<GarchiCategory[]>
await garchi.space.categories("space_uid");

// getAll(params: PaginateQueryParams): Promise<GarchiSpaceAPIResponse>
await garchi.space.getAll({ page: 1, size: 10 });

// get(space_uid: string): Promise<GarchiSpace>
await garchi.space.get("space_uid");

// create(params: GarchiSpaceCreate): Promise<GarchiSpace>
await garchi.space.create({ name: "New Space" });

// update(space_uid: string, params: { name?: string; logo?: File }): Promise<string>
await garchi.space.update("space_uid", { name: "Renamed Space" });

// delete(space_uid: string): Promise<string>
await garchi.space.delete("space_uid");

// listPages(space_uid: string): Promise<CreatePageResponse[]>
await garchi.space.listPages("space_uid");

// listSectionTemplates(space_uid: string): Promise<SectionTemplate[]>
await garchi.space.listSectionTemplates("space_uid");
```

### Reviews: `garchi.review`

```ts
// create(params: GarchiReviewCreate): Promise<GarchiReview>
await garchi.review.create({
  item_id: 1,
  rating: 5,
  review_body: "Excellent",
  user_email: "user@example.com",
  user_name: "Jane",
});

// update(params: GarchiReviewUpdate): Promise<string>
await garchi.review.update({ review_id: 10, rating: 4, review_body: "Updated" });

// delete(review_id: number): Promise<string>
await garchi.review.delete(10);

// getByItem(item_id: number | string, queryParams: PaginateQueryParams): Promise<PaginatedResponse<GarchiReview>>
await garchi.review.getByItem(1, { page: 1, size: 10 });
```

### Reactions: `garchi.reaction`

```ts
// manage(params: GarchiReactionCreate): Promise<GarchiReaction>
await garchi.reaction.manage({
  reaction: "like",
  user_identifier: "user@example.com",
  item_id: 1,
  reaction_for: "item",
});
```

### Compound query: `garchi.compoundQuery`

```ts
// query(body: CompoundQueryBody, params: ItemsQueryParams): Promise<GarchiItemAPIResponse | GarchiCategoryAPIResponse | PaginatedResponse<GarchiReview>>
await garchi.compoundQuery.query(
  {
    dataset: "items",
    fields: ["name", "price"],
    conditions: ["like", "gte"],
    values: ["%shoe%", 25],
    logic: ["and"],
  },
  { order_key: "name", order_by: "asc" }
);
```

### Headless CMS: `garchi.headless`

```ts
// getAsset(file_name: string, space_uid: string): Promise<GarchiAsset>
await garchi.headless.getAsset("logo.png", "space_uid");

// getPage(params: GetPageParams): Promise<GarchiPage>
await garchi.headless.getPage({ space_uid: "space_uid", slug: "/", mode: "live" });

// createOrUpdateSectionTemplates(params: CreateOrUpdateSectionTemplateParams): Promise<string>
await garchi.headless.createOrUpdateSectionTemplates({
  space_uid: "space_uid",
  section_templates: [
    { name: "Hero", description: "Hero section", props: [{ key: "title", type: "text" }] },
  ],
});

// addPage(params: CreatePageRequest): Promise<CreatePageResponse>
await garchi.headless.addPage({
  space_uid: "space_uid",
  title: "Home",
  path: "/",
  description: "Landing page",
});

// addBlankSectionToPage(params: BlankSectionRequest): Promise<BlankSectionResponse>
await garchi.headless.addBlankSectionToPage({
  page_id: "page_id",
  section_template_id: "template_id",
});
```

## Type definitions (SDK)

Use these TypeScript definitions to validate input/output structures.

```ts
export interface PaginationLinks {
  first: string;
  last: string;
  prev: string | null;
  next: string | null;
}

export interface PaginationMeta {
  current_page: number;
  from: number;
  last_page: number;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  path: string;
  per_page: number;
  to: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

export interface GetPageParams {
  space_uid: string;
  slug: string;
  lang?: string;
  mode?: "draft" | "live";
}

export type BlankSectionRequest = {
  page_id: string;
  section_template_id: string;
  parent_id?: string;
};

export type BlankSectionResponse = {
  id: string;
  name: string;
  description?: string;
  parent_id?: string | null;
  order: number;
  page_id: string;
  section_template_id: string;
};

export type CreatePageRequest = {
  space_uid: string;
  title: string;
  path: string;
  description: string;
};

export type CreatePageResponse = {
  id: string;
  title: string;
  path?: string;
  slug?: string;
  description: string;
  image?: string;
  created_at?: string;
  last_updated?: string;
  updated_at?: string;
};

export type GarchiPage = {
  id: string;
  title: string;
  slug: string;
  description: string;
  image?: string;
  sections: GarchiSection[];
};

export type SectionPropType =
  | "text"
  | "longtext"
  | "media"
  | "richtext"
  | "select"
  | "date"
  | "icon_hero"
  | "icon_lucid";

export interface SectionTemplateProp {
  key: string;
  type: SectionPropType;
  allowed_values?: string;
}

export interface SectionTemplate {
  name: string;
  description?: string;
  prev_name?: string;
  props?: SectionTemplateProp[];
  id?: string;
}

export interface CreateOrUpdateSectionTemplateParams {
  space_uid: string;
  section_templates: SectionTemplate[];
}

export type GarchiSection = {
  id: string;
  name: string;
  description?: string;
  props: {
    [key: string]: unknown;
  };
  children: GarchiSection[];
  order: number;
};

export type GarchiReviewCreate = {
  item_id: number;
  rating: number;
  review_body: string;
  user_email?: string;
  user_name?: string;
  parent_id?: number;
};

export type GarchiReviewUpdate = {
  review_id: number;
  review_body?: string;
  rating: number;
};

export type GarchiReactionCreate = {
  reaction: string;
  user_identifier: string;
  review_id?: number;
  item_id?: number;
  reaction_for: "review" | "item";
};

export type GarchiReaction = {
  reaction_id: string;
  reaction: string;
  user_identifier: string;
  created_at: string;
  updated_at: string;
};

export type GarchiReview = {
  review_id: number;
  review_body: string;
  rating: number;
  guest: null;
  user: {
    fname: string;
    lname: string;
  };
  item_id: number;
  reviewed_at: string;
  replies?: GarchiReview[];
  reactions?: GarchiReaction[];
};

export type GarchiCategory = {
  id: number;
  name: string;
};

export type GarchiAttributeOption = {
  id: number;
  name: string;
  price: number;
};

export type GarchiAttribute = {
  id: number;
  name: string;
  min: string;
  options: GarchiAttributeOption[];
};

export type GarchiSpace = {
  uid: string;
  name: string;
  logo_url?: string;
  number_of_items: number;
};

export type GarchiSpaceCreate = {
  name: string;
  logo?: File;
};

export type GarchiSpaceAPIResponse = PaginatedResponse<GarchiSpace>;

export type GarchiItemMeta = {
  id?: number;
  key: string;
  value: string;
  type: string;
};

export type GarchiItem = {
  item_id: number;
  slug: string;
  sku?: string;
  name: string;
  stock?: number;
  categories: GarchiCategory[];
  price?: number;
  external_link?: string;
  scratched_price?: number | null;
  one_liner?: string;
  description?: string;
  delivery_type?: string;
  main_image?: string;
  other_images?: string[];
  attributes?: GarchiAttribute[];
  space?: GarchiSpace;
  avg_rating?: number | null;
  scheduled_for?: string | null;
  item_meta?: GarchiItemMeta[];
  reactions?: GarchiReaction[];
  created?: string;
  updated?: string;
};

export type GarchiItemAPIResponse = PaginatedResponse<GarchiItem>;

export type GarchiCategoryAPIResponse = PaginatedResponse<GarchiCategory>;

export type GarchiAsset = {
  id: string;
  path: string;
  size: string;
  type: string;
};

export type GarchiCMSInitOptions = {
  api_key?: string;
  headers?: Record<string, string | number | boolean>;
};

export interface CreateDataItemParams {
  space_uid: string;
  name: string;
  categories: number[];
  sku?: string;
  stock?: number;
  price?: number;
  scratched_price?: number;
  detail_description?: string;
  external_url?: string;
  slug?: string;
}

export interface DeleteDataItemParams {
  item_id: number;
  space_uid: string;
}

export interface UpdateDataItemParams {
  item_id: number;
  space_uid: string;
  name?: string;
  sku?: string;
  stock?: number;
  categories?: number[];
  price?: number;
  scratched_price?: number;
  detail_description?: string;
  external_url?: string;
  make_public?: boolean;
  slug?: string;
}

export type MetaType =
  | "string"
  | "array"
  | "url"
  | "object"
  | "numeric"
  | "email"
  | "date"
  | "color"
  | "icon_hero"
  | "icon_lucid";

export interface MetaInfo {
  key: string;
  type: MetaType;
  value: string;
}

export interface CreateMetaInfoParams {
  item_id: number;
  meta: MetaInfo[];
}

export interface DeleteMetaInfoParams {
  meta_id: number;
  item_id: number;
  space_uid: string;
}

export interface UpdateMetaInfoParams {
  meta_id: number;
  item_id: number;
  key?: string;
  type?: MetaType;
  value?: string;
}

export interface PaginateQueryParams {
  size?: number;
  page?: number;
}

export interface ItemsQueryParams extends PaginateQueryParams {
  order_key?: "name" | "price" | "created" | `meta.${string}`;
  order_by?: "asc" | "desc";
  reactions?: "include" | "exclude";
  description?: "include" | "exclude";
}

export interface GetItemsBySpaceParams extends ItemsQueryParams {
  uid: string;
}

export interface SemanticSearchParams {
  q: string;
  threshold?: number;
  reactions?: "include" | "exclude";
  description?: "include" | "exclude";
}

export interface GetFeaturedItemsParams {
  reactions?: "include" | "exclude";
  description?: "include" | "exclude";
}

export interface GetItemParams {
  item: string | number;
  reactions?: "include" | "exclude";
}

export interface GetAllItemsParams extends ItemsQueryParams {
  search_keyword?: string;
}

export interface FilterItemsBodyParams {
  spaces?: string[];
  categories?: number[];
  priceOrder?: "low-high" | "high-low";
  size?: number;
}

export interface FilterItemsParams {
  query?: ItemsQueryParams;
  body: FilterItemsBodyParams;
}

export type MetaFilterOperator = "equals" | "in" | "like" | "gte" | "lte";

export interface MetaFilter {
  key: string;
  value: string | number | (string | number)[];
  operator: MetaFilterOperator;
}

export interface FilterItemsByMetaBodyParams {
  meta_filters: MetaFilter[];
}

export interface FilterItemsByMetaParams {
  query?: ItemsQueryParams;
  body: FilterItemsByMetaBodyParams;
}

export interface GetItemsByIdsBodyParams {
  item_ids: (number | string)[];
}

export interface GetItemsByIdsParams {
  query?: ItemsQueryParams;
  body: GetItemsByIdsBodyParams;
}

export interface CreateCategoryParams {
  category: string;
  space_uid: string;
}

export interface DeleteCategoryParams {
  category_id: number;
  space_uid: string;
}

export interface UpdateCategoryParams extends CreateCategoryParams {
  category_id: number;
}

export type DatasetType = "items" | "categories" | "reviews";

export type ItemFields =
  | "item_id"
  | "name"
  | "slug"
  | "description"
  | "categories"
  | "ratings"
  | "price"
  | "created";

export type CategoryFields = "category_id" | "category_name";
export type ReviewFields = "review_id" | "item_id" | "rating" | "review" | "created";

export type ConditionType =
  | "eq"
  | "gte"
  | "lte"
  | "gt"
  | "lt"
  | "like"
  | "in"
  | "not_eq"
  | "not_in";

export type LogicType = "and" | "or";

export interface CompoundQueryBody {
  dataset: DatasetType;
  fields: string[];
  conditions: ConditionType[];
  values: (string | number)[];
  logic?: LogicType[];
}
```

## Error handling 

All SDK calls throw on failure. Wrap calls in try/catch and surface context.

```ts
try {
  const item = await garchi.dataItem.get({ item: 123 });
  console.log(item);
} catch (err) {
  console.error("Garchi API error", err);
}
```

Guidelines:

- Preserve API error payloads for debugging.
- Avoid retrying non-idempotent operations blindly.
- On network errors, consider retry with backoff.

## Data modeling 

Understand key types:

- `GarchiItem`, `GarchiCategory`, `GarchiReview`, `GarchiSpace`.
- `GarchiPage`, `GarchiSection`, `SectionTemplate` for headless content.
- `PaginatedResponse<T>` for lists.

Use typed interfaces to validate payload structure in your agent logic.

## Safety and integrity 

- Never expose the API key in logs or responses.
- Validate user input before passing to SDK methods.
- Prefer read-only calls when exploring data.
- For write operations, confirm intent and required fields.

## Troubleshooting 

Common issues and remedies:

- 401/403: missing or invalid API key.
- 404: wrong `space_uid`, `item_id`, or page path.
- 422/400: missing required fields or invalid types.

## Agent workflow checklist

1. Confirm the goal (read vs write).
2. Choose the correct module.
3. Validate required fields and IDs.
4. Execute with try/catch.
5. Return structured, minimal output (avoid secrets).
6. If paginated, ask whether to fetch more pages.

## Reference

- Public API docs: https://garchi.co.uk/documentation/1.0/sdk/node

